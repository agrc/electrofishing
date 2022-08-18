import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import config from '../../config';
import L from 'leaflet';
import propTypes from 'prop-types';
import { featureLayer } from 'esri-leaflet';
import topic from 'pubsub-js';
import { AppContext, actionTypes } from '../../App';
import StreamSearch from './StreamSearch';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { EventContext } from '../NewCollectionEvent';

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

const MapHoister = ({ isMainMap, setMap, setStreamsLayer, setLakesLayer, selectStation }) => {
  const stationsLayer = useRef();
  const streamsLayer = useRef();
  const lakesLayer = useRef();
  const { appDispatch } = useContext(AppContext);
  const map = useMap();
  const mapInitialized = useRef(false);
  const { eventState } = useContext(EventContext);

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
      console.log('updating styles');
      if (geojson.properties[config.fieldNames.stations.STATION_ID] === selectedStationId) {
        layer.setIcon(selectedIcon);
      } else {
        layer.setIcon(defaultIcon);
      }
    },
    [selectedStationId, isMainMap]
  );

  useEffect(() => {
    console.log('useEffect updateStyle');
    // figure out how to make this fire after the new feature has been added to the layer, I think that it's firing before...
    stationsLayer.current?.eachFeature((layer) => updateStyle(layer.feature, layer));
  }, [updateStyle]);

  const onEachFeature = useCallback(
    (geojson, layer) => {
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
        });

      if (isMainMap) {
        updateStyle(geojson, layer);
        layer.on('click', function () {
          selectStation(
            geojson.properties[config.fieldNames.stations.NAME],
            geojson.properties[config.fieldNames.stations.STATION_ID]
          );
        });
      }
    },
    [isMainMap, map, selectStation, updateStyle]
  );

  useEffect(() => {
    if (mapInitialized.current) return;

    console.log('VerifyMap:initMap');

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

      // TODO: remove after all of the old dojo widgets that reference it are converted
      config.app.map = map;
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
      moveend: () => toggleLabelsAndStyle(map.getZoom()),
    });

    if (isMainMap) {
      topic.publishSync(config.topics.mapInit);
    }

    mapInitialized.current = true;
  }, [appDispatch, isMainMap, map, onEachFeature, selectStation, setLakesLayer, setStreamsLayer, updateStyle]);

  return null;
};

const VerifyMap = ({
  isMainMap,
  className,
  setMap,
  setStreamsLayer = () => {},
  setLakesLayer = () => {},
  selectStation,
}) => {
  const { appState } = useContext(AppContext);
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
        scrollWheelZoom={localStorage.mouseWheelZooming === 'true'}
        center={appState.center}
        zoom={appState.zoom}
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
  isMainMap: propTypes.bool,
  className: propTypes.string,
  setMap: propTypes.func,
  setStreamsLayer: propTypes.func,
  setLakesLayer: propTypes.func,
};

export default VerifyMap;
