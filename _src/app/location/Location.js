define([
    'app/config',
    'app/_InProgressCacheMixin',
    './../Domains',
    './../_SelectPopulate',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/query',
    'dojo/text!app/location/templates/Location.html',
    'dojo/topic',
    'dojo/_base/declare',

    'localforage',

    'app/location/StartDistDirGeoDef',
    'app/location/StartEndGeoDef',
    'app/location/Station',
    'app/location/VerifyMap'
], function (
    config,
    _InProgressCacheMixin,
    Domains,
    _SelectPopulate,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    query,
    template,
    topic,
    declare,

    localforage
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _InProgressCacheMixin, _SelectPopulate], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'location',

        // cacheId: String
        //      used by _InProgressCacheMixin
        cacheId: 'app/location',

        // currentGeoDef: StartDistDirGeoDef || StartEndGeoDef
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

            this.fields = [
                {
                    control: this.weatherSelect,
                    fieldName: config.fieldNames.samplingEvents.WEATHER
                }, {
                    control: this.surveyPurposeSelect,
                    fieldName: config.fieldNames.samplingEvents.PURPOSE
                }
            ];

            this.featureServiceUrl = config.urls.samplingEventsFeatureService;

            this.populateSelects();

            this.inherited(arguments);
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
                topic.subscribe(config.topics.startDistDirGeoDef_onDistanceChange, function (dist) {
                    that.streamLengthTxt.value = dist;
                }),
                topic.subscribe(config.topics.newCollectionEvent, function () {
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
                config.app.map.removeLayer(this.geometry);
                this.geometry = null;
            }

            $(this.verifyMapBtn).button('loading');

            this.validateMsg.innerHTML = '';
            domClass.add(this.validateMsg, 'hidden');

            returnedValue = this.currentGeoDef.getGeometry();

            var onError = function (msg) {
                that.setValidateMsg(msg);
                $(that.verifyMapBtn).button('reset');
            };
            if (typeof returnedValue === 'string') {
                onError(returnedValue);
            } else {
                returnedValue.then(function (response) {
                    if (response.success) {
                        that.addLineToMap(response.path);
                        that.utmGeo = response.utm;
                        that.utmGeo.spatialReference = {wkid: 26912};
                        that.cacheInProgressData();
                    } else {
                        onError(response.error_message);
                    }
                },
                onError);
            }
        },
        addLineToMap: function (path) {
            // summary:
            //      adds the path to the map
            var calculateDistance = function (line) {
                var latLngArray = line._latlngs[0];
                var distance = 0;
                for (var i = 0; i < latLngArray.length - 1; i++) {
                    distance += latLngArray[i].distanceTo(latLngArray[i + 1]);
                }

                return distance;
            };
            console.log('app/location/Location:addLineToMap', arguments);

            this.verifyMapBtn.innerHTML = this.successfullyVerifiedMsg;

            var line = L.polyline(path, {color: 'red'}).addTo(config.app.map);
            this.path = path;
            config.app.map.fitBounds(line.getBounds().pad(0.1));
            this.geometry = line;
            var streamDistance = calculateDistance(this.geometry);
            this.streamLengthTxt.value = streamDistance.toFixed();
        },
        getAdditionalCacheData: function () {
            // summary:
            //      cache the current utmGeo prop
            console.log('app/location/Location:getAdditionalCacheData', arguments);

            if (this.utmGeo) {
                return {
                    utmGeo: this.utmGeo,
                    path: this.path
                };
            }

            return {};
        },
        hydrateWithInProgressData: function () {
            // summary:
            //      add utmGeo which isn't covered in _InProgressCacheMixin
            console.log('app/location/Station:hydrateWithInProgressData', arguments);

            var that = this;
            var args = arguments;
            localforage.getItem(this.cacheId).then(function hydrateGeometry(inProgressData) {
                // this code needs to be run before the inherited method so that
                // getAdditionalCacheData (which is fired when the numeric text box is updated)
                // returns the correct data
                if (inProgressData && inProgressData.utmGeo) {
                    try {
                        $(that.verifyMapBtn).button('loading');
                        that.utmGeo = inProgressData.utmGeo;
                        that.path = inProgressData.path;
                    } catch (error) {
                        console.error('error loading cached geometry', error);
                        that.clearGeometry();
                    }
                }
                that.inherited(args).then(function () {
                    // this needs to be here since it sets the text on the verify btn
                    // and it needs to wait for $(that.verifyMapBtn).button('loading'); to finish
                    // which is async
                    if (inProgressData && inProgressData.path) {
                        that.addLineToMap(inProgressData.path);
                    }
                });
            });
        },
        setValidateMsg: function (txt) {
            // summary:
            //      shows a red error message
            // txt: String
            console.log('app/location/Location:setValidateMsg', arguments);

            if (txt.trim().length === 0) {
                domClass.add(this.validateMsg, 'hidden');
            } else {
                domClass.remove(this.validateMsg, 'hidden');
            }
            this.validateMsg.innerHTML = txt;
        },
        clearValidation: function () {
            // summary:
            //      description
            console.log('app/location/Location:clearValidation', arguments);

            $(this.verifyMapBtn).button('reset');
            domClass.add(this.validateMsg, 'hidden');
            this.validateMsg.innerHTML = '';
            this.clearGeometry();
        },
        clearGeometry: function () {
            // summary:
            //      removes the polyline from the map if one exists
            console.log('app/location/Location:clearGeometry', arguments);

            if (this.geometry) {
                config.app.map.removeLayer(this.geometry);
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
            }

            return true;
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
