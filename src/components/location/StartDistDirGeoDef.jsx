import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import PointDef from './PointDef.jsx';

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
      <div className="d-flex align-items-center flex-wrap gap-2">
        <PointDef label="Start" map={map} coordinates={params.start} setCoordinates={setStart} />
        <div className="dist-block">
          <div className="mb-3">
            <label>Distance (in meters)</label>
            <input
              type="number"
              className="form-control padded"
              value={params.distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="up_down_stream"
              id="direction_up"
              autoComplete="off"
              checked={params.direction === 'up'}
              onChange={() => setDirection('up')}
            />
            <label className="btn btn-primary" htmlFor="direction_up">
              Upstream
            </label>

            <input
              type="radio"
              className="btn-check"
              name="up_down_stream"
              id="direction_down"
              autoComplete="off"
              checked={params.direction === 'down'}
              onChange={() => setDirection('down')}
            />
            <label className="btn btn-primary" htmlFor="direction_down">
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
