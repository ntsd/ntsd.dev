const PRE_CACHE = 'p1';
const RUNTIME_CACHE = 'r1';

// A list of local resources we always want to be cached.
const PRE_CACHE_URLS = [
    './assets/css/style.css',
    './pwa/manifest.json',
    './pwa/icons/icon-min.svg',
    './favicon.ico',
    // External
    // 'https://giscus.app/client.js',
];

// whitelist hostname to cache
const HOSTNAME_WHITELIST = [
    "ntsd.dev",
    "giscus.app",
]

const putInCache = async (request, response) => {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response);
};

const cacheFirst = async (request, preloadResponsePromise) => {
    // try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        putInCache(request, preloadResponse.clone());
        return preloadResponse;
    }

    // try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};

self.addEventListener('activate', event => {
    const currentCaches = [PRE_CACHE, RUNTIME_CACHE];
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

    // enable navigation preload
    event.waitUntil(async () => {
        if (self.registration.navigationPreload) {
            await self.registration.navigationPreload.enable();
        }
    });
});

self.addEventListener("install", (event) => {
    // cache all precach url
    event.waitUntil(
        caches.open(PRE_CACHE)
            .then(cache => cache.addAll(PRE_CACHE_URLS))
            .then(self.skipWaiting())
    );
});

self.addEventListener("fetch", (event) => {
    let { hostname } = new URL(event.request.url);

    // validate if hostname in whitelist
    if (HOSTNAME_WHITELIST.indexOf(hostname) > -1) {
        event.respondWith(cacheFirst(event.request, event.preloadResponse));
    }
});
