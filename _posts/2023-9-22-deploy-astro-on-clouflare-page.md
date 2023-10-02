---
layout: post
title: "Deploy Astro Hybrid rendering site on Clouldflare Pages"
date: 2023-9-22
description: "A guild to deploy Astro Hybrid Rendering site on Cloudflare Pages and Cloudflare Functions. plus Cloudflare KV binding"
catalog: true
categories:
  - Software Development
tags:
  - Programming
  - Frontend
  - Cloudflare
published: false
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
│   │   └── [[id]].js           - Cloudflare Function for document (not using because it will repalce by static HTML)
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

## Cloudflare Functions Middleware

https://developers.cloudflare.com/pages/platform/functions/middleware/

https://csswizardry.com/2019/03/cache-control-for-civilians/

## Headers
