import * as React from 'react';
import { useImmerReducer } from 'use-immer';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import NewCollectionEvent from './components/NewCollectionEvent';
import useDojoWidget from './hooks/useDojoWidget';
import SettingsDialog from 'app/SettingsDialog';
import useAuthentication from './hooks/useAuthentication';

export const AppContext = React.createContext();
export const actionTypes = {
  CURRENT_MAP_ZOOM: 'CURRENT_MAP_ZOOM',
  CURRENT_MAP_CENTER: 'CURRENT_MAP_CENTER',
  SUBMIT_LOADING: 'SUBMIT_LOADING',
  MAP: 'MAP',
  CURRENT_TAB: 'CURRENT_TAB',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
};

const initialState = {
  zoom: 10,
  // TODO: get from geolocation
  center: L.latLng(40.6, -111.7),
  submitLoading: false,
  map: null,
  currentTab: 'locationTab',
  user: null,
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

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const App = () => {
  const [appState, appDispatch] = useImmerReducer(reducer, initialState);

  React.useEffect(() => {
    // for tests?
    document.body.className += ' loaded';
  }, []);

  const settingsDialogDiv = React.useRef(null);
  useDojoWidget(settingsDialogDiv, SettingsDialog);

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
                <h4>Water Body</h4>
                <span>
                  <span className="user">{appState.user.email}</span>
                  <button id="logout" type="button" className="btn btn-link" onClick={logOut}>
                    Logout
                  </button>
                </span>
              </>
            ) : (
              <button id="login" type="button" className="btn btn-link login-button" onClick={logIn}>
                Login with UtahID
              </button>
            )}
          </div>
          {appState.user ? <NewCollectionEvent /> : null}
        </div>

        <div ref={settingsDialogDiv}></div>

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
