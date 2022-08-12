import React, { useEffect, useRef } from 'react';
import PointDef from './PointDef';
import PropTypes from 'prop-types';

export default function StartEndGeoDef({ map, coordinatePairs, setCoordinatePairs }) {
  const featureGroup = useRef(null);

  useEffect(() => {
    if (map) {
      featureGroup.current = new L.FeatureGroup().addTo(map);
    }
  }, [map]);

  const getSetCoordinates = (type) => {
    return (coordinates) => {
      setCoordinatePairs((current) => {
        return {
          ...current,
          [type]: coordinates,
        };
      });
    };
  };

  return (
    <div>
      <PointDef
        label="Start"
        map={map}
        coordinates={coordinatePairs.start}
        setCoordinates={getSetCoordinates('start')}
      />
      <PointDef label="End" map={map} coordinates={coordinatePairs.end} setCoordinates={getSetCoordinates('end')} />
    </div>
  );
}

StartEndGeoDef.propTypes = {
  map: PropTypes.instanceOf(L.Map),
  coordinatePairs: PropTypes.shape({
    start: PropTypes.object,
    end: PropTypes.object,
  }),
  setCoordinatePairs: PropTypes.func.isRequired,
};
