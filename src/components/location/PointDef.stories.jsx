import topic from 'pubsub-js';
import { useState } from 'react';
import config from '../../config';
import useUniqueId from '../../hooks/useUniqueId';
import PointDef from './PointDef.jsx';

const story = {
  title: 'PointDef',
  component: PointDef,
};

export default story;

const bounds = {
  contains: () => true,
};
const map = {
  addLayer: () => {},
  getBounds: () => bounds,
};

const mapClick = () => {
  topic.publishSync(config.topics.onMapClick, {
    latlng: {
      lat: 39.8,
      lng: -111.2,
    },
  });
};

export const Default = () => {
  const [coordinates, setCoordinates] = useState(config.emptyPoint);
  const id = useUniqueId();

  const otherButtonClick = () => {
    topic.publishSync(config.topics.pointDef_onBtnClick, id, true);
  };

  return (
    <>
      <PointDef label="Start" id="default" coordinates={coordinates} setCoordinates={setCoordinates} map={map} />
      <button onClick={mapClick}>Map click</button>
      <button onClick={otherButtonClick}>Other button click</button>
    </>
  );
};

export const NewStationDialog = () => {
  const [coordinates, setCoordinates] = useState(config.emptyPoint);
  const id = useUniqueId();

  const otherButtonClick = () => {
    topic.publishSync(config.topics.pointDef_onBtnClick, id, true);
  };

  return (
    <div style={{ width: '300px' }}>
      <PointDef
        label="Station"
        id="default"
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        map={map}
        twoLineLayout
      />
      <button onClick={mapClick}>Map click</button>
      <button onClick={otherButtonClick}>Other button click</button>
    </div>
  );
};
