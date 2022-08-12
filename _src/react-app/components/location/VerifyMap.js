import * as React from 'react';
import ReactDOM from 'react-dom';
import config from '../../config';
import L from 'leaflet';
import propTypes from 'prop-types';
import { featureLayer } from 'esri-leaflet';
import topic from 'pubsub-js';
import { AppContext, actionTypes } from '../../App';
import StreamSearch from 'app/StreamSearch';
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

const MapHoister = ({ streamSearchDiv, isMainMap, setMap, setStreamsLayer, setLakesLayer, selectStation }) => {
  const stationsLayer = React.useRef();
  const streamsLayer = React.useRef();
  const lakesLayer = React.useRef();
  const { appDispatch } = React.useContext(AppContext);
  const streamSearch = React.useRef(null);
  const map = useMap();
  const mapInitialized = React.useRef(false);
  const { eventState } = React.useContext(EventContext);

  React.useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map, setMap]);

  const selectedStationId =
    eventState[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.STATION_ID];
  const updateStyle = React.useCallback(
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

  React.useEffect(() => {
    console.log('useEffect updateStyle');
    // figure out how to make this fire after the new feature has been added to the layer, I think that it's firing before...
    stationsLayer.current?.eachFeature((layer) => updateStyle(layer.feature, layer));
  }, [updateStyle]);

  const onEachFeature = React.useCallback(
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

  React.useEffect(() => {
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
  }, [
    appDispatch,
    isMainMap,
    map,
    onEachFeature,
    selectStation,
    setLakesLayer,
    setStreamsLayer,
    streamSearchDiv,
    updateStyle,
  ]);

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
  const { appState } = React.useContext(AppContext);
  const streamSearchDiv = React.useRef();

  return (
    <div className={`verify-map ${className}`}>
      <div ref={streamSearchDiv}></div>
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
          setMap={setMap}
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
