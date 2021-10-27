const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  "./",
  './assets/css/style.css',
  './img/icon-min.svg',
  // External
  'https://cdn.jsdelivr.net/npm/anchor-js@4.3.1/anchor.min.js',
  'https://cdn.jsdelivr.net/npm/scrollnav@3.0.1/dist/scrollnav.min.umd.js',
  'https://cdn.jsdelivr.net/npm/wordcloud@1.2.2/src/wordcloud2.min.js',
  'https://giscus.app/client.js',
  'https://giscus.app/js/iframeResizer.min.js',
];

// whitelist hostname to cache
const HOSTNAME_WHITELIST = [
  self.location.hostname,
  "cdn.jsdelivr.net",
  "giscus.app",
]

// Cache url when install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// Remove old cache when activate
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // validate if hostname in whitelist
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
