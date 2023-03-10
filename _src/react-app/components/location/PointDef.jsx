import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import 'proj4';
import 'proj4leaflet';
import config from '../../config';
import useSubscriptions from '../../hooks/useSubscriptions';
import clsx from 'clsx';
import topic from 'pubsub-js';
import useUniqueId from '../../hooks/useUniqueId';
import { useAppContext } from '../../App';

// labels: {}
//      The text for the different labels above the textboxes as well
//      as the placeholders within the text boxes
const labels = {
  utm: {
    y: 'Northing',
    x: 'Easting',
    placeY: '4435007',
    placeX: '445615',
  },
  ll: {
    y: 'Latitude',
    x: 'Longitude',
    placeY: '40.616234',
    placeX: '-111.841234',
  },
};

// validateMsgs: {}
//      validate error messages
const validateMsgs = {
  tooLong: 'Too many digits!',
  tooShort: 'Too few digits!',
};

// validateErrorClass: String
//      The bootstrap css class to add when there is a validate error
const validateErrorClass = 'has-error';

// validateDigits: {}
//      stores the number of digits there should be for utm values
const validateDigits = {
  utmY: 7,
  utmX: 6,
};

const utm27crs = new L.Proj.CRS(
  'EPSG:26712',
  '+proj=utm +zone=12 +ellps=clrk66 +datum=NAD27 +units=m +no_defs',
  new L.Transformation(1, 5682968.14599198, -1, 10997674.9165387)
);
const utm83crs = new L.Proj.CRS('EPSG:26912', '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs', {
  transformation: new L.Transformation(1, 5120900, -1, 9998100),
});

