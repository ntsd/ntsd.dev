// Transitional Service Worker for ntsd.dev (Astro SSG Migration)
const CACHE_NAME = 'ntsd-cache-v2';

const OFFLINE_URL = '/offline/';

const PRECACHE_ASSETS = [
  '/',
  '/offline/',
  '/pwa/manifest.json',
  '/pwa/icons/icon-min.svg',
  '/assets/css/style.css',
  '/assets/css/prism.css',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          // Purge legacy Jekyll cache buckets and old versions
          if (
            key.startsWith('pre-version') ||
            key.startsWith('runtime-version') ||
            key !== CACHE_NAME
          ) {
            console.log('[sw] Deleting obsolete cache bucket:', key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
      console.log('[sw] Claimed clients and activated:', CACHE_NAME);
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests and same-origin / whitelisted assets
  if (request.method !== 'GET') return;

  // Let external analytics and Giscus pass straight through to the network
  if (
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('giscus.app')
  ) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          console.warn('[sw] Navigation fetch failed, falling back to cache:', url.pathname);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await caches.match(OFFLINE_URL);
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response('Offline and page not cached', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })()
    );
    return;
  }

  // 2. Static Assets (Same Origin): Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            // Network failure is fine for background revalidation
            return null;
          });

        return cachedResponse || fetchPromise;
      })()
    );
  }
});

