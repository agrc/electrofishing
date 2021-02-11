import * as React from 'react';
import { produce } from 'immer';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import NewCollectionEvent from './components/NewCollectionEvent';

export const AppContext = React.createContext();
export const actionTypes = {
  CURRENT_MAP_ZOOM: 'CURRENT_MAP_ZOOM',
  CURRENT_MAP_CENTER: 'CURRENT_MAP_CENTER',
};

const initialState = {
  currentMapExtent: {
    zoom: 10,
    // TODO: get from geolocation
    center: [40.6, -111.7],
  },
};
const reducer = (state, action) => {
  return produce((state, draft) => {
    switch (action.type) {
      case actionTypes.CURRENT_MAP_ZOOM:
        draft.currentMapExtent.zoom = action.payload;

        break;
      case actionTypes.CURRENT_MAP_CENTER:
        draft.currentMapExtent.center = action.payload;

        break;

      default:
        break;
    }
  });
};

const App = () => {
  const [appState, appDispatch] = React.useReducer(reducer, initialState);
  const newEventDiv = React.useRef();

  React.useEffect(() => {
    // for tests?
    document.body.className += ' loaded';
  }, []);

  return (
    <AppContext.Provider value={{ appState, appDispatch }}>
      <div className="app">
        <Header />

        <div className="main-container container">
          <NewCollectionEvent />
        </div>

        <div data-dojo-type="app/SettingsDialog"></div>

        <footer>
          <div className="container">
            Built by{' '}
            <a href="http://gis.utah.gov/developer" title="AGRC" target="_blank" rel="noreferrer">
              AGRC
            </a>
          </div>
        </footer>

        <ToastContainer />
      </div>
    </AppContext.Provider>
  );
};

export default App;
