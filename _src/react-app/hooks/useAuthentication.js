import React from 'react';

async function initServiceWorker() {
  if ('serviceWorker' in navigator === false) {
    window.alert('This browser does not support service workers. Please use a more modern browser.');

    return;
  }

  try {
    await navigator.serviceWorker.register('ServiceWorker.js');

    return navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Service worker registration failed', error);
  }
}

async function sendTokenToServiceWorker(token) {
  const registration = await navigator.serviceWorker.ready;
  registration.active.postMessage({ type: 'access-token', token });
}

function checkClaims(claims) {
  if (!['stage', 'prod'].includes(process.env.REACT_APP_BUILD)) {
    return true;
  }

  const utahIDEnvironments = {
    prod: 'Prod',
    stage: 'AT',
    development: 'Dev',
  };

  return (
    claims.firebase?.sign_in_attributes?.['DWRElectroFishing:AccessGranted'] &&
    claims.firebase.sign_in_attributes['DWRElectroFishing:AccessGranted'].includes(
      utahIDEnvironments[process.env.REACT_APP_BUILD]
    )
  );
}

export default function useAuthentication() {
  const [user, setUser] = React.useState(null);
  const authRef = React.useRef();

  React.useEffect(() => {
    const giddyUp = async () => {
      const auth = window.firebase.auth.getAuth();
      authRef.current = auth;

      if (process.env.REACT_APP_BUILD === 'development') {
        // comment out this and the auth config in firebase.json to hit utahid directly
        window.firebase.auth.connectAuthEmulator(auth, 'http://localhost:9099');
      }

      const provider = new window.firebase.auth.OAuthProvider('oidc.utahid');
      provider.addScope('app:DWRElectroFishing');

      const result = await window.firebase.auth.getRedirectResult(auth);
      let timeoutId;
      const scheduleTokenRefresh = (expirationTime) => {
        timeoutId = setTimeout(async () => {
          console.log('refreshing token');
          const response = await result.user.getIdTokenResult();
          sendTokenToServiceWorker(response.token);

          scheduleTokenRefresh(response.expirationTime);
        }, new Date(expirationTime).getTime() - Date.now() + 1);
      };

      if (result?.user) {
        const response = await result.user.getIdTokenResult();
        if (checkClaims(response.claims)) {
          await initServiceWorker();
          sendTokenToServiceWorker(response.token);

          scheduleTokenRefresh(response.expirationTime);

          setUser(result.user);
        } else {
          alert(`${result.user.email} is not authorized to use this app.`);
        }
      } else {
        await window.firebase.auth.signInWithRedirect(auth, provider);
      }

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    };

    return giddyUp();
  }, []);

  const logOut = () => {
    window.firebase.auth.signOut(authRef.current);
    setUser(null);
  };

  return { user, logOut };
}
