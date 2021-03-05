import * as React from 'react';
import ReactDOM from 'react-dom';
import config from '../../config';
import L from 'leaflet';
import pubsub from 'pubsub-js';
import propTypes from 'prop-types';
import { featureLayer } from 'esri-leaflet';
import topic from 'pubsub-js';
import { AppContext, actionTypes } from '../../App';
import StreamSearch from 'app/StreamSearch';
import { MapContainer, TileLayer, MapConsumer, useMap } from 'react-leaflet';

const selectedIcon = new L.Icon({
  iconUrl: config.urls.selectedIcon,
  iconRetinaUrl: config.urls.selectedIcon.replace('.png', '-2x.png'),
  iconSize: new L.Point(25, 41),
  iconAnchor: new L.Point(13, 41),
  popupAnchor: new L.Point(1, -34),
  shadowSize: new L.Point(41, 41),
  shadowUrl: config.urls.markerShadow,
});

L.Icon.Default.imagePath = config.urls.markerImagesFolder;
const defaultIcon = new L.Icon.Default();

const StationPopup = ({ NAME, STREAM_TYPE }) => (
  <div>
    <strong>{NAME}</strong>
    <br />
    Stream Type: {STREAM_TYPE}
  </div>
);

StationPopup.propTypes = {
  NAME: propTypes.string,
  STREAM_TYPE: propTypes.string,
};

