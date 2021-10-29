const PRE_CACHE="precache-v1",RUNTIME_CACHE="runtime",HASH_CACHE="hash",CLOUDFLARE_WORKER_HOST="https://ntsd-dev-worker.ntsd.workers.dev",PRE_CACHE_URLS=["./","./assets/css/style.css","./img/icon-min.svg","https://cdn.jsdelivr.net/npm/anchor-js@4.3.1/anchor.min.js","https://cdn.jsdelivr.net/npm/scrollnav@3.0.1/dist/scrollnav.min.umd.js","https://cdn.jsdelivr.net/npm/wordcloud@1.2.2/src/wordcloud2.min.js","https://giscus.app/client.js","https://giscus.app/js/iframeResizer.min.js"],HOSTNAME_WHITELIST=[self.location.hostname,"cdn.jsdelivr.net","giscus.app"];function fetchAndCache(s){return caches.open(RUNTIME_CACHE).then(t=>fetch(s).then(e=>t.put(s,e.clone()).then(()=>e)))}self.addEventListener("install",e=>{e.waitUntil(caches.open(PRE_CACHE).then(e=>e.addAll(PRE_CACHE_URLS)).then(self.skipWaiting()))}),self.addEventListener("activate",e=>{const t=[PRE_CACHE,RUNTIME_CACHE,HASH_CACHE];e.waitUntil(caches.keys().then(e=>e.filter(e=>!t.includes(e))).then(e=>Promise.all(e.map(e=>caches.delete(e)))).then(()=>self.clients.claim()))}),self.addEventListener("fetch",a=>{let{pathname:i,hostname:e}=new URL(a.request.url),t=!1;-1<HOSTNAME_WHITELIST.indexOf(e)&&a.respondWith(caches.match(a.request).then(e=>e?(t=!0,e):fetchAndCache(a.request))),setTimeout(()=>{if(t&&a.request.url.startsWith(self.location.origin)){i.endsWith("/")&&(i+="index.html");const h=new Request(`${CLOUDFLARE_WORKER_HOST}/cache-bust${i}`,{mode:"cors"});caches.match(h).then(c=>fetch(h).then(async e=>{const t=e.clone();var s,n=await e.text();return""==n?console.log(`new hash not found ${i}`):(!c||n!==(s=await c.text())&&(console.log(`cache not matched ${i} ${s} ${n} refetch`),fetchAndCache(a.request)),caches.open(HASH_CACHE).then(e=>{e.put(h,t)})),e}).catch(e=>{console.error(e)}))}},1e3)});