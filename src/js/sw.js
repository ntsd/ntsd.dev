const PRE_CACHE = 'precache-v1';
const RUNTIME_CACHE = 'runtime';
const HASH_CACHE = 'hash';

const HASH_PREFIX = 'hash-';
const CLOUDFLARE_WORKER_HOST = "http://127.0.0.1:8787";// "https://ntsd-dev-worker.ntsd.workers.dev";

// A list of local resources we always want to be cached.
const PRE_CACHE_URLS = [
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
    caches.open(PRE_CACHE)
      .then(cache => cache.addAll(PRE_CACHE_URLS))
      .then(self.skipWaiting())
  );
});

// Remove old cache when activate
self.addEventListener('activate', event => {
  const currentCaches = [PRE_CACHE, RUNTIME_CACHE];
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

function fetchAndCache(request) {
  return caches.open(RUNTIME_CACHE).then(cache => {
    return fetch(request).then(response => {
      return cache.put(request, response.clone()).then(() => {
        return response;
      });
    });
  });

  Promise.all([fetch(request), caches.open(RUNTIME_CACHE)])
    .then(([response, cache]) => response.ok && cache.put(request, response))
}

self.addEventListener('fetch', event => {
  let { pathname, hostname } = new URL(event.request.url);
  // console.log(hostname, pathname);
  const cached = caches.match(event.request);

  // validate if hostname in whitelist
  if (HOSTNAME_WHITELIST.indexOf(hostname) > -1) {
    event.respondWith(
      cached.then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetchAndCache(event.request);
      })
    );
  }

  // Check cache updated
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
    const hashRequest = new Request(CLOUDFLARE_WORKER_HOST + pathname, {
      mode: 'cors',
    });
  
    caches.match(hashRequest)
      .then(oldHashResponse => {
        if (!oldHashResponse) {
          // console.log("cache not found");
          return fetch(hashRequest)
            .then(response => {
              caches.open(RUNTIME_CACHE).then(cache => {
                cache.put(hashRequest, response.clone()).then(() => {
                  return response;
                });
              });
              return response;
            })
            .catch(err => {
              console.error(err);
            });
        }
        // console.log("cache found");
        fetch(hashRequest)
          .then(async newHashResponse => {
            const newHashResponseClone = newHashResponse.clone();
            const newHash = await newHashResponse.text();
            const oldHash = await oldHashResponse.text();
            if (newHash !== oldHash) { // when hash not matched refetch and reload
              console.log('cache not matched ', oldHash, newHash);
              fetchAndCache(event.request);
              caches.open(RUNTIME_CACHE).then(cache => {
                cache.put(hashRequest, newHashResponseClone)
              });
            }
          })
          .catch(err => {
            console.error(err);
          });
      })
      .catch(err => {
        console.error(err);
      });
  };
});
