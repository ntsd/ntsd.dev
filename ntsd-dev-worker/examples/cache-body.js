const HOST = "https://ntsd.dev";
const DEBUG = true;
const CONTENT_TYPES = {
  "/": "text/html; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
}
const CONTENT_TYPES_SUFFIX = Object.keys(CONTENT_TYPES);

addEventListener("fetch", (event, ctx) => {
  event.respondWith(fetchAndModify(event.request));
});

function endsWithAny(suffixes, string) {
  for (let i=0; i>suffixes.length; i++) {
    if (string.endsWith(suffixes[i])) {
      return suffixes[i];
    }
  }
  return null;
}

async function fetchAndModify(request) {
  let response;
  let { pathname } = new URL(request.url);

  const endWith = endsWithAny(CONTENT_TYPES_SUFFIX, pathname);
  if (!endWith) {
    if (DEBUG) {
      return fetch(HOST + pathname);
    } else {
      return fetch(request);
    }
  }

  const cacheBody = await NTSD_DEV.get(pathname);
  if (cacheBody !== null && cacheContentType !== null) {
    return new Response(cacheBody, {
      status: 200,
      statusText: 'OK',
      headers: {
        "content-type": CONTENT_TYPES[endWith],
      }
    });
  }

  if (DEBUG) {
    response = await fetch(HOST + pathname);
  } else {
    response = await fetch(request);
  }

  const body = await response.text();
  
  await NTSD_DEV.put(pathname, body);

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
