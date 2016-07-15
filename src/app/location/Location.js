define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/query',
    'dojo/text!app/location/templates/Location.html',
    'dojo/topic',
    'dojo/_base/declare',

    'app/location/IDGeoDef',
    'app/location/StartDistDirGeoDef',
    'app/location/StartEndGeoDef',
    'app/location/Station',
    'app/location/VerifyMap'
],

function (
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    query,
    template,
    topic,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'location',

        // currentGeoDef: IDGeoDef || StartDistDirGeoDef || StartEndGeoDef
        //      the currently selected geometry definition tab
        currentGeoDef: null,

        // geometry:
        //      L.Polyline
        geometry: null,

        // successfullyVerifiedMsg: String
        //      message displayed on the verify location button after success
        successfullyVerifiedMsg: 'Successfully verified!',

        // invalidateConnectHandle: connect handle
        //      see onGeoDefChange
        invalidateConnectHandle: null,

        // invalidLocationMsg: String
        //      see hasValidLocation
        invalidLocationMsg: 'No valid location defined! You may need to verify the location.',

        // invalidStationMsg: String
        //      see hasValidLocation
        invalidStationMsg: 'Please define a station!',

        // invalidStreamLength: String
        //      see hasValidLocation
        invalidStreamLength: 'Please specify a stream length!',

        // dateRequiredMsg: String
        //      see hasValidLocation
        dateRequiredMsg: 'Please specify a collection date!',

        // utmGeo: ESRI Geometry Feature
        //      the geometry of the stream segment in utm
        utmGeo: null,

        // geoDef: The value that will go into
        //      description
        geoDef: null,

        constructor: function () {
            // summary:
            //    description
            console.log('app/location/Location:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/location/Location:postCreate', arguments);

            this.wireEvents();

            // default to start end
            this.currentGeoDef = this.startEndGeoDef;
            this.invalidateConnectHandle =
                this.connect(this.currentGeoDef, 'onInvalidate', 'clearValidation');

            this.station.mainMap = this.verifyMap;
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/location/Location:wireEvents', arguments);

            var that = this;

            this.own(
                query('.nav-pills a', this.domNode).on('click', function (evt) {
                    that.onGeoDefChange(evt);
                }),
                this.connect(this.verifyMapBtn, 'click', function () {
                    that.validateGeometry();
                }),
                topic.subscribe(AGRC.topics.startDistDirGeoDef_onDistanceChange, function (dist) {
                    that.streamLengthTxt.value = dist;
                }),
                topic.subscribe(AGRC.topics.newCollectionEvent, function () {
                    if (!that.verifyMap.map) {
                        that.verifyMap.initMap();
                    }
                })
            );
        },
        onGeoDefChange: function (evt) {
            // summary:
            //      fires when the user clicks on the geo def tab pills
            // evt: OnclickEventObject
            console.log('app/location/Location:onGeoDefChange', arguments);

            var geoDefID;

            this.currentGeoDef.clearGeometry();
            geoDefID = evt.target.id.slice(0, -3) + 'GeoDef';
            this.currentGeoDef = this[geoDefID];
            this.disconnect(this.invalidateConnectHandle);
            this.invalidateConnectHandle =
                this.connect(this.currentGeoDef, 'onInvalidate', 'clearValidation');
            this.clearValidation();
        },
        validateGeometry: function () {
            // summary:
            //      description
            console.log('app/location/Location:validateGeometry', arguments);

            var returnedValue;
            var that = this;

            if (this.geometry) {
                AGRC.app.map.removeLayer(this.geometry);
                this.geometry = null;
            }

            $(this.verifyMapBtn).button('loading');

            this.validateMsg.innerHTML = '';

            returnedValue = this.currentGeoDef.getGeometry();

            if (typeof returnedValue === 'string') {
                this.setValidateMsg(returnedValue);
                $(this.verifyMapBtn).button('reset');
            } else {
                returnedValue.then(function (values) {
                    that.verifyMapBtn.innerHTML = that.successfullyVerifiedMsg;
                    var line = L.multiPolyline(values.path, {color: 'blue'}).addTo(AGRC.app.map);
                    AGRC.app.map.fitBounds(line.getBounds().pad(0.1));
                    that.geometry = line;
                    that.utmGeo = values.utm;
                },
                function (errorMsg) {
                    that.setValidateMsg(errorMsg);
                    $(that.verifyMapBtn).button('reset');
                });
            }
        },
        setValidateMsg: function (txt) {
            // summary:
            //      shows a red error message
            // txt: String
            console.log('app/location/Location:setValidateMsg', arguments);

            this.validateMsg.innerHTML = txt;
        },
        clearValidation: function () {
            // summary:
            //      description
            console.log('app/location/Location:clearValidation', arguments);

            $(this.verifyMapBtn).button('reset');
            this.validateMsg.innerHTML = '';
            this.clearGeometry();
        },
        clearGeometry: function () {
            // summary:
            //      removes the polyline from the map if one exists
            console.log('app/location/Location:clearGeometry', arguments);

            if (this.geometry) {
                AGRC.app.map.removeLayer(this.geometry);
                this.geometry = null;
            }
        },
        hasValidLocation: function () {
            // summary:
            //      returns a string if not valid otherwise true
            console.log('app/location/Location:hasValidLocation', arguments);

            if (!this.geometry) {
                return this.invalidLocationMsg;
            } else if (this.station.stationTxt.value.length === 0) {
                return this.invalidStationMsg;
            } else if (this.streamLengthTxt.value.length === 0) {
                return this.invalidStreamLength;
            } else if (this.dateTxt.value === '') {
                return this.dateRequiredMsg;
            } else {
                return true;
            }
        },
        clear: function () {
            // summary:
            //        clears the location portion of the report
            console.log('app/location/Location:clear', arguments);

            this.clearValidation();
            this.station.clear();
            this.currentGeoDef.clearGeometry();
            this.streamLengthTxt.value = '';
            this.additionalNotesTxt.value = '';
            this.dateTxt.value = '';
        },
        destroy: function () {
            // summary:
            //      description
            console.log(this.declaredClass + '::destroy', arguments);

            this.startEndGeoDef.destroy();
            this.inherited(arguments);
        }
    });
});
