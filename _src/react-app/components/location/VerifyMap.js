import * as React from 'react';
import ReactDOM from 'react-dom';
import config from '../../config';
import L from 'leaflet';
import pubsub from 'pubsub-js';
import propTypes from 'prop-types';
import { featureLayer } from 'esri-leaflet';
import topic from 'pubsub-js';
import { AppContext, actionTypes } from '../../App';

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

const VerifyMap = ({ isMainMap, className }) => {
  const streamSearchDiv = React.useRef();
  const mapDiv = React.useRef();
  const stationsLayer = React.useRef();
  const streamsLayer = React.useRef();
  const lakesLayer = React.useRef();
  const [startSelectedId, setStartSelectedId] = React.useState();
  const { appState, appDispatch } = React.useContext(AppContext);

  React.useEffect(() => {
    console.log('VerifyMap:initMap');

    const map = new L.Map(mapDiv.current, {
      keyboard: false,
      scrollWheelZoom: localStorage.mouseWheelZooming === 'true',
    });
    map.setView(appState.currentMapExtent.center, appState.currentMapExtent.zoom);

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
          payload: map.center,
        });
      });
      appDispatch({
        type: actionTypes.MAP,
        payload: map,
      });
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

    L.tileLayer(config.urls.googleImagery, { quadWord: config.quadWord }).addTo(map);
    L.tileLayer(config.urls.overlay, { quadWord: config.quadWord }).addTo(map);

    const popup = new L.Popup({
      closeButton: false,
      offset: [0, -40],
      autoPan: false,
    });

    const replaceNulls = (obj) => {
      const newObject = {};
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          newObject[prop] = obj[prop] === null || obj[prop] === undefined ? '' : obj[prop];
        }
      }

      return newObject;
    };

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

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [appDispatch, appState.currentMapExtent.center, appState.currentMapExtent.zoom, isMainMap, startSelectedId]);

  return (
    <div className={`verify-map ${className}`}>
      <div ref={streamSearchDiv}></div>
      <div ref={mapDiv} className="map"></div>
    </div>
  );
};

VerifyMap.propTypes = {
  isMainMap: propTypes.bool,
};

export default VerifyMap;
