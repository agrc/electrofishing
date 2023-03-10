import * as React from 'react';
import { useImmerReducer } from 'use-immer';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import NewCollectionEvent from './components/NewCollectionEvent';
import SettingsDialog from './components/SettingsDialog';
import useAuthentication from './hooks/useAuthentication';
import { SamplingEventProvider } from './hooks/samplingEventContext';
import config from './config';

const AppContext = React.createContext();

export function useAppContext() {
  const context = React.useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppContext.Provider');
  }

  return context;
}

export const actionTypes = {
  CURRENT_MAP_ZOOM: 'CURRENT_MAP_ZOOM',
  CURRENT_MAP_CENTER: 'CURRENT_MAP_CENTER',
  SUBMIT_LOADING: 'SUBMIT_LOADING',
  MAP: 'MAP',
  CURRENT_TAB: 'CURRENT_TAB',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SETTINGS: 'SETTINGS',
};

const initialState = {
  zoom: 10,
  // TODO: get from geolocation
  center: L.latLng(40.6, -111.7),
  submitLoading: false,
  map: null,
  currentTab: 'locationTab',
  user: null,
  // TODO: persist all of this using useLocalStorage
  settings: {
    coordType: config.coordTypes.utm83,
    mouseWheelZooming: false,
  },
};

const reducer = (draft, action) => {
  switch (action.type) {
    case actionTypes.CURRENT_MAP_ZOOM:
      draft.zoom = action.payload;

      break;

    case actionTypes.CURRENT_MAP_CENTER:
      draft.center = action.payload;

      break;

    case actionTypes.SUBMIT_LOADING:
      draft.submitLoading = action.payload;

      break;

    case actionTypes.MAP:
      draft.map = action.payload;

      break;

    case actionTypes.CURRENT_TAB:
      draft.currentTab = action.payload;

      break;

    case actionTypes.LOGIN:
      draft.user = action.payload;

      break;

    case actionTypes.LOGOUT:
      draft.user = null;

      break;

    case actionTypes.SETTINGS:
      draft.settings[action.meta] = action.payload;

      break;

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const App = () => {
  const [appState, appDispatch] = useImmerReducer(reducer, initialState);

  React.useEffect(() => {
    // for cypress tests
    document.body.className += ' loaded';
  }, []);

  React.useLayoutEffect(() => {
    // this need to fire before the code in useAuthentication runs
    window.firebase.app.initializeApp(JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG));
    console.log('firebase app initialized');
  }, []);

  const { user, logOut, logIn } = useAuthentication();
  React.useEffect(() => {
    if (user) {
      appDispatch({ type: 'LOGIN', payload: user });
    } else {
      appDispatch({ type: 'LOGOUT' });
    }
  }, [appDispatch, user]);

  return (
    <AppContext.Provider value={{ appState, appDispatch }}>
      <div className="app">
        <Header submitLoading={appState.submitLoading} />

        <div className="container main-container">
          <div className="inner-header">
            {appState.user ? (
              <>
                <span className="user">{appState.user.email}</span>
                <button id="logout" type="button" className="btn btn-link" onClick={logOut}>
                  Logout
                </button>
              </>
            ) : (
              <button id="login" type="button" className="btn btn-link login-button" onClick={logIn}>
                Login with UtahID
              </button>
            )}
          </div>
          {appState.user ? (
            <SamplingEventProvider>
              <NewCollectionEvent />
            </SamplingEventProvider>
          ) : null}
        </div>

        <SettingsDialog
          state={appState.settings}
          onChange={(setting, value) =>
            appDispatch({
              type: actionTypes.SETTINGS,
              meta: setting,
              payload: value,
            })
          }
        />

        <footer>
          <div className="container">
            Built by{' '}
            <a href="http://gis.utah.gov/developer" title="UGRC" target="_blank" rel="noreferrer">
              UGRC
            </a>
          </div>
        </footer>

        <ToastContainer />
      </div>
    </AppContext.Provider>
  );
};

export default App;
