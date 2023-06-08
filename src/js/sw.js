const PRE_CACHE = "p2";
const RUNTIME_CACHE = "r2";

// A list of local resources we always want to be cached.
const PRE_CACHE_URLS = [
  "./assets/css/style.css",
  "./assets/css/prism.css",
  "./pwa/manifest.json",
  "./pwa/icons/icon-min.svg",
];

// whitelist hostname to cache
const HOSTNAME_WHITELIST = ["ntsd.dev", "giscus.app"];

const cacheFirst = async (event) => {
  const cache = await caches.open(RUNTIME_CACHE);

  // try to get the resource from the cache
  const responseFromCache = await cache.match(event.request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // try to use the navigation preloaded response
  // const preloadResponse = await event.preloadResponse;
  // if (preloadResponse) {
  //   return preloadResponse;
  // }

  // try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(event.request);
    await cache.put(event.request, responseFromNetwork.clone());

    return responseFromNetwork;
  } catch (error) {
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // remove old cache
      for (const key of await caches.keys()) {
        await caches.delete(key);
      }

      // enable navigation preload
      // if (self.registration.navigationPreload) {
      //   await self.registration.navigationPreload.enable();
      // }
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
    event.respondWith(cacheFirst(event));
  }
});
