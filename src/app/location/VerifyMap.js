define([
    'app/StreamSearch',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-style',
    'dojo/string',
    'dojo/text!app/location/templates/VerifyMap.html',
    'dojo/text!app/templates/StationPopupTemplate.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',

    'esri-leaflet',
    'leaflet',
    'proj4',
    'proj4leaflet'
],

function (
    StreamSearch,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domStyle,
    dojoString,
    template,
    stationPopupTemplate,
    topic,
    array,
    declare
) {
    // load these script synchronously because the order matters
    return declare('app.location.VerifyMap', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: false,
        templateString: template,
        baseClass: 'verify-map',

        // map: L.map
        //      The leaflet map
        map: null,

        // stationsLyr: L.esri.FeatureLayer
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
                iconUrl: AGRC.urls.selectedIcon,
                iconRetinaUrl: AGRC.urls.selectedIcon.replace('.png', '-2x.png'),
                iconSize: new L.Point(25, 41),
                iconAnchor: new L.Point(13, 41),
                popupAnchor: new L.Point(1, -34),
                shadowSize: new L.Point(41, 41),
                shadowUrl: AGRC.urls.markerShadow
            });
            this.defaultIcon = new L.Icon.Default();
        },
        initMap: function () {
            // summary:
            //      description
            console.log('app/location/VerifyMap:initMap', arguments);

            var crs = new L.Proj.CRS('EPSG:26912',
                '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
                {
                    transformation: new L.Transformation(1, 5120900, -1, 9998100),
                    resolutions: [4891.96999883583,
                            2445.98499994708,
                            1222.99250010583,
                            611.496250052917,
                            305.748124894166,
                            152.8740625,
                            76.4370312632292,
                            38.2185156316146,
                            19.1092578131615,
                            9.55462890525781,
                            4.77731445262891,
                            2.38865722657904,
                            1.19432861315723,
                            0.597164306578613,
                            0.298582153289307]
                });

            this.map = new L.Map(this.mapDiv, {
                crs: crs,
                scrollWheelZoom: false,
                keyboard: false
            });

            this.map.setView([40.6389, -111.7034], 5);

            L.esri.tiledMapLayer(AGRC.urls.terrainCache, {
                maxZoom: 14,
                minZoom: 0,
                continuousWorld: true
            }).addTo(this.map);

            var popup = new L.Popup({
                closeButton: false,
                offset: [0, -40],
                autoPan: false
            });
            var that = this;
            this.stationsLyr = L.esri.featureLayer(AGRC.urls.stationsFeatureService, {
                onEachFeature: function (geojson, layer) {
                    console.log('each feature');
                    if (geojson.properties[AGRC.fieldNames.stations.STATION_ID] === that.startSelectedId) {
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
                            AGRC.topics.onStationClick,
                            [
                                geojson.properties[AGRC.fieldNames.stations.NAME],
                                geojson.properties[AGRC.fieldNames.stations.STATION_ID]
                            ]
                        );
                        array.forEach(that.stationsLyr.getLayers(), function (l) {
                            l.setIcon(that.defaultIcon);
                        });
                        layer.setIcon(that.selectedIcon);
                    });
                },
                continuousWorld: true
            }).addTo(this.map);

            if (this.isMainMap) {
                AGRC.app.map = this.map;
                topic.publish(AGRC.topics.mapInit);
            }

            this.streamSearch = new StreamSearch({
                map: this.map,
                searchField: 'GNIS_Name',
                placeHolder: 'stream name...',
                contextField: 'COUNTY',
                maxResultsToDisplay: 20
            }, this.streamSearchDiv);
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

            this.stationsLyr.eachLayer(function (l) {
                l.setIcon(this.defaultIcon);
            }, this);
        }
    });
});