export default function PointDef({ label, map, coordinates, setCoordinates, twoLineLayout }) {
  const {
    appState: {
      settings: { coordType },
    },
  } = useAppContext();
  const [isActive, setIsActive] = React.useState(false);

  const icon = React.useRef(null);
  const addSubscription = useSubscriptions();
  const id = useUniqueId();

  const group = useRef(null);
  useEffect(() => {
    if (map && !group.current) {
      group.current = new L.FeatureGroup().addTo(map);
    }
  }, [map]);

  useEffect(() => {
    const url = label === 'Start' ? config.urls.startIcon : config.urls.endIcon;

    icon.current = new L.Icon({
      iconUrl: url,
      iconRetinaUrl: url.replace('.png', '-2x.png'),
      iconSize: new L.Point(25, 41),
      iconAnchor: new L.Point(13, 41),
      popupAnchor: new L.Point(1, -34),
      shadowSize: new L.Point(41, 41),
      shadowUrl: config.urls.markerShadow,
    });
  }, [label]);

  const onOtherMapBtnClicked = useCallback(
    (component) => {
      if (component !== id && map) {
        setIsActive(false);
      }
    },
    [id, map]
  );

  // update marker position
  const marker = React.useRef(null);
  const updateMarkerPosition = useCallback(
    (latlng) => {
      let x;
      let y;

      if (!latlng) {
        y = coordinates.y;
        x = coordinates.x;

        // get it from the text boxes
        if (coordType === config.coordTypes.latlng) {
          latlng = new L.LatLng(y, x);
        } else if (coordType === config.coordTypes.utm83) {
          latlng = utm83crs.projection.unproject(new L.Point(x, y));
        } else {
          // utm27
          latlng = utm27crs.projection.unproject(new L.Point(x, y));
        }
      }

      if (marker.current) {
        marker.current.setLatLng(latlng);
      } else {
        marker.current = new L.Marker(latlng, { icon: icon.current });
        group.current.addLayer(marker.current);
      }

      // zoom to marker if it's off of the map
      if (!map.getBounds().contains(group.current.getBounds())) {
        map.fitBounds(group.current.getBounds().pad(0.05));
      }
    },
    [coordType, coordinates.x, coordinates.y, map]
  );

  const [helpText, setHelpText] = React.useState(config.emptyPoint);
  const validate = useCallback(
    (axis) => {
      function setNoError() {
        setHelpText((helpText) => {
          return { ...helpText, [axis]: '' };
        });
      }

      // return true if we are in latlng
      if (coordType === 'll') {
        return true;
      }

      const value = coordinates[axis]; // the value of the text box
      if (value.length === 0) {
        setNoError();

        return false;
      }

      const numDigits = axis === 'y' ? validateDigits.utmY : validateDigits.utmX;

      let message;
      if (value.length < numDigits) {
        message = validateMsgs.tooShort;
      } else if (value.length > numDigits) {
        message = validateMsgs.tooLong;
      }

      if (message) {
        setHelpText((helpText) => {
          return { ...helpText, [axis]: message };
        });

        return false;
      }

      setNoError();

      return true;
    },
    [coordType, coordinates]
  );

  const onMapClicked = useCallback(
    (_, event) => {
      if (!isActive) {
        return;
      }

      let projection;
      let pnt;

      updateMarkerPosition(event.latlng);

      if (coordType === config.coordTypes.ll) {
        setCoordinates({
          y: Math.round(event.latlng.lat * 1000000) / 1000000,
          x: Math.round(event.latlng.lng * 1000000) / 1000000,
        });
      } else if (coordType === config.coordTypes.utm83) {
        projection = utm83crs.projection;
        pnt = projection.project(event.latlng);
        setCoordinates({ y: parseInt(pnt.y, 10), x: parseInt(pnt.x, 10) });
      } else {
        // utm 27
        projection = utm27crs.projection;
        pnt = projection.project(event.latlng);
        setCoordinates({ y: parseInt(pnt.y, 10), x: parseInt(pnt.x, 10) });
      }

      setHelpText(config.emptyPoint);
    },
    [coordType, isActive, setCoordinates, updateMarkerPosition]
  );

  // clear
  useEffect(() => {
    if (group.current && coordinates.x === '' && coordinates.y === '') {
      if (marker.current) {
        group.current.removeLayer(marker.current);
        marker.current = null;
      }

      validate('x');
      validate('y');

      setIsActive(false);
    }
  }, [coordinates, validate]);

  // wire events
  useEffect(() => {
    addSubscription(config.topics.coordTypeToggle_onChange, (_, type) => setCoordinateType(type));
    addSubscription(config.topics.pointDef_onBtnClick, (_, widget) => onOtherMapBtnClicked(widget));
    addSubscription(config.topics.onMapClick, onMapClicked);
  }, [addSubscription, onMapClicked, onOtherMapBtnClicked]);

  let yLabelTxt, yPlaceHolder, xLabelTxt, xPlaceHolder;
  if (coordType === config.coordTypes.ll) {
    yLabelTxt = labels.ll.y;
    yPlaceHolder = labels.ll.placeY;
    xLabelTxt = labels.ll.x;
    xPlaceHolder = labels.ll.placeX;
  } else {
    yLabelTxt = labels.utm.y;
    yPlaceHolder = labels.utm.placeY;
    xLabelTxt = labels.utm.x;
    xPlaceHolder = labels.utm.placeX;
  }

  const onTextBoxBlur = () => {
    const yValid = validate('y');
    const xValid = validate('x');

    if (yValid && xValid) {
      updateMarkerPosition();
    } else if (marker.current) {
      group.current.removeLayer(marker.current);
      marker.current = null;
    }
  };

  const onMapBtnClicked = (event) => {
    event.preventDefault();

    setIsActive(!isActive);

    topic.publishSync(config.topics.pointDef_onBtnClick, id, isActive);
  };

  const getOnTextBoxChange = (axis) => {
    return (event) => {
      const value = event.target.value;
      setCoordinates({ ...coordinates, [axis]: value });
    };
  };

  const getButton = () => {
    return (
      <>
        <div className="form-group">
          <label className="point-def__primary-label">{label}</label>
        </div>
        <button className={clsx('btn btn-default btn-sm padded', isActive && 'active')} onClick={onMapBtnClicked}>
          <span className="glyphicon glyphicon-map-marker"></span>
        </button>
      </>
    );
  };

  const getBoxes = () => {
    return (
      <>
        <div className={clsx('form-group', helpText.y.length > 0 && validateErrorClass)}>
          <label>{yLabelTxt}</label>
          <input
            type="text"
            className={clsx('form-control', !twoLineLayout && 'padded')}
            placeholder={yPlaceHolder}
            disabled={isActive}
            onBlur={onTextBoxBlur}
            value={coordinates.y}
            onChange={getOnTextBoxChange('y')}
          />
          <span className={clsx('help-block', !twoLineLayout && 'padded')}>{helpText.y}</span>
        </div>

        <div className={clsx('form-group', helpText.x.length > 0 && validateErrorClass, twoLineLayout && 'padded')}>
          <label>{xLabelTxt}</label>
          <input
            type="text"
            className={clsx('form-control', !twoLineLayout && 'padded')}
            placeholder={xPlaceHolder}
            disabled={isActive}
            onBlur={onTextBoxBlur}
            value={coordinates.x}
            onChange={getOnTextBoxChange('x')}
          />
          <span className={clsx('help-block', !twoLineLayout && 'padded')}>{helpText.x}</span>
        </div>
      </>
    );
  };

  return (
    <div className="point-def">
      {twoLineLayout ? (
        <>
          <div className="form-inline">{getButton()}</div>
          <div className="form-inline">{getBoxes()}</div>
        </>
      ) : (
        <div className="form-inline">
          {getButton()}
          {getBoxes()}
        </div>
      )}
    </div>
  );
}
PointDef.propTypes = {
  label: PropTypes.string.isRequired,
  map: PropTypes.instanceOf(L.Map),
  coordinates: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
  }),
  setCoordinates: PropTypes.func.isRequired,
  twoLineLayout: PropTypes.bool,
};
