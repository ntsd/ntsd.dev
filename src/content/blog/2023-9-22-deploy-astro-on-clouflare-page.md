---
layout: post
title: "Deploy Astro Hybrid rendering site on Cloudflare Pages"
date: 2023-9-22
description: "A guild to deploy Astro Hybrid Rendering site on Cloudflare Pages and Cloudflare Functions. plus Cloudflare KV binding"
catalog: true
categories:
  - Software Development
tags:
  - Programming
  - Frontend
  - Cloudflare
published: true
---

This tutorial will show how to deploy Astro hybrid rendering site on Cloudflare Pages

## Introduction

Since Astro allow to determines which pages should be static or service side rendering (SSR).

[read more about hybrid rendering](https://astro.build/blog/hybrid-rendering/)

Github Example <https://github.com/lisuify/lisuify/tree/perf/web/packages/lisuify-web>

Project Structure Explain

```tree
.
├── dist
│   ├── _astro                  - Astro Bundle by Vite (CSS, JS)
│   └── docs                    - HTML files for documentation static pages
├── functions
│   ├── _image.js               - Cloudflare Function for image
│   ├── _middleware.ts          - Middleware Cloudflare Function
│   ├── docs
│   │   └── [[id]].js           - Cloudflare Function for document (not using because it will replace by static HTML)
│   ├── index.js                - Cloudflare Function for Index route
│   └── tsconfig.json           - TS config for Cloudflare Function
├── package.json
├── public
├── src
│   ├── pages
│   │   ├── docs
│   │   │   └── [...id].astro   - Astro static page (prerender = true)
│   │   └── index.astro         - Astro SSR page (prerender = false)
│   └── env.d.ts                - Astro Environment Types
└── tsconfig.json               - TS config for Astro
├── astro.config.mjs            - Astro config
```

## Add Cloudflare Astro Adaptor

astro.config.mjs

```js
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  ...
  adapter: cloudflare({
    mode: "directory",
    functionPerRoute: true,
  }),
});
```

We are using `directory` mode, this mode will generate routing to `/functions` directory for [Cloudflare Functions](https://developers.cloudflare.com/pages/platform/functions/). This allow you to customize [Middleware](https://developers.cloudflare.com/pages/platform/functions/middleware/) and other Cloudflare Functions features. 

`functionPerRoute` is `true` mean it will generate function files for each path. This is important if you want to separate SSR page and static page. For example, `/functions/docs/[[id]].js` is documents for the site and we want to to be static pre-rendered page for the faster load and `/functions/index.js` is the main application and it should be SSR for dynamic caching on server side to decrement API calling.

## Create KV Namespace

In example, I created KV namespace name `LISUIFY_KV_NAMESPACE`

![cloudflare kv namespace](/img/in-post/2023-9-22-deploy-astro-on-clouflare-page/cloudflare-kv-namespace.png)

## Typing

Before using Cloudflare Functions on your TypeScript code, you need to define type for the project by using Astro `env.d.ts`.

env.d.ts
```ts
/// <reference types="astro/client" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
  // replace `LISUIFY_KV_NAMESPACE` with your KV namespace
  LISUIFY_KV_NAMESPACE: KVNamespace;
};

// use `AdvanceRuntime<ENV>` for advance runtime mode
type Runtime = import("@astrojs/cloudflare").DirectoryRuntime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}
```

## Use Cloudflare KV on Astro Page

The example code show how to use Cloudflare KV inside `.astro` page to render the content before response to client (SSR).

```ts
const chacheKey = "stats";

const kvNamespace = Astro.locals.runtime.env.LISUIFY_KV_NAMESPACE;
const statsKV = await kvNamespace.get(chacheKey);

if (statsKV) {
  // stats cache hitted
} else {
  // fetch stats
}

// put to kv, for the next api call
await kvNamespace.put(chacheKey, JSON.stringify(stats), {
  expirationTtl: 600, // remove in 600 seconds
});
```

This code create to reduce numbers of stats fetching by cache into Cloudflare KV on the server side because the stats is the same on every clients to see at the time and use `expirationTtl: 600` to make it update every 600 seconds.

## Client Cache Control Headers

tell client brower to cache the page by Cache-Control headers and Functions Middleware 

_middleware.ts
```ts
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
};

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  response.headers.set("Cache-Control", "public, max-age=600");
  return response;
};
```

the cache is `max-age=600` mean 600 seconds or 10 minutes, `public` it will store in shared cache include CDN.

Read more about Functions Middleware: <https://developers.cloudflare.com/pages/platform/functions/middleware>

## Cloudflare Function Binding

Before deploy you need to add binding mapping Cloudflare Functions to your Cloudflare KV.

The following image shows how to map KV name space name `LISUIFY_KV_NAMESPACE` to `LISUIFY_KV_NAMESPACE` Cloudflare Functions KV variable

![Cloudflare Functions Binding](/img/in-post/2023-9-22-deploy-astro-on-clouflare-page/cloudflare-functions-binding.png)

Read more about Binding (I also wrote the section): <https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/#use-bindings-in-your-astro-application>
