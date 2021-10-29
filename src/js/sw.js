const PRE_CACHE = 'precache-v1';
const RUNTIME_CACHE = 'runtime';
const HASH_CACHE = 'hash';

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

self.addEventListener('activate', event => {
  const currentCaches = [PRE_CACHE, RUNTIME_CACHE, HASH_CACHE];
  // Remove old cache when activate
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
}

self.addEventListener('fetch', event => {
  let { pathname, hostname } = new URL(event.request.url);
  let cachedHit = false;

  // validate if hostname in whitelist
  if (HOSTNAME_WHITELIST.indexOf(hostname) > -1) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) { // when cache hit
          cachedHit = true;
          return cachedResponse;
        }

        return fetchAndCache(event.request);
      })
    );
  }
  
  setTimeout(() => {
    // Check cache updated when cached hit and it's same host
    if (cachedHit && event.request.url.startsWith(self.location.origin)) {
      if (pathname.endsWith('/')) { // when path end with / should load /index.html
        pathname += 'index.html';
      }
      const hashRequest = new Request(CLOUDFLARE_WORKER_HOST + pathname, {
        mode: 'cors',
      });

      caches.match(hashRequest)
        .then(oldHashResponse => {
          return fetch(hashRequest)
            .then(async newHashResponse => {
              const newHashResponseClone = newHashResponse.clone();
              const newHash = await newHashResponse.text();
              if (newHash == '') {
                console.log(`new hash not found ${pathname}`);
                return newHashResponse;
              }

              if (oldHashResponse) { // hash cache found
                const oldHash = await oldHashResponse.text();
                if (newHash !== oldHash) { // refetch when hash not matched
                  console.log(`cache not matched ${pathname} ${oldHash} ${newHash} refetch`);
                  fetchAndCache(event.request);
                }
              }

              caches.open(HASH_CACHE).then(cache => {
                cache.put(hashRequest, newHashResponseClone)
              });

              return newHashResponse;
            })
            .catch(err => {
              console.error(err);
            });
        });
    };
  }, 1000);
});
