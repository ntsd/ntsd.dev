const PRE_CACHE="0.ea3nxke0r5",RUNTIME_CACHE="0.82yol60iv06",PRE_CACHE_URLS=["./assets/css/style.css","./assets/css/prism.css","./pwa/manifest.json","./pwa/icons/icon-min.svg"],HOSTNAME_WHITELIST=["ntsd.dev","giscus.app"],cacheFirst=async e=>{const s=await caches.open(RUNTIME_CACHE);var t=await s.match(e.request);if(t)return t;try{const a=await fetch(e.request);return await s.put(e.request,a.clone()),a}catch(e){return new Response("Network error happened",{status:408,headers:{"Content-Type":"text/plain"}})}};self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const e of await caches.keys())e!==PRE_CACHE&&e!=RUNTIME_CACHE&&await caches.delete(e)})())}),self.addEventListener("install",e=>{e.waitUntil((async()=>{const e=await caches.open(PRE_CACHE);await e.addAll(PRE_CACHE_URLS)})())}),self.addEventListener("fetch",e=>{var s=new URL(e.request.url)["hostname"];-1<HOSTNAME_WHITELIST.indexOf(s)&&e.respondWith(cacheFirst(e))});