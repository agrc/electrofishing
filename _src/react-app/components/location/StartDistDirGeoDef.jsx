import React, { useEffect, useRef } from 'react';
import PointDef from './PointDef';
import PropTypes from 'prop-types';

export default function StartDistDirGeoDef({ map, params, setParams }) {
  const group = useRef(null);

  useEffect(() => {
    if (map) {
      group.current = new L.FeatureGroup().addTo(map);
    }
  }, [map]);

  const setStart = (coordinates) => {
    setParams({
      ...params,
      start: coordinates,
    });
  };

  const setDistance = (distance) => {
    setParams({
      ...params,
      distance,
    });
  };

  const setDirection = (direction) => {
    setParams({
      ...params,
      direction,
    });
  };

  return (
    <div className="start-dist-dir">
      <div className="form-inline">
        <PointDef label="Start" map={map} coordinates={params.start} setCoordinates={setStart} />
        <div className="dist-block">
          <div className="form-group">
            <label className="control-label">Distance (in meters)</label>
            <input
              type="number"
              className="form-control padded"
              value={params.distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div className="btn-group" data-toggle="buttons">
            <label className="btn btn-primary active" onClick={() => setDirection('up')}>
              <input type="radio" name="up_down_stream" selected={params.direction === 'up'} />
              Upstream
            </label>
            <label className="btn btn-primary" onClick={() => setDirection('down')}>
              <input type="radio" name="up_down_stream" selected={params.direction === 'down'} />
              Downstream
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

StartDistDirGeoDef.propTypes = {
  map: PropTypes.instanceOf(L.Map),
  params: PropTypes.shape({
    start: PropTypes.object,
    distance: PropTypes.string,
    direction: PropTypes.string,
  }).isRequired,
  setParams: PropTypes.func.isRequired,
};
