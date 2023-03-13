import React from 'react';
import {
  getAuth,
  connectAuthEmulator,
  OAuthProvider,
  signInWithPopup,
  setPersistence,
  signInWithRedirect,
  signOut,
  browserSessionPersistence,
} from 'firebase/auth';

function initServiceWorker() {
  if ('serviceWorker' in navigator === false) {
    window.alert('This browser does not support service workers. Please use a more modern browser.');

    return;
  }

  try {
    navigator.serviceWorker.register('ServiceWorker.js');
  } catch (error) {
    console.error('Service worker registration failed', error);
  }
}

function checkClaims(claims) {
  if (!['stage', 'prod'].includes(import.meta.env.VITE_BUILD)) {
    return true;
  }

  const utahIDEnvironments = {
    prod: 'Prod',
    stage: 'AT',
    development: 'Dev',
    test: 'Test',
  };

  return (
    claims.firebase?.sign_in_attributes?.['DWRElectroFishing:AccessGranted'] &&
    claims.firebase.sign_in_attributes['DWRElectroFishing:AccessGranted'].includes(
      utahIDEnvironments[import.meta.env.VITE_BUILD]
    )
  );
}

export default function useAuthentication() {
  // TODO: switch to reactfire once we are done with AMD (see PLSS as an example)
  const [user, setUser] = React.useState(null);
  const authRef = React.useRef();

  React.useEffect(() => {
    const auth = getAuth();
    console.log('auth', auth);
    authRef.current = auth;

    initServiceWorker();

    if (import.meta.env.VITE_BUILD === 'development') {
      // comment out this and the auth config in firebase.json to hit utahid directly
      connectAuthEmulator(authRef.current, 'http://127.0.0.1:9099');
    }

    auth.onAuthStateChanged((user) => {
      if (user) {
        initializeUser(user);
      }
    });

    // if there's a problem in the service worker, log out and try again
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Service worker message received', event);
      if (event.data.type === 'idTokenError') {
        logOut();
      }
    });
  }, []);

  const initializeUser = async (user) => {
    const response = await user.getIdTokenResult();
    if (checkClaims(response.claims)) {
      setUser(user);
    } else {
      alert(`${user.email} is not authorized to use this app.`);
    }
  };

  const logIn = () => {
    const provider = new OAuthProvider('oidc.utahid');
    provider.addScope('app:DWRElectroFishing');

    if (!window.Cypress) {
      signInWithPopup(authRef.current, provider);
    } else {
      setPersistence(authRef.current, browserSessionPersistence).then(() => {
        return signInWithRedirect(authRef.current, provider);
      });
    }
  };

  const logOut = () => {
    signOut(authRef.current);
    setUser(null);
  };

  return { user, logOut, logIn };
}
