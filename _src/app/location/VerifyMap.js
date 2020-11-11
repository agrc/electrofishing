define([
    'app/config',
    'app/StreamSearch',
    'app/_SubscriptionsMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/string',
    'dojo/text!app/location/templates/VerifyMap.html',
    'dojo/text!app/templates/StationPopupTemplate.html',
    'pubsub-js',
    'dojo/_base/declare',

    'esri-leaflet/dist/esri-leaflet-debug',

    'leaflet'
], function (
    config,
    StreamSearch,
    _SubscriptionsMixin,

    _TemplatedMixin,
    _WidgetBase,

    dojoString,
    template,
    stationPopupTemplate,
    topic,
    declare,

    esriLeaflet
) {
    L.esri = esriLeaflet;

    return declare([_WidgetBase, _TemplatedMixin, _SubscriptionsMixin], {
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
        },
        initMap: function () {
            // summary:
            //      description
            console.log('app/location/VerifyMap:initMap', arguments);

            this.map = new L.Map(this.mapDiv, {
                keyboard: false,
                scrollWheelZoom: (localStorage.mouseWheelZooming === 'true')
            });

            this.map.setView([40.6389, -111.7034], 10);

            var that = this;
            this.addSubscription(topic.subscribe(config.topics.mouseWheelZooming_onChange, function (_, enable) {
                if (enable) {
                    that.map.scrollWheelZoom.enable();
                } else {
                    that.map.scrollWheelZoom.disable();
                }
            }));
            L.tileLayer(config.urls.googleImagery, {quadWord: config.quadWord})
                .addTo(this.map);
            L.tileLayer(config.urls.overlay, {quadWord: config.quadWord})
                .addTo(this.map);

            var popup = new L.Popup({
                closeButton: false,
                offset: [0, -40],
                autoPan: false
            });
            const replaceNulls = obj => {
                const newObject = {};
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        newObject[prop] = (obj[prop] === null || obj[prop] === undefined) ? '' : obj[prop];
                    }
                }

                return newObject;
            };
            this.stationsLyr = L.esri.featureLayer({
                url: config.urls.stationsFeatureService,
                onEachFeature: function (geojson, layer) {
                    if (geojson.properties[config.fieldNames.stations.STATION_ID] === that.startSelectedId) {
                        layer.setIcon(that.selectedIcon);
                    }
                    layer.on('mouseover', function () {
                        popup.setContent(dojoString.substitute(stationPopupTemplate, replaceNulls(geojson.properties)))
                            .setLatLng([geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]])
                            .openOn(that.map);
                    }).on('mouseout', function () {
                        that.map.closePopup();
                    }).on('click', function () {
                        topic.publishSync(
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

            this.streamsLyr = L.esri.featureLayer({
                url: config.urls.streamsFeatureService
            }).addTo(this.map);
            this.lakesLyr = L.esri.featureLayer({
                url: config.urls.lakesFeatureService
            }).addTo(this.map);

            let largerSymbolsAreVisible = false;
            let labelsAreVisible = false;
            let labelCache = {};
            const toggleLabelsAndStyle = zoom => {
                console.log('zoom', zoom);
                const labelsShouldBeVisible = zoom >= config.labelsMinZoom;
                const largerSymbolsShouldBeVisible = zoom >= config.largerSymbolsMinZoom;
                if (!labelsAreVisible && !labelsShouldBeVisible &&
                    !largerSymbolsAreVisible && !largerSymbolsShouldBeVisible) {
                    return;
                }
                labelCache = {};
                this.map.eachLayer(layer => {
                    const tooltip = layer.getTooltip();
                    if (tooltip) {
                        layer.unbindTooltip();
                    }
                });

                [this.streamsLyr, this.lakesLyr].forEach(featureLayer => {
                    featureLayer.eachFeature(layer => {
                        if (!this.map.hasLayer(layer)) {
                            return;
                        }

                        // update labels
                        const label = layer.feature.properties[config.fieldNames.reference.WaterName];
                        if (this.map.getBounds().contains(layer.getCenter()) && !labelCache[label]) {
                            layer.unbindTooltip().bindTooltip(label, {
                                permanent: labelsShouldBeVisible
                            });
                            labelCache[label] = true;
                        }

                        // update style
                        layer.setStyle({
                            weight: (largerSymbolsShouldBeVisible) ?
                                config.largerLineSymbolWidth : config.defaultLineSymbolWidth
                        });
                    });
                });
            };
            this.map.on({
                moveend: () => toggleLabelsAndStyle(this.map.getZoom())
            });

            if (this.isMainMap) {
                config.app.map = this.map;
                topic.publishSync(config.topics.mapInit);
            }

            this.streamSearch = new StreamSearch({
                map: this.map,
                searchField: config.fieldNames.reference.WaterName,
                placeHolder: 'stream/lake name...',
                contextField: config.fieldNames.reference.COUNTY,
                maxResultsToDisplay: 50
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
            this.startSelectedId = guid.toUpperCase();
            this.stationsLyr.eachFeature(function (l) {
                if (l.feature.properties[config.fieldNames.stations.STATION_ID] === this.startSelectedId) {
                    l.setIcon(this.selectedIcon);
                } else {
                    l.setIcon(this.defaultIcon);
                }
            }, this);
        },
        clearSelection: function () {
            // summary:
            //      clears any selected station on the map
            console.log('app/location/VerifyMap:clearSelection', arguments);

            delete this.startSelectedId;

            this.stationsLyr.eachFeature(function (l) {
                l.setIcon(this.defaultIcon);
            }, this);
            this.streamsLyr.resetStyle();
            this.streamsLyr.resetStyle();
        }
    });
});
