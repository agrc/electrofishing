import * as React from 'react';
import { useImmerReducer } from 'use-immer';
import Header from './components/Header.jsx';
import { ToastContainer } from 'react-toastify';
import NewCollectionEvent from './components/NewCollectionEvent.jsx';
import SettingsDialog from './components/SettingsDialog.jsx';
import useAuthentication from './hooks/useAuthentication';
import { SamplingEventProvider } from './hooks/samplingEventContext.jsx';
import config from './config';
import { initializeApp } from 'firebase/app';
import { current } from 'immer';

const AppContext = React.createContext();

export function useAppContext() {
  const context = React.useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppContext.Provider');
  }

  return context;
}

export const actionTypes = {
  SUBMIT_LOADING: 'SUBMIT_LOADING',
  MAP: 'MAP',
  SETTINGS: 'SETTINGS',
};

const localStorageKey = 'electrofishing-app-state';
function getCachedSettings() {
  const value = localStorage.getItem(localStorageKey);
  if (value === null) {
    return null;
  }

  return JSON.parse(value);
}

function updateCachedSettings(values) {
  localStorage.setItem(localStorageKey, JSON.stringify(values));
}

const initialState = {
  submitLoading: false,
  map: null,
  settings: {
    currentTab: 'locationTab',
    zoom: 10,
    center: L.latLng(40.6, -111.7),
    coordType: config.coordTypes.utm83,
    mouseWheelZooming: false,
    ...getCachedSettings(),
  },
};

const reducer = (draft, action) => {
  switch (action.type) {
    case actionTypes.SUBMIT_LOADING:
      draft.submitLoading = action.payload;

      break;

    case actionTypes.MAP:
      draft.map = action.payload;

      break;

    case actionTypes.SETTINGS:
      draft.settings = {
        ...draft.settings,
        ...action.payload,
      };

      break;

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }

  updateCachedSettings(current(draft).settings);
};

const App = () => {
  const [appState, appDispatch] = useImmerReducer(reducer, initialState);

  React.useEffect(() => {
    // for cypress tests
    document.body.className += ' loaded';
  }, []);

  React.useLayoutEffect(() => {
    // this need to fire before the code in useAuthentication runs
    initializeApp(JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG));
    console.log('firebase app initialized');
  }, []);

  const { user, logOut, logIn } = useAuthentication();

  return (
    <AppContext.Provider value={{ appState, appDispatch }}>
      <div className="app">
        <Header submitLoading={appState.submitLoading} />

        <div className="container main-container">
          <div className="inner-header">
            {user ? (
              <>
                <span className="user">{user.email}</span>
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
          {user ? (
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
              payload: {
                [setting]: value,
              },
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
