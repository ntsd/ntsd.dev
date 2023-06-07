const PRE_CACHE="p1",RUNTIME_CACHE="r1",PRE_CACHE_URLS=["./assets/css/style.css","./pwa/manifest.json","./pwa/icons/icon-min.svg"],HOSTNAME_WHITELIST=["ntsd.dev","giscus.app"],putInCache=async(e,t)=>{const a=await caches.open(RUNTIME_CACHE);await a.put(e,t)},cacheFirst=async e=>{var t=await caches.match(e.request);if(t)return t;try{const a=await fetch(e.request);return putInCache(e.request,a.clone()),a}catch(e){return new Response("Network error happened",{status:408,headers:{"Content-Type":"text/plain"}})}};self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const e of await caches.keys())e!==CACHE&&await caches.delete(e)})())}),self.addEventListener("install",e=>{e.waitUntil((async()=>{const e=await caches.open(PRE_CACHE);await e.addAll(PRE_CACHE_URLS)})())}),self.addEventListener("fetch",e=>{var t=new URL(e.request.url)["hostname"];-1<HOSTNAME_WHITELIST.indexOf(t)&&e.respondWith(cacheFirst(e))});