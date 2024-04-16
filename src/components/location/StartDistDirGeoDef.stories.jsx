import topic from 'pubsub-js';
import { useState } from 'react';
import config from '../../config';
import StartDistDirGeoDef from './StartDistDirGeoDef.jsx';
import { initializeApp } from 'firebase/app';
import { AppContext } from '../../App.jsx';

const story = {
  title: 'StartDistDirGeoDef ',
  component: StartDistDirGeoDef,
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
      <AppContext.Provider value={{ appState: { settings: { coordType: 'something' } }, appDispatch: () => {} }}>
        <StartDistDirGeoDef map={map} params={params} setParams={setParams} />
        <button onClick={mapClick}>Map click</button>
      </AppContext.Provider>
    </>
  );
};
