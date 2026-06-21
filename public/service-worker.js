// Bump the cache name on any change so the activate step purges the previous
// cache. v3 fixes a bug where API (Supabase) GET responses were being cached,
// which served stale data (e.g. newly added rows not appearing until a hard
// refresh). The fetch handler now ONLY touches same-origin GET requests.
const CACHE_NAME = 'teamsmiths-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

// Install - cache the app shell and activate immediately.
self.addEventListener('install', event => {
  console.log('[SW] Installing new service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate - delete old caches (including the poisoned v2 cache) and take control.
self.addEventListener('activate', event => {
  console.log('[SW] Activating new service worker');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      }))
  );
});

// Fetch - ONLY ever handle same-origin GET requests.
// Everything else (API calls to Supabase, any cross-origin request, and any
// non-GET method) is left to the browser so it ALWAYS hits the network. This
// guarantees data is never served stale from the cache.
self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return; // never cache cross-origin (e.g. Supabase API)

  // Network-first for navigations / HTML documents.
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for same-origin static assets (filenames are content-hashed,
  // so a new deploy produces new URLs that miss the cache and fetch fresh).
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
        return response;
      });
    })
  );
});
