import React, { useState } from 'react';
import StartEndGeoDef from './StartEndGeoDef';
import topic from 'pubsub-js';
import config from '../../config';

const story = {
  title: 'StartEndGeoDef',
  component: StartEndGeoDef,
};

export default story;

export const Default = () => {
  const map = {
    addLayer: () => {},
    getBounds: () => {
      return { contains: () => true };
    },
  };

  const [coordinatePairs, setCoordinatePairs] = useState({
    start: config.emptyPoint,
    end: config.emptyPoint,
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
      <StartEndGeoDef map={map} coordinatePairs={coordinatePairs} setCoordinatePairs={setCoordinatePairs} />
      <button onClick={mapClick}>Map click</button>
    </>
  );
};
