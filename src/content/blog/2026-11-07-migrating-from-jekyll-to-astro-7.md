---
layout: post
title: "Migrating from Jekyll to Astro 7: Zero-JS, 100/100 Lighthouse, and Rolldown"
date: 2026-11-07
description: "A deep dive into migrating ntsd.dev from Jekyll, Gulp, and Puppeteer to Astro 7 and Rolldown while maintaining 100% route parity, Giscus discussions, and 100/100 Lighthouse scores."
catalog: true
categories:
  - Software Development
tags:
  - Astro
  - Web Performance
  - Frontend
  - Architecture
  - Node.js
published: true
---

For over six years, **[ntsd.dev](https://ntsd.dev)** ran on Jekyll. It served its purpose well: static HTML, Markdown articles, and zero server maintenance. But beneath the surface, the build pipeline had evolved into an unwieldy machine combining Ruby, Bundler, Gulp 4, Babel 6, Express, and headless Chromium via Puppeteer.

Recently, I completed a complete overhaul of the site, migrating it to **Astro 7**, **Vite 8**, and **Rolldown**.

This post shares the journey, the architectural decisions, the tricky edge cases (like PWA cache lockouts and Kramdown attribute leaks), and how we preserved 100/100 Lighthouse scores and 100% URL parity across all historical routes.

---

## Why Migrate a Working 100/100 Website?

Before this migration, `ntsd.dev` already scored 100/100 on Google Lighthouse. But the way it achieved that score was unsustainable.

```
Legacy Pipeline:
[Jekyll (Ruby)] ──> HTML ──> [Express Server :6969] ──> [Puppeteer / Chromium] ──> Serialized HTML
                                                              │
                                                • PrismJS Syntax Highlighting
                                                • AnchorJS Heading Links
                                                • Critical CSS Inlining
```

To deliver static HTML with pre-highlighted code and inlined critical CSS without runtime JavaScript, my build script did the following:
1. Ran Jekyll inside Ruby to render initial templates.
2. Started a local Express server on port `6969`.
3. Launched headless Chromium through Puppeteer to visit every generated page.
4. Executed client scripts (PrismJS, AnchorJS, WordCloud2) in the browser context.
5. Inlined critical CSS and saved the final serialized DOM to disk.

### The Problems

1. **Dual-Runtime Friction**: Requiring both Ruby (with native C gems) and Node.js meant local setup broke across macOS upgrades, and GitHub Actions CI took ~2.5–3.5 minutes on every push.
2. **Puppeteer Fragility**: Headless browser prerendering was memory-heavy, slow, and prone to random timeouts.
3. **No Schema Validation**: Jekyll's Liquid templates lacked type safety. A misspelled frontmatter field simply vanished without warning during build.
4. **Outdated Dependencies**: Ancient Gulp and Babel 6 plugins triggered npm audit warnings and prevented modern Node.js features.

It was time to consolidate onto a modern, single-runtime static site generator.

---

## Why Astro 7?

I wanted a modern static site generator with very specific constraints:
- **Zero client JavaScript by default** (`output: 'static'`).
- **No hydration overhead**: No unnecessary React, Vue, or Svelte client runtimes injected into post pages.
- **Fast compilation**: Lightning-fast builds using modern bundlers.
- **Type-safe Content Collections**: Zod schemas to validate post frontmatter and project metadata at compile time.

Astro fit these requirements perfectly. By moving straight to **Astro 7**, the project benefits from **Vite 8** and the Rust-based **Rolldown** bundler, slashing our production build time from over 160 seconds down to **~4.5 seconds**.

---

## Architecture of the New Stack

| Component | Legacy Stack | Astro 7 Stack |
| :--- | :--- | :--- |
| **Runtime** | Ruby 3.x + Node 18 | **Node 22 (LTS) / npm** |
| **Site Generator** | Jekyll 4 | **Astro 7 (`output: 'static'`)** |
| **Bundler & Compiler** | Gulp 4 + Babel 6 | **Vite 8 + Rolldown** |
| **Styling** | Custom PostCSS + Gulp | **Tailwind CSS v3 via PostCSS** |
| **Code Highlighting** | PrismJS via Puppeteer | **Shiki (`github-dark`) at build time** |
| **Headings & Anchors** | AnchorJS via Puppeteer | **`rehype-slug` + `rehype-autolink-headings`** |
| **Hosting & Edge** | Cloudflare Pages / Worker | **Cloudflare Pages (Direct Git Deploy)** |

---

## Crucial Migration Challenges

### 1. Preserving 100% Route Parity and Giscus Discussions

Reader discussions on `ntsd.dev` are powered by [Giscus](https://giscus.app), backed by GitHub Discussions. Giscus maps discussions using the `pathname` strategy.

If a single route changed—for example, if `/node-stream-pipe-and-transform/` became `/node-stream-pipe-and-transform` without a trailing slash—all historical comments for that post would instantly disappear.

To prevent this:
1. Configured `trailingSlash: 'always'` and `build.format: 'directory'` in `astro.config.mjs`.
2. Created a baseline audit file (`routes-baseline.json`) indexing all historical canonical routes.
3. Built an automated verification script (`scripts/verify-parity.mjs`) running on every build:

```bash
npm run test:parity
```

The script audits all 65 canonical routes, validating file existence at `dist/:slug/index.html`, canonical `<link rel="canonical">` tags, and OpenGraph metadata.

### 2. Taming Kramdown Artifacts with Unified Remark Plugins

Jekyll uses Kramdown, which supports Inline Attribute Lists (IAL) like `{:target="_blank"}` or `{: .message }`. In standard CommonMark/Remark, these strings are not interpreted—they render as literal ugly text on the page.

To solve this cleanly, I wrote a custom Remark plugin:

```typescript
// src/plugins/remark-kramdown.ts
import { visit } from 'unist-util-visit';
import type { Root, Text } from 'mdast';

export function remarkKramdown() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (node.value.includes('{:')) {
        node.value = node.value.replace(/\{:[^}]+\}/g, '').trim();
      }
    });
  };
}
```

Similarly, code fences written with mixed cases (like ````Shell` or ````C#`) caused Shiki highlighting warnings. A second plugin (`remark-lang-case.ts`) normalizes language identifiers to standard aliases (`csharp`, `bash`, `javascript`) before Shiki processes them.

### 3. PWA Service Worker Migration: Avoiding Client Lockout

A common trap when migrating static sites with existing Progressive Web Apps (PWAs) is **client cache lockout**.

The old Jekyll site ran a service worker with aggressive `CacheFirst` strategies storing assets in `pre-version-*` cache buckets. If returning visitors loaded the site, their old service worker would intercept requests and serve outdated HTML pointing to deleted CSS bundles.

In `public/sw.js`, we implemented an explicit migration bridge:

```javascript
// public/sw.js
const PRE_CACHE = 'ntsd-v2-pre';
const RUNTIME_CACHE = 'ntsd-v2-runtime';

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Purge legacy Jekyll cache buckets immediately
          if (key.startsWith('pre-version') || key.startsWith('runtime-version')) {
            console.log('[sw] Purging legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take immediate control
  );
});
```

Calling `self.skipWaiting()` on install and `self.clients.claim()` on activate ensures the new worker takes control instantly and clears legacy caches without requiring the user to manually clear browser data.

---

## Design Refinements & User Experience

### Responsive Reading Layout & Centering

Some articles have a Table of Contents (TOC) sidebar (`catalog: true`), while others are short notes or guides without sections (`catalog: false`).

In the layout template ([`src/layouts/PostLayout.astro`](file:///Users/ntsd/git/ntsd/ntsd.dev/src/layouts/PostLayout.astro)), we dynamically check if the TOC should appear:

```astro
const showCatalog = Boolean(post.catalog) && headings.length > 0;
```

- **With Catalog (`showCatalog: true`)**: The post renders a 12-column grid (`grid-cols-12`) with the article on the left (`col-span-8`) and a sticky TOC sidebar on the right (`col-span-4`).
- **Without Catalog (`showCatalog: false`)**: The 12-column grid is omitted. The container switches to `max-w-3xl mx-auto` with `article class="w-full"`, placing the reading content, navigation, and discussion section dead center on the screen.

### Seamless Discussion Theming

Giscus embeds an `iframe` hosted on `giscus.app`. Default themes like `noborder_light` inject their own grayish backgrounds (`#f6f6f7`) and green buttons, creating jarring rectangular borders on top of the site's `#fafafa` page background.

We resolved this by:
1. Authoring a custom stylesheet at [`public/styles/giscus.css`](file:///Users/ntsd/git/ntsd/ntsd.dev/public/styles/giscus.css) with `--color-canvas-default: transparent`.
2. Setting `--color-btn-primary-bg: #18181b` and `--color-accent-fg: #2563eb` to match the site's obsidian/zinc tokens and blue link accents.
3. Enabling CORS in `public/_headers`:

```http
/styles/giscus.css
  Content-Type: text/css; charset=utf-8
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
```

Now, the discussion thread blends into the page canvas with no border disconnects.

---

## Agentic & AI Discoverability

In addition to traditional human readers and search engines, the new site is built for autonomous AI agents and language models:

1. **[Agentic Resource Discovery (ARD v1.0)](https://agenticresourcediscovery.org/spec/)**: Published `/.well-known/ard.json` specifying site capabilities, RSS endpoints, and technical portfolio topics.
2. **Context Manifest (`/llms.txt`)**: Generates an accessible, clean text summary of all articles, project repositories, and technical competencies for LLM context retrieval.
3. **Structured Data**: Auto-generates Schema.org JSON-LD (`TechArticle` and `BlogPosting`) during build for every article.

---

## The Results

Let's look at the numbers before and after the migration:

| Metric | Before (Jekyll + Puppeteer) | After (Astro 7 + Rolldown) |
| :--- | :--- | :--- |
| **CI Build Time** | 160–210 seconds | **~4.5 seconds** (35x faster) |
| **Build Tooling** | Ruby + Bundler + Node + Gulp + Puppeteer | **Node.js (Single Runtime)** |
| **Client JS Framework** | 0 KB | **0 KB** |
| **Lighthouse Mobile Score** | 100 / 100 / 100 / 100 | **100 / 100 / 100 / 100** |
| **Broken URLs / Lost Comments** | N/A | **0 (65/65 verified)** |

---

## Conclusion

Migrating an established personal site doesn't have to mean sacrificing URL stability or adding client-side JavaScript bloat. With **Astro 7**, we eliminated five separate build dependencies, reduced CI duration by 97%, and created a maintainable foundation for future engineering articles.

All code and configs are open source on GitHub:  
👉 **[github.com/ntsd/ntsd.dev](https://github.com/ntsd/ntsd.dev)**

Feel free to jump into the discussion below!