const MapHoister = ({ streamSearchDiv, isMainMap }) => {
  const stationsLayer = React.useRef();
  const streamsLayer = React.useRef();
  const lakesLayer = React.useRef();
  const [startSelectedId, setStartSelectedId] = React.useState();
  const { appState, appDispatch } = React.useContext(AppContext);
  const streamSearch = React.useRef(null);
  const map = useMap();
  const mapInitialized = React.useRef(false);

  React.useEffect(() => {
    if (appState.currentTab === 'locationTab') {
      // this prevents the map from getting messed up when it's hidden by another tab
      map?.invalidateSize();
    }
  }, [appState.currentTab, map]);

  React.useEffect(() => {
    if (mapInitialized.current) return;

    console.log('VerifyMap:initMap');

    const replaceNulls = (obj) => {
      const newObject = {};
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          newObject[prop] = obj[prop] === null || obj[prop] === undefined ? '' : obj[prop];
        }
      }

      return newObject;
    };

    const popup = new L.Popup({
      closeButton: false,
      offset: [0, -40],
      autoPan: false,
    });

    stationsLayer.current = featureLayer({
      url: config.urls.stationsFeatureService,
      onEachFeature: (geojson, layer) => {
        if (geojson.properties[config.fieldNames.stations.STATION_ID] === startSelectedId) {
          layer.setIcon(selectedIcon);
        }
        layer
          .on('mouseover', function () {
            const containerDiv = document.createElement('div');
            ReactDOM.render(<StationPopup {...replaceNulls(geojson.properties)} />, containerDiv);

            popup
              .setContent(containerDiv)
              .setLatLng([geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]])
              .openOn(map);
          })
          .on('mouseout', function () {
            map.closePopup();
          })
          .on('click', function () {
            pubsub.publishSync(config.topics.onStationClick, [
              geojson.properties[config.fieldNames.stations.NAME],
              geojson.properties[config.fieldNames.stations.STATION_ID],
            ]);
            stationsLayer.current.eachFeature((l) => {
              l.setIcon(defaultIcon);
            });
            layer.setIcon(selectedIcon);
          });
      },
    }).addTo(map);

    streamsLayer.current = featureLayer({
      url: config.urls.streamsFeatureService,
    }).addTo(map);
    lakesLayer.current = featureLayer({
      url: config.urls.lakesFeatureService,
    }).addTo(map);

    map.on('click', (event) => {
      topic.publishSync(config.topics.onMapClick, event);
    });

    if (isMainMap) {
      map.on('zoomend', () => {
        appDispatch({
          type: actionTypes.CURRENT_MAP_ZOOM,
          payload: map.zoom,
        });
      });
      map.on('moveend', () => {
        appDispatch({
          type: actionTypes.CURRENT_MAP_CENTER,
          payload: map.getCenter(),
        });
      });

      appDispatch({
        type: actionTypes.MAP,
        payload: map,
      });

      // TODO: remove after all of the old dojo widgets that reference it are converted
      config.app.map = map;
    }

    topic.subscribe(config.topics.pointDef_onBtnClick, (_, widget) => {
      if (widget.isEnabled()) {
        map._container.style.cursor = '';
      } else {
        map._container.style.cursor = 'crosshair';
      }
    });

    topic.subscribe(config.topics.syncMapExtents, () => {
      if (!isMainMap) {
        map.setView(appState.currentMapExtent.center, appState.currentMapExtent.zoom);
      }
    });

    let largerSymbolsAreVisible = false;
    let labelsAreVisible = false;
    let labelCache = {};
    const toggleLabelsAndStyle = (zoom) => {
      console.log('zoom', zoom);
      const labelsShouldBeVisible = zoom >= config.labelsMinZoom;
      const largerSymbolsShouldBeVisible = zoom >= config.largerSymbolsMinZoom;
      if (!labelsAreVisible && !labelsShouldBeVisible && !largerSymbolsAreVisible && !largerSymbolsShouldBeVisible) {
        return;
      }
      labelCache = {};
      map.eachLayer((layer) => {
        const tooltip = layer.getTooltip();
        if (tooltip) {
          layer.unbindTooltip();
        }
      });

      [streamsLayer, lakesLayer].forEach((featureLayer) => {
        featureLayer.eachFeature((layer) => {
          if (!map.hasLayer(layer)) {
            return;
          }

          // update labels
          const label = layer.feature.properties[config.fieldNames.reference.WaterName];
          if (map.getBounds().contains(layer.getCenter()) && !labelCache[label]) {
            layer.unbindTooltip().bindTooltip(label, {
              permanent: labelsShouldBeVisible,
            });
            labelCache[label] = true;
          }

          // update style
          layer.setStyle({
            weight: largerSymbolsShouldBeVisible ? config.largerLineSymbolWidth : config.defaultLineSymbolWidth,
          });
        });
      });
    };
    map.on({
      moveend: () => toggleLabelsAndStyle(map.getZoom()),
    });

    if (isMainMap) {
      topic.publishSync(config.topics.mapInit);
    }

    streamSearch.current = new StreamSearch(
      {
        map,
        searchField: config.fieldNames.reference.WaterName,
        placeHolder: 'stream/lake name...',
        contextField: config.fieldNames.reference.COUNTY,
        maxResultsToDisplay: 50,
      },
      streamSearchDiv.current
    );

    mapInitialized.current = true;

    return () => {
      console.log('cleaning up map');

      if (streamSearch.current) {
        streamSearch.current?.destroy();
      }
    };
  }, [
    appDispatch,
    appState.currentMapExtent.center,
    appState.currentMapExtent.zoom,
    isMainMap,
    map,
    startSelectedId,
    streamSearchDiv,
  ]);

  return null;
};

const VerifyMap = ({ isMainMap, className }) => {
  const { appState } = React.useContext(AppContext);
  const streamSearchDiv = React.useRef();

  return (
    <div className={`verify-map ${className}`}>
      <div ref={streamSearchDiv}></div>
      <MapContainer
        className="map"
        keyboard={false}
        scrollWheelZoom={localStorage.mouseWheelZooming === 'true'}
        center={appState.currentMapExtent.center}
        zoom={appState.currentMapExtent.zoom}
      >
        <MapHoister streamSearchDiv={streamSearchDiv} isMainMap={isMainMap} />
        <TileLayer url={config.urls.googleImagery} />
        <TileLayer url={config.urls.overlay} />
      </MapContainer>
    </div>
  );
};

VerifyMap.propTypes = {
  isMainMap: propTypes.bool,
};

export default VerifyMap;
