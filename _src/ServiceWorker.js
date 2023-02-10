/* eslint-disable no-restricted-globals */

// https://web.dev/service-worker-lifecycle/

self.addEventListener('install', () => {
  console.log(`service worker install at: ${new Date().toLocaleTimeString()}`);

  self.skipWaiting(); // don't wait for any previous workers to finish
});

self.addEventListener('activate', () => {
  console.log(`service worker activate at: ${new Date().toLocaleTimeString()}`);
  // eslint-disable-next-line no-undef
  clients.claim(); // immediately begin to catch fetch events without a page reload
});

let token;
self.addEventListener('message', (event) => {
  if (event.data.type === 'access-token') {
    console.log(`service worker message: ${event.data} | at: ${new Date().toLocaleTimeString()}`, event.data);
    token = event.data.token;
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/maps/')) {
    if (!token) {
      throw new Error('service worker: token not set!');
    }

    // add firebase token to request headers
    const headers = new Headers(event.request.headers);
    headers.set('Authorization', `Bearer ${token}`);

    const newRequest = new Request(event.request, {
      headers,
    });

    event.respondWith(fetch(newRequest));
  } else if (event.request) {
    event.respondWith(fetch(event.request));
  }
});

console.log(`service worker initialized at: ${new Date().toLocaleTimeString()}`);
