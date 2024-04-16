import topic from 'pubsub-js';
import { useState } from 'react';
import config from '../../config';
import useUniqueId from '../../hooks/useUniqueId';
import PointDef from './PointDef.jsx';
import { initializeApp } from 'firebase/app';
import { AppContext } from '../../App.jsx';

const story = {
  title: 'PointDef',
  component: PointDef,
};

export default story;

initializeApp(JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG));

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
      <AppContext.Provider value={{ appState: { settings: { coordType: 'something' } }, appDispatch: () => {} }}>
        <PointDef label="Start" id="default" coordinates={coordinates} setCoordinates={setCoordinates} map={map} />
        <button onClick={mapClick}>Map click</button>
        <button onClick={otherButtonClick}>Other button click</button>
      </AppContext.Provider>
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
    <AppContext.Provider value={{ appState: { settings: { coordType: 'something' } }, appDispatch: () => {} }}>
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
    </AppContext.Provider>
  );
};
