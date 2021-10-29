let HOST = "https://ntsd.dev";
let API_KEY = "";

const DEBUG = true;

if (DEBUG) {
  HOST = "*";
  API_KEY = "";
}

addEventListener("fetch", (event, ctx) => {
  event.respondWith(fetchAndModify(event.request));
});

async function fetchAndModify(request) {
  let { pathname } = new URL(request.url);

  console.log(pathname, request.method);
  if (request.method == 'OPTIONS') { // preflight
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Access-Control-Allow-Origin",
        "Access-Control-Allow-Origin": HOST,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
    });
  }
  if (request.method === 'GET') {
    const hash = await NTSD_DEV.get(pathname);
    if (hash !== null) {
      return new Response(hash, {
        status: 200,
        headers: {
          "Content-Type": 'text/plain',
          "Access-Control-Allow-Origin": HOST,
        },
      });
    }
    return new Response('', {
      status: 200,
      headers: {
        "Content-Type": 'text/plain',
        "Access-Control-Allow-Origin": HOST,
      },
    });
  }

  if (!DEBUG) {
    if (request.headers.get('Authorization') !== API_KEY) {
      console.log(request.headers.get('Authorization'), API_KEY);
      return new Response('', {
        status: 401,
      });
    }
  }

  await NTSD_DEV.put(pathname, request.body);

  return new Response('', {
    status: 200,
  });
}
