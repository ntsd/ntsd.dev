const PRE_CACHE="0.xhavll4n8a8",RUNTIME_CACHE="0.5aqld6nh1qw",PRE_CACHE_URLS=["./assets/css/style.css","./assets/css/prism.css","./pwa/manifest.json","./pwa/icons/icon-min.svg"],HOSTNAME_WHITELIST=["ntsd.dev","giscus.app"],cacheFirst=async e=>{var a=await caches.open(RUNTIME_CACHE),s=await a.match(e.request);if(s)return s;try{var t=await fetch(e.request);return await a.put(e.request,t.clone()),t}catch(e){return new Response("Network error happened",{status:408,headers:{"Content-Type":"text/plain"}})}};self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const e of await caches.keys())e!==PRE_CACHE&&e!=RUNTIME_CACHE&&await caches.delete(e)})())}),self.addEventListener("install",e=>{e.waitUntil((async()=>{await(await caches.open(PRE_CACHE)).addAll(PRE_CACHE_URLS)})())}),self.addEventListener("fetch",e=>{var a=new URL(e.request.url)["hostname"];-1<HOSTNAME_WHITELIST.indexOf(a)&&e.respondWith(cacheFirst(e))});