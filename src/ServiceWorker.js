// inspired by: https://firebase.google.com/docs/auth/web/service-worker-sessions
import { initializeApp } from 'firebase/app';
import { getAuth, getIdToken, onAuthStateChanged } from 'firebase/auth';

initializeApp(process.env.VITE_FIREBASE_CONFIG);

const auth = getAuth();

const onError = () => {
  self.clients.matchAll().then((matchedClients) => {
    matchedClients.forEach((client) => {
      client.postMessage({ type: 'idTokenError' });
    });
  });
};

const getIdTokenPromise = () => {
  if (!auth.currentUser) {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          unsubscribe();
          getIdToken(user).then(
            (idToken) => {
              resolve(idToken);
            },
            (error) => {
              console.error('Error getting ID token after auth state change', error);
              onError();
              resolve(null);
            },
          );
        } else {
          console.error('No user is signed in.');
        }
      });
    });
  }

  return getIdToken(auth.currentUser).catch((error) => {
    console.log('error getting initial id token', error);

    onError(error);
  });
};

self.addEventListener('install', (event) => {
  console.log(`service worker install at: ${new Date().toLocaleTimeString()}`);

  event.waitUntil(self.skipWaiting()); // don't wait for any previous workers to finish
});

self.addEventListener('activate', (event) => {
  console.log(`service worker activate at: ${new Date().toLocaleTimeString()}`);
  event.waitUntil(self.clients.claim()); // immediately begin to catch fetch events without a page reload
});

// Get underlying body if available. Works for text and json bodies.
const getBodyContent = (req) => {
  return Promise.resolve()
    .then(() => {
      if (req.method !== 'GET') {
        if (req.headers.get('Content-Type').indexOf('json') !== -1) {
          return req.json().then((json) => {
            return JSON.stringify(json);
          });
        } else {
          return req.text();
        }
      }
    })
    .catch(() => {
      // Ignore error.
    });
};

self.addEventListener('fetch', (event) => {
  /** @type {FetchEvent} */
  const evt = event;

  const requestProcessor = (idToken) => {
    let req = evt.request;
    let processRequestPromise = Promise.resolve();
    // Clone headers as request headers are immutable.
    const headers = new Headers();
    req.headers.forEach((val, key) => {
      headers.append(key, val);
    });
    // Add ID token to header.
    headers.append('Authorization', 'Bearer ' + idToken);
    processRequestPromise = getBodyContent(req).then((body) => {
      try {
        req = new Request(req.url, {
          method: req.method,
          headers: headers,
          cache: req.cache,
          redirect: req.redirect,
          referrer: req.referrer,
          body,
        });
      } catch {
        // This will fail for CORS requests. We just continue with the
        // fetch caching logic below and do not pass the ID token.
      }
    });

    return processRequestPromise.then(() => {
      return fetch(req);
    });
  };

  if (event.request.url.includes('/maps/')) {
    return evt.respondWith(getIdTokenPromise().then(requestProcessor, requestProcessor));
  }

  return event.respondWith(fetch(event.request));
});

console.log(`service worker initialized at: ${new Date().toLocaleTimeString()}`);
