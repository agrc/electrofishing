import topic from 'pubsub-js';
import { useState } from 'react';
import config from '../../config';
import StartEndGeoDef from './StartEndGeoDef.jsx';
import { initializeApp } from 'firebase/app';
import { AppContext } from '../../App.jsx';

const story = {
  title: 'StartEndGeoDef',
  component: StartEndGeoDef,
};

export default story;

initializeApp(JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG));

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
      <AppContext.Provider value={{ appState: { settings: { coordType: 'something' } }, appDispatch: () => {} }}>
        <StartEndGeoDef map={map} coordinatePairs={coordinatePairs} setCoordinatePairs={setCoordinatePairs} />
        <button onClick={mapClick}>Map click</button>
      </AppContext.Provider>
    </>
  );
};
