import topic from 'pubsub-js';
import { useState } from 'react';
import config from '../../config';
import StartDistDirGeoDef from './StartDistDirGeoDef.jsx';

const story = {
  title: 'StartDistDirGeoDef ',
  component: StartDistDirGeoDef,
};

export default story;

export const Default = () => {
  const map = {
    addLayer: () => {},
    getBounds: () => {
      return { contains: () => true };
    },
  };

  const [params, setParams] = useState({
    start: config.emptyPoint,
    distance: '',
    direction: '',
  });

  const mapClick = () => {
    topic.publishSync(config.topics.onMapClick, {
      latlng: {
        lat: 39.8,
        lng: -111.2,
      },
    });
  };

  return (
    <>
      <StartDistDirGeoDef map={map} params={params} setParams={setParams} />
      <button onClick={mapClick}>Map click</button>
    </>
  );
};
