import React from 'react';

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
  if (!['stage', 'prod'].includes(process.env.REACT_APP_BUILD)) {
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
      utahIDEnvironments[process.env.REACT_APP_BUILD]
    )
  );
}

export default function useAuthentication() {
  // TODO: switch to reactfire once we are done with AMD (see PLSS as an example)
  const [user, setUser] = React.useState(null);
  const authRef = React.useRef();

  React.useEffect(() => {
    const auth = window.firebase.auth.getAuth();
    console.log('auth', auth);
    authRef.current = auth;

    initServiceWorker();

    if (process.env.REACT_APP_BUILD === 'development') {
      // comment out this and the auth config in firebase.json to hit utahid directly
      window.firebase.auth.connectAuthEmulator(authRef.current, 'http://localhost:9099');
    }

    auth.onAuthStateChanged((user) => {
      if (user) {
        initializeUser(user);
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
    const provider = new window.firebase.auth.OAuthProvider('oidc.utahid');
    provider.addScope('app:DWRElectroFishing');

    if (!window.Cypress) {
      window.firebase.auth.signInWithPopup(authRef.current, provider);
    } else {
      window.firebase.auth.setPersistence(authRef.current, window.firebase.auth.browserSessionPersistence).then(() => {
        return window.firebase.auth.signInWithRedirect(authRef.current, provider);
      });
    }
  };

  const logOut = () => {
    window.firebase.auth.signOut(authRef.current);
    setUser(null);
  };

  return { user, logOut, logIn };
}
