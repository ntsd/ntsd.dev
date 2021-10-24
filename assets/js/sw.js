const PRECACHE="precache-v1",RUNTIME="runtime",PRECACHE_URLS=["./","./404.html","./offline.html","./assets/css/style.css","./img/icon-min.svg","https://cdn.jsdelivr.net/npm/anchor-js@4.3.1/anchor.min.js","https://cdn.jsdelivr.net/npm/scrollnav@3.0.1/dist/scrollnav.min.umd.js","https://cdn.jsdelivr.net/npm/wordcloud@1.2.2/src/wordcloud2.min.js","https://giscus.app/client.js","https://giscus.app/js/iframeResizer.min.js"];self.addEventListener("install",e=>{e.waitUntil(caches.open(PRECACHE).then(e=>e.addAll(PRECACHE_URLS)).then(self.skipWaiting()))}),self.addEventListener("activate",e=>{const s=[PRECACHE,RUNTIME];e.waitUntil(caches.keys().then(e=>e.filter(e=>!s.includes(e))).then(e=>Promise.all(e.map(e=>caches.delete(e)))).then(()=>self.clients.claim()))}),self.addEventListener("fetch",t=>{t.request.url.startsWith(self.location.origin)&&t.respondWith(caches.match(t.request).then(e=>e||caches.open(RUNTIME).then(s=>fetch(t.request).then(e=>s.put(t.request,e.clone()).then(()=>e)))))});