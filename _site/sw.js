const PRE_CACHE="0.ultybzphnw",RUNTIME_CACHE="0.7bvpf7a4gr",PRE_CACHE_URLS=["./assets/css/style.css","./assets/css/prism.css","./pwa/manifest.json","./pwa/icons/icon-min.svg"],HOSTNAME_WHITELIST=["ntsd.dev","giscus.app"],cacheFirst=async e=>{var t=await caches.open(RUNTIME_CACHE),s=await t.match(e.request);if(s)return s;try{var a=await fetch(e.request);return await t.put(e.request,a.clone()),a}catch(e){return new Response("Network error happened",{status:408,headers:{"Content-Type":"text/plain"}})}};self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const e of await caches.keys())e!==PRE_CACHE&&e!=RUNTIME_CACHE&&await caches.delete(e)})())}),self.addEventListener("install",e=>{e.waitUntil((async()=>{await(await caches.open(PRE_CACHE)).addAll(PRE_CACHE_URLS)})())}),self.addEventListener("fetch",e=>{var t=new URL(e.request.url)["hostname"];-1<HOSTNAME_WHITELIST.indexOf(t)&&e.respondWith(cacheFirst(e))});