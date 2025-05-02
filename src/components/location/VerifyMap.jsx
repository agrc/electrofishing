import { featureLayer } from 'esri-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import topic from 'pubsub-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { actionTypes, useAppContext } from '../../App.jsx';
import config from '../../config';
import { useSamplingEventContext } from '../../hooks/samplingEventContext.jsx';
import StreamSearch from './StreamSearch.jsx';
import 'leaflet-loading';
import { Spinner } from 'spin.js';

window.Spinner = Spinner;

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
  NAME: PropTypes.string,
  STREAM_TYPE: PropTypes.string,
};

const replaceNulls = (obj) => {
  const newObject = {};
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
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

const MapHoister = ({ isMainMap, setMap, setStreamsLayer, setLakesLayer, selectStation }) => {
  const stationsLayer = useRef();
  const streamsLayer = useRef();
  const lakesLayer = useRef();
  const { appDispatch } = useAppContext();
  const map = useMap();
  const mapInitialized = useRef(false);
  const { eventState } = useSamplingEventContext();

  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map, setMap]);

  const selectedStationId =
    eventState[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.STATION_ID];
  const updateStyle = useCallback(
    (geojson, layer) => {
      if (!isMainMap) return;
      if (geojson.properties[config.fieldNames.stations.STATION_ID] === selectedStationId) {
        layer.setIcon(selectedIcon);
      } else {
        layer.setIcon(defaultIcon);
      }
    },
    [isMainMap, selectedStationId],
  );

  useEffect(() => {
    stationsLayer.current?.eachFeature((layer) => updateStyle(layer.feature, layer));
  }, [updateStyle]);

  const onEachFeature = useCallback(
    (geojson, layer) => {
      layer
        .on('mouseover', function () {
          const containerDiv = document.createElement('div');
          const root = createRoot(containerDiv);
          root.render(<StationPopup {...replaceNulls(geojson.properties)} />);

          popup
            .setContent(containerDiv)
            .setLatLng([geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]])
            .openOn(map);
        })
        .on('mouseout', function () {
          map.closePopup();
        });

      if (isMainMap) {
        updateStyle(geojson, layer);
        layer.on('click', function () {
          selectStation(
            geojson.properties[config.fieldNames.stations.NAME],
            geojson.properties[config.fieldNames.stations.STATION_ID],
          );
        });
      }
    },
    [isMainMap, map, selectStation, updateStyle],
  );

  useEffect(() => {
    if (mapInitialized.current) return;

    const loadingControl = L.Control.loading({
      spinjs: true,
      delayIndicator: 500,
    });

    map.addControl(loadingControl);

    stationsLayer.current = featureLayer({
      url: config.urls.stationsFeatureService,
      onEachFeature,
    }).addTo(map);

    streamsLayer.current = featureLayer({
      url: config.urls.streamsFeatureService,
    }).addTo(map);
    setStreamsLayer(streamsLayer.current);

    lakesLayer.current = featureLayer({
      url: config.urls.lakesFeatureService,
    }).addTo(map);
    setLakesLayer(lakesLayer.current);

    map.on('click', (event) => {
      topic.publishSync(config.topics.onMapClick, event);
    });

    if (isMainMap) {
      appDispatch({
        type: actionTypes.MAP,
        payload: map,
      });
    }

    topic.subscribe(config.topics.pointDef_onBtnClick, (_, __, isActive) => {
      if (isActive) {
        map._container.style.cursor = '';
      } else {
        map._container.style.cursor = 'crosshair';
      }
    });

    let largerSymbolsAreVisible = false;
    let labelsAreVisible = false;
    let labelCache = {};
    const toggleLabelsAndStyle = (zoom) => {
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

      [streamsLayer.current, lakesLayer.current].forEach((featureLayer) => {
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
      moveend: () => {
        toggleLabelsAndStyle(map.getZoom());
        appDispatch({
          type: actionTypes.SETTINGS,
          payload: {
            center: map.getCenter(),
            zoom: map.getZoom(),
          },
        });
      },
    });

    if (isMainMap) {
      topic.publishSync(config.topics.mapInit);
    }

    mapInitialized.current = true;
  }, [appDispatch, isMainMap, map, onEachFeature, selectStation, setLakesLayer, setStreamsLayer, updateStyle]);

  return null;
};

MapHoister.propTypes = {
  isMainMap: PropTypes.bool,
  setMap: PropTypes.func,
  setStreamsLayer: PropTypes.func,
  setLakesLayer: PropTypes.func,
  selectStation: PropTypes.func,
};

const VerifyMap = ({
  isMainMap,
  className,
  setMap,
  setStreamsLayer = () => {},
  setLakesLayer = () => {},
  selectStation,
}) => {
  const { appState } = useAppContext();
  const streamSearchDiv = useRef();
  const [innerMap, setInnerMap] = useState(null);

  return (
    <div className={`verify-map ${className}`}>
      <StreamSearch
        map={innerMap}
        streamsFeatureService={config.urls.streamsFeatureService}
        lakesFeatureService={config.urls.lakesFeatureService}
        searchField={config.fieldNames.reference.WaterName}
        contextField={config.fieldNames.reference.COUNTY}
      />
      <MapContainer
        className="map"
        keyboard={false}
        scrollWheelZoom={appState.settings.mouseWheelZooming}
        center={appState.settings.center}
        zoom={appState.settings.zoom}
      >
        <MapHoister
          streamSearchDiv={streamSearchDiv}
          isMainMap={isMainMap}
          setMap={(map) => {
            setInnerMap(map);
            setMap(map);
          }}
          setStreamsLayer={setStreamsLayer}
          setLakesLayer={setLakesLayer}
          selectStation={selectStation}
        />
        <TileLayer url={config.urls.googleImagery} />
        <TileLayer url={config.urls.overlay} />
      </MapContainer>
    </div>
  );
};

VerifyMap.propTypes = {
  isMainMap: PropTypes.bool,
  className: PropTypes.string,
  setMap: PropTypes.func,
  setStreamsLayer: PropTypes.func,
  setLakesLayer: PropTypes.func,
  selectStation: PropTypes.func,
};

export default VerifyMap;
