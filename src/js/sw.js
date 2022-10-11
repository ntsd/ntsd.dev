const PRE_CACHE = 'p1';
const RUNTIME_CACHE = 'r1';

// A list of local resources we always want to be cached.
const PRE_CACHE_URLS = [
    './assets/css/style.css',
    './pwa/manifest.json',
    './pwa/icons/icon-min.svg',
    './favicon.ico',
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
    const cacheKeepList = [PRE_CACHE, RUNTIME_CACHE];
    
    event.waitUntil(
        (async () => {
            // remove old cache
            const keyList = await caches.keys();
            const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
            await Promise.all(cachesToDelete.map(async (key) => {
                await caches.delete(key);
            }));

            // enable navigation preload
            if (self.registration.navigationPreload) {
                await self.registration.navigationPreload.enable();
            }
        })()
    );
});

self.addEventListener("install", (event) => {
    // cache all precach url
    event.waitUntil(
        (async () => {
            const cache = await caches.open(PRE_CACHE);
            await cache.addAll(PRE_CACHE_URLS);
        })()
    );
});

self.addEventListener("fetch", (event) => {
    let { hostname } = new URL(event.request.url);

    // validate if hostname in whitelist
    if (HOSTNAME_WHITELIST.indexOf(hostname) > -1) {
        event.respondWith(cacheFirst(event.request, event.preloadResponse));
    }
});
