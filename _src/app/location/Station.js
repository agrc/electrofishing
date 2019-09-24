define([
    'app/config',
    'app/Domains',
    'app/location/VerifyMap',
    'app/_InProgressCacheMixin',
    'app/_SubmitJobMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/json',
    'dojo/text!app/location/templates/Station.html',
    'dojo/topic',
    'dojo/_base/declare',

    'dojox/uuid/generateRandomUuid',

    'app/location/StationPointDef',
    'bootstrap'
], function (
    config,
    Domains,
    VerifyMap,
    _InProgressCacheMixin,
    _SubmitJobMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    domStyle,
    json,
    template,
    topic,
    declare,

    generateRandomUuid
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _SubmitJobMixin, _InProgressCacheMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'station',

        // stationsObj: {}
        //      The stations as an object with GUIDs as the keys
        stationsObj: {},

        // vMap: app/location/VerifyMap
        //      The map used when creating a new station
        vMap: null,

        // fGroup: L.FeatureGroup
        //      the group that holds the point
        fGroup: null,

        // validateMsgs: Object
        //      The invalid messages displayed for this dialog
        validateMsgs: {
            name: 'A station name is required!',
            type: 'A stream type is required!',
            point: 'A valid point location is required!',
            waterId: 'A stream or lake must be selected!'
        },

        // newStationErrMsg: String;
        //      the message displayed when there is a problem with the new station service
        newStationErrMsg: 'There was an error submitting the station!',

        // newStation: ESRI Feature
        //      used to store it for later insertion into stationsObj
        newStation: null,

        // selectedIcon: L.Icon
        //      An icon to represent a selected station.
        selectedIcon: null,

        // cacheId: String
        //      used by _InProgressCacheMixin
        cacheId: 'app/location/station',


        // passed in via the constructor

        // mainMap: app/location/VerifyMap
        //      The main map on the location tab page
        mainMap: null,

        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/location/Station:postCreate', arguments);

            var that = this;

            var initCombobox = function () {
                $(that.streamTypeSelect).combobox();
            };

            Domains.populateSelectWithDomainValues(this.streamTypeSelect,
                config.urls.stationsFeatureService,
                config.fieldNames.stations.STREAM_TYPE).then(initCombobox);

            this.wireEvents();

            this.inherited(arguments);
        },
        wireEvents: function () {
            // summary:
            //      wires the events for the widget
            console.log('app/location/Station:wireEvents', arguments);

            var that = this;
            $(this.stationDialog).on('shown.bs.modal', function () {
                that.onDialogShown();
            });
            $(this.stationDialog).on('hidden.bs.modal', function () {
                that.onDialogHidden();
            });

            this.connect(this.submitBtn, 'click', 'onSubmit');

            this.own(topic.subscribe(config.topics.onStationClick, function (params) {
                that.stationTxt.value = params[0];
                that.currentGuid = params[1];
                that.cacheInProgressData();
            }));

            this.own(topic.subscribe(config.topics.pointDef_onBtnClick, this.onPointDefSelected.bind(this)));
        },
        onDialogShown: function () {
            // summary:
            //      fires when the user clicks on the new station button
            console.log('app/location/Station:onDialogShown', arguments);

            var setView = function (movedMap, otherMap) {
                otherMap.map.setView(movedMap.map.getCenter(), movedMap.map.getZoom());
            };
            if (this.vMap) {
                setView(this.mainMap, this.vMap);
            } else {
                this.vMap = new VerifyMap({isMainMap: false}, this.mapDiv);
                setView(this.mainMap, this.vMap);
                this.fGroup = new L.FeatureGroup().addTo(this.vMap.map);
                this.pointDef.setMap(this.vMap.map, this.fGroup);
            }
        },
        onDialogHidden: function () {
            // summary:
            //      fires when the user cancels new station dialog
            console.log('app/location/Station:onDialogHidden', arguments);

            this.mainMap.map.setView(this.vMap.map.getCenter(), this.vMap.map.getZoom());
        },
        getStationId: function () {
            // summary:
            //      returns the currently selected station's guid
            console.log('app/location/Station:getStationId', arguments);

            return this.currentGuid;
        },
        clear: function () {
            // summary:
            //        clears the textbox values and map selections
            console.log('app/location/Station:clear', arguments);

            this.stationTxt.value = '';
            this.streamLakeInput.value = '';

            this.mainMap.clearSelection();
            this.vMap.clearSelection();
        },
        onError: function () {
            // summary:
            //      displayed an error message when the service fails
            // err: error object
            console.log('app/location/Station:onError', arguments);

            this.validateMsg.innerHTML = this.newStationErrMsg;
            $(this.submitBtn).button('reset');
            this.newStation = null;
        },
        onSubmit: function () {
            // summary:
            //      description
            console.log('app/location/Station:onSubmit', arguments);

            var feature = this.validate();

            if (feature) {
                $(this.submitBtn).button('loading');

                feature.attributes[config.fieldNames.stations.STATION_ID] = this.getGUID();

                this.newStation = feature;

                var data = {
                    f: 'json',
                    point: json.stringify({
                        displayFieldName: '',
                        geometryType: 'esriGeometryPoint',
                        spatialReference: {
                            wkid: 26912,
                            latestWkid: 26912
                        },
                        features: [feature]
                    })
                };

                this.submitJob(data, config.urls.newStationService);
            }
        },
        onSuccessfulSubmit: function () {
            // summary:
            //      description
            console.log('app/location/Station:onSuccessfulSubmit', arguments);

            domStyle.set(this.successMsg, 'display', 'block');

            var that = this;

            var onMapLoad = function () {
                $(that.stationDialog).modal('hide');
                domStyle.set(that.successMsg, 'display', 'none');
                that.mainMap.stationsLyr.off('load', onMapLoad);
            };
            this.mainMap.stationsLyr.on('load', onMapLoad);

            $(this.submitBtn).button('reset');

            // clear form
            this.stationNameTxt.value = '';
            $(this.streamTypeSelect).data('combobox').clearTarget();
            $(this.streamTypeSelect).data('combobox').clearElement();
            this.pointDef.clear();
            this.streamLakeInput.value = '';
            this.onPointDefSelected();

            topic.publish(config.topics.onStationClick, [
                this.newStation.attributes[config.fieldNames.stations.NAME],
                this.newStation.attributes[config.fieldNames.stations.STATION_ID]
            ]);

            var point = this.pointDef.utm83crs.projection.unproject(
                new L.Point(this.newStation.geometry.x, this.newStation.geometry.y));
            this.mainMap.map.setView(point, 14);
            this.mainMap.selectStation(this.newStation.attributes[config.fieldNames.stations.STATION_ID]);
            this.mainMap.stationsLyr.refresh(); // check on using stationsLyr.addFeature() instead of geoprocessing tool
        },
        validate: function () {
            // summary:
            //      validates all of the values necessary to submit to create a new station.
            //      if the form does not validate then it shows an error message
            // returns: False || {}
            //      False if invalid, otherwise an object with all of the values
            console.log('app/location/Station:validate', arguments);

            var name = this.stationNameTxt.value.trim();
            const waterId = this.streamLakeInput.value.trim();
            var type = this.streamTypeSelect.value;
            var point = this.pointDef.getPoint();
            var msg;
            var returnValue;

            /* eslint-disable no-negated-condition */
            if (name === '') {
                msg = this.validateMsgs.name;
                returnValue = false;
            } else if (type === '') {
                msg = this.validateMsgs.type;
                returnValue = false;
            } else if (!point) {
                msg = this.validateMsgs.point;
                returnValue = false;
            } else if (waterId === '') {
                msg = this.validateMsgs.waterId;
            } else {
                msg = '';
                returnValue = {
                    geometry: {x: point.x, y: point.y, spatialReference: {wkid: 26912}},
                    attributes: {}
                };
                returnValue.attributes[config.fieldNames.stations.NAME] = name;
                returnValue.attributes[config.fieldNames.stations.STREAM_TYPE] = type;
                returnValue.attributes[config.fieldNames.stations.WATER_ID] = waterId;
            }
            /* eslint-enable no-negated-condition */

            this.validateMsg.innerHTML = msg;

            return returnValue;
        },
        getGUID: function () {
            // summary:
            //      returns a guid
            // returns: String
            console.log('app/location/Station:getGUID', arguments);

            return '{' + generateRandomUuid() + '}';
        },
        getAdditionalCacheData: function () {
            // summary:
            //      add currentGuid to cache
            // param or return
            console.log('app/location/Stations:getAdditionalCacheData', arguments);

            return {
                currentGuid: this.currentGuid
            };
        },
        hydrateWithInProgressData: function () {
            // summary:
            //      add population of this.currentGuid which isn't covered in _InProgressCacheMixin
            console.log('app/location/Station:hydrateWithInProgressData', arguments);

            var that = this;
            this.inherited(arguments).then(function hydrateCurrentGuid(inProgressData) {
                if (inProgressData) {
                    that.currentGuid = inProgressData.currentGuid;
                    that.mainMap.selectStation(that.currentGuid);
                }
            });
        },
        onToggleStreamLake() {
            // summary:
            //      fires when the user clicks the stream lake button
            console.log('app/location/Station:onToggleStreamLake', arguments);

            if (!domClass.contains(this.streamLakeBtn, 'active')) {
                // button is being selected...
                topic.publish(config.topics.pointDef_onBtnClick, this);
                this.vMap.streamsLyr.on('click', this.onWaterBodyClick.bind(this));
                this.vMap.lakesLyr.on('click', this.onWaterBodyClick.bind(this));
            }
        },
        onPointDefSelected() {
            // summary:
            //      The user has selected the point def button (not unselected)
            console.log('app/location/Station:onPointDefSelected', arguments);

            // unselected stream lake button
            domClass.remove(this.streamLakeBtn, 'active');

            if (this.vMap) {
                this.vMap.streamsLyr.off('click', this.onWaterBodyClick.bind(this));
                this.vMap.lakesLyr.off('click', this.onWaterBodyClick.bind(this));
            }
        },
        onWaterBodyClick(event) {
            // summary:
            //      The user has clicks on a stream or lake feature on the map
            console.log('app/location/Station:onWaterBodyClick', arguments);

            this.vMap.streamsLyr.resetStyle();
            this.vMap.lakesLyr.resetStyle();

            event.layer.setStyle({ color: config.colors.selected });

            this.streamLakeInput.value =
                event.layer.feature.properties[config.fieldNames.reference.Permanent_Identifier];
        }
    });
});
