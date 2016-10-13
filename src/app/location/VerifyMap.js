define([
    'app/config',
    'app/StreamSearch',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-style',
    'dojo/string',
    'dojo/text!app/location/templates/VerifyMap.html',
    'dojo/text!app/templates/StationPopupTemplate.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri-leaflet/dist/esri-leaflet-debug',

    'leaflet'
], function (
    config,
    StreamSearch,

    _TemplatedMixin,
    _WidgetBase,

    domStyle,
    dojoString,
    template,
    stationPopupTemplate,
    topic,
    array,
    declare,
    lang,

    esriLeaflet
) {
    L.esri = esriLeaflet;
    // load these script synchronously because the order matters
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'verify-map',

        // map: L.map
        //      The leaflet map
        map: null,

        // stationsLyr: esriLeaflet.FeatureLayer
        stationsLyr: null,

        // selectedIcon: L.Icon
        //      An icon to represent a selected station.
        selectedIcon: null,

        // defaultIcon: L.Icon
        //      The default icon used to show stations on the map.
        defaultIcon: null,

        // parameters passed in via the constructor
        // isMainMap: Boolean
        //      If true then this is the map on the main report page.
        //      Used in initMap
        isMainMap: null,

        constructor: function () {
            // summary:
            //    description
            console.log('app/location/VerifyMap:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/location/VerifyMap:postCreate', arguments);

            if (!this.isMainMap) {
                this.initMap();
            }

            this.selectedIcon = new L.Icon({
                iconUrl: config.urls.selectedIcon,
                iconRetinaUrl: config.urls.selectedIcon.replace('.png', '-2x.png'),
                iconSize: new L.Point(25, 41),
                iconAnchor: new L.Point(13, 41),
                popupAnchor: new L.Point(1, -34),
                shadowSize: new L.Point(41, 41),
                shadowUrl: config.urls.markerShadow
            });
            this.defaultIcon = new L.Icon.Default();

            this.own(topic.subscribe(config.topics.streamsLakes_toggle, lang.hitch(this, 'toggleStreamsLakes')));
        },
        initMap: function () {
            // summary:
            //      description
            console.log('app/location/VerifyMap:initMap', arguments);

            this.map = new L.Map(this.mapDiv, {
                keyboard: false,
                scrollWheelZoom: (localStorage.mouseWheelZooming === 'true') ? true : false
            });

            this.map.setView([40.6389, -111.7034], 10);

            var that = this;
            this.own(topic.subscribe(config.topics.mouseWheelZooming_onChange, function (enable) {
                if (enable) {
                    that.map.scrollWheelZoom.enable();
                } else {
                    that.map.scrollWheelZoom.disable();
                }
            }))
            L.tileLayer(config.urls.googleImagery, {quadWord: config.quadWord})
                .addTo(this.map);
            L.tileLayer(config.urls.overlay, {quadWord: config.quadWord})
                .addTo(this.map);

            var popup = new L.Popup({
                closeButton: false,
                offset: [0, -40],
                autoPan: false
            });
            this.stationsLyr = L.esri.featureLayer({
                url: config.urls.stationsFeatureService,
                onEachFeature: function (geojson, layer) {
                    if (geojson.properties[config.fieldNames.stations.STATION_ID] === that.startSelectedId) {
                        layer.setIcon(that.selectedIcon);
                    }
                    layer.on('mouseover', function () {
                        popup.setContent(dojoString.substitute(stationPopupTemplate, geojson.properties))
                            .setLatLng([geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]])
                            .openOn(that.map);
                    }).on('mouseout', function () {
                        that.map.closePopup();
                    }).on('click', function () {
                        topic.publish(
                            config.topics.onStationClick,
                            [
                                geojson.properties[config.fieldNames.stations.NAME],
                                geojson.properties[config.fieldNames.stations.STATION_ID]
                            ]
                        );
                        that.stationsLyr.eachFeature(function (l) {
                            l.setIcon(that.defaultIcon);
                        });
                        layer.setIcon(that.selectedIcon);
                    });
                }
            }).addTo(this.map);

            if (this.isMainMap) {
                config.app.map = this.map;
                topic.publish(config.topics.mapInit);
            }

            this.streamSearch = new StreamSearch({
                map: this.map,
                searchField: config.fieldNames.reference.WaterName,
                placeHolder: 'stream/lake name...',
                contextField: config.fieldNames.reference.COUNTY,
                maxResultsToDisplay: 10
            }, this.streamSearchDiv);

            if (localStorage.streamsLakesToggle === 'true') {
                this.toggleStreamsLakes(true);
            }
        },
        toggleStreamsLakes: function (visible) {
            // summary:
            //      creates and toggles the streams and lakes layer
            // visible: Boolean
            console.log('app/location/VerifyMap:toggleStreamsLakes', arguments);

            if (visible && !this.streamsLakesLyr) {
                this.streamsLakesLyr = L.esri.dynamicMapLayer({
                    url: config.urls.streamsLakesService,
                    format: 'png32'
                });
            }

            if (visible) {
                this.streamsLakesLyr.addTo(this.map);
            } else {
                this.streamsLakesLyr.remove();
            }
        },
        destroy: function () {
            // summary:
            //      destroys the widget
            console.log('app/location/VerifyMap:destroy', arguments);

            if (this.map) {
                this.map.remove();
            }
            this.inherited(arguments);
        },
        selectStation: function (guid) {
            // summary:
            //      selects the station on the map
            // guid: String
            //      The id of the station to be selected
            console.log('app/location/VerifyMap:selectStation', arguments);

            this.startSelectedId = guid;
        },
        clearSelection: function () {
            // summary:
            //      clears any selected station on the map
            console.log('app/location/VerifyMap:clearSelection', arguments);

            delete this.startSelectedId;

            this.stationsLyr.eachFeature(function (l) {
                l.setIcon(this.defaultIcon);
            }, this);
        }
    });
});
