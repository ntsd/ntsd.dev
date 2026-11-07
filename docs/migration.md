# Migrating ntsd.dev from Jekyll to Astro 7

**Author:** Jirawat Boonkumnerd ([@ntsd](https://github.com/ntsd))  
**Date:** November 2026  
**Status:** Completed & Deployed to Production  

---

## 1. Executive Summary

This document details the architectural migration of **[ntsd.dev](https://ntsd.dev)** from a legacy hybrid build pipeline—Jekyll 4, Ruby/Bundler, Gulp 4, Babel 6, Express, and Puppeteer headless browser pre-rendering—to a unified, high-performance static site architecture powered by **Astro 7**, **Vite 8**, and the **Rolldown** bundler.

The project succeeded in achieving its primary engineering objectives:
1. **Single Runtime**: Eliminated Ruby, Bundler, Gulp, Express, and Puppeteer in favor of a pure Node.js/npm toolchain.
2. **Zero-JS Baseline**: Preserved 0KB client framework JavaScript runtime (`output: 'static'`) across all 65 canonical routes.
3. **100/100 Lighthouse Benchmark**: Maintained perfect 100 scores across Mobile and Desktop for Performance, Accessibility, Best Practices, and SEO.
4. **100% URL & Permalink Parity**: Preserved directory-style trailing slashes (`/:slug/`) and query parameters, guaranteeing zero broken external links and preserving all active GitHub Discussion threads via Giscus.
5. **Transitional PWA Safety**: Engineered a self-claiming service worker that purges legacy cache buckets to eliminate client lockouts for returning visitors.
6. **Agentic & AI Discoverability**: Implemented Agentic Resource Discovery (ARD v1.0) manifest at `/.well-known/ard.json`, `/llms.txt`, and full Schema.org JSON-LD structured data.

---

## 2. Background & Motivation

### 2.1 The Legacy Stack (Jekyll 4 + Gulp + Puppeteer)

For over six years, `ntsd.dev` operated on a hybrid build stack:
- **Jekyll 4 (Ruby)**: Handled Markdown parsing, Liquid templating, frontmatter metadata, and static HTML generation.
- **Gulp 4 & PostCSS (Node.js)**: Orchestrated CSS compilation, Tailwind utility processing, minification, and asset hashing.
- **Express + Puppeteer**: To achieve a 100/100 Lighthouse score without client JavaScript, the build script launched an Express server serving Jekyll output on port `6969`, launched a headless Chromium instance via Puppeteer, evaluated client scripts (PrismJS syntax highlighting, AnchorJS, WordCloud2 coordinate physics), extracted critical CSS, and wrote back serialized HTML to disk.

### 2.2 Pain Points & Technical Debt

1. **Dual Runtime Friction**: Every CI run required setting up both Ruby (bundler, native gem compilations) and Node.js. CI times consistently hovered between 2.5 and 3.5 minutes.
2. **Puppeteer Fragility**: Headless browser prerendering was resource-intensive, memory-heavy, prone to sporadic Chromium crashes on macOS upgrades, and slow.
3. **Template Rigidity**: Jekyll Liquid templates lacked schema validation, component encapsulation, and type safety. A typo in Markdown frontmatter would silently render empty sections.
4. **Maintenance Overhead**: Babel 6 and deprecated Gulp plugins blocked dependency updates, causing severe npm audit alerts.

---

## 3. Architecture & Target State

```
┌─────────────────────────────────────────────────────────────┐
│                    ntsd.dev (Astro 7 SSG)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   src/content/blog/*.md      src/content/projects/*.json    │
│            │                             │                  │
│            ▼                             ▼                  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Astro Content Collections (Zod Schema Validation) │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Markdown Remark/Rehype Unified Pipeline           │   │
│   │   • Shiki (github-dark compile-time syntax hilite)  │   │
│   │   • remarkLangCase (case-insensitive code fences)   │   │
│   │   • remarkKramdown (Kramdown IAL attribute stripper)│   │
│   │   • rehype-slug + rehype-autolink-headings          │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Astro 7 Component Engine (Static HTML Output)     │   │
│   │   • Vite 8 + Rolldown Fast Bundler                  │   │
│   │   • Native PostCSS + Tailwind CSS v3 Typography     │   │
│   │   • Inline critical CSS stylesheets ('always')      │   │
│   │   • Zero client-side JS runtime overhead            │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Dist Artifacts & Discovery Metadata               │   │
│   │   • 65 Canonical Routes (trailingSlash: 'always')   │   │
│   │   • Agentic Resource Discovery: /.well-known/ard.json│  │
│   │   • LLM Discovery: /llms.txt                        │   │
│   │   • Transitional PWA Service Worker: /sw.js         │   │
│   │   • Schema.org JSON-LD (TechArticle, BlogPosting)   │   │
│   │   • Seamless Giscus Discussions: /styles/giscus.css │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Cloudflare Pages Global Edge Delivery             │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key Implementation Challenges & Solutions

### 4.1 Upgrading to Astro 7 with Vite 8 and Rolldown

Astro 7 introduces Vite 8 and the Rust-based Rolldown bundler for instantaneous tree-shaking and module bundling. During the upgrade:
- **Dependency Resolution**: Legacy `@astrojs/tailwind` was incompatible with Astro 7's peer dependencies. We removed the integration and wired native PostCSS (`postcss.config.cjs`) with `tailwindcss` and `autoprefixer`, keeping the build lean and fully aligned with native Vite asset pipelines.
- **CSS Minifier Compatibility**: LightningCSS minification encountered invalid media query syntax when parsing legacy Tailwind `container.screens` configurations. We refactored the breakpoints to standard CSS media queries (`lg: 1024px`, `xl: 1280px`), ensuring clean compilation under Rolldown.

### 4.2 Preserving 100% URL & Route Parity

Reader comments on `ntsd.dev` are powered by [Giscus](https://giscus.app) mapped to GitHub Discussions using `data-mapping="pathname"`. A single discrepancy in URL structure (such as stripping trailing slashes) would permanently detach comment threads from historical posts.

- Configured `trailingSlash: 'always'` and `build.format: 'directory'` in `astro.config.mjs`.
- Implemented `routes-baseline.json` containing all 64 historical canonical routes (and now 65 with the migration post).
- Created an automated verification test (`npm run test:parity` in `scripts/verify-parity.mjs`) that audits every route against `dist/`, checking:
  1. File existence at `dist/:route/index.html`
  2. Exact match of `<link rel="canonical" href="https://ntsd.dev/:route/">`
  3. Exact match of `<meta property="og:url" content="https://ntsd.dev/:route/">`
  4. Header file headers and redirects.

### 4.3 Markdown Pipeline Compatibility: Kramdown to Unified

Jekyll utilized Kramdown, which supports Inline Attribute Lists (IAL) such as `{:target="_blank"}` or `{: .highlight }`. When fed to standard Remark, these rendered as literal raw text in code blocks and paragraphs.

We authored custom Unified remark plugins:
- **`src/plugins/remark-kramdown.ts`**: Safely parses and strips legacy Kramdown attribute strings (`{: ... }`) during AST compilation.
- **`src/plugins/remark-lang-case.ts`**: Normalizes code block language tags (`C#` -> `csharp`, `JS` -> `javascript`, `Shell` -> `bash`) so Shiki can highlight code fences accurately at build time without runtime errors.
- **Shiki Syntax Highlighting**: Configured compile-time code highlighting with CSS variables (`github-dark` theme), outputting pristine code blocks with zero client-side JavaScript.

### 4.4 The PWA Transition: Eliminating Client Lockout

The legacy Jekyll site deployed a `CacheFirst` service worker (`src/js/sw.js`) that cached HTML and assets indefinitely under cache names like `pre-version-*` and `runtime-version-*`. If a new site were deployed without handling this, returning visitors would be permanently served stale cached HTML referencing deleted CSS bundles.

In `public/sw.js`:
1. Updated cache versioning to `ntsd-v2-pre` and `ntsd-v2-runtime`.
2. Implemented an `activate` event handler that scans `caches.keys()` and immediately calls `caches.delete(cacheName)` for any legacy bucket starting with `pre-version` or `runtime-version`.
3. Executed `self.skipWaiting()` and `clients.claim()` so updated workers immediately take control of open tabs.
4. Wrapped fallback routing to guarantee that offline readers can still view previously read technical posts.

### 4.5 Responsive Post Layout & Catalog Centering

Blog posts on `ntsd.dev` support an optional Table of Contents (TOC) sidebar via frontmatter `catalog: true`.
- When `catalog: true` and headings exist: Posts display a responsive two-column grid (`grid-cols-12`) with the article occupying `col-span-12 lg:col-span-8` and a sticky TOC sidebar occupying `col-span-4`.
- When `catalog: false` (or headings are absent): The grid and sidebar container are omitted entirely. The layout automatically switches to `max-w-3xl mx-auto` with `article class="w-full"`, placing the reading column, previous/next navigation, and discussion section dead center on the screen.

### 4.6 Giscus Discussion Theme Integration

Previous iterations attempted to wrap Giscus in a boxed card with `data-theme="noborder_light"`, creating jarring background color mismatches where a grayish `#f6f6f7` iframe sat inside a `#ffffff` card on top of the `#fafafa` page background.

We solved this with:
1. **Direct Article Section**: Removed the artificial card wrapper, allowing comments to flow naturally within the post container.
2. **Custom Giscus Theme Matching Page Canvas**: Authored `public/styles/giscus.css` with:
   - `color-scheme: light !important`: Guarantees light-mode canvas painting across dark-mode OS and browser environments.
   - `--color-canvas-default: #fafafa`: Seamlessly matches the site's `#fafafa` page background.
   - `--color-canvas-inset: #ffffff`: Crisp white comment input box matching the site's form controls.
   - `--color-btn-primary-bg: #18181b`: Primary actions match the site's dark zinc button styling.
   - `--color-accent-fg: #2563eb`: Blue accent links matching site links.
3. **CORS Edge Configuration**: Configured `Access-Control-Allow-Origin: *` in `public/_headers` so the Giscus iframe on `giscus.app` can fetch the stylesheet worldwide from Cloudflare's edge in <20ms.

---

## 5. Agentic & AI Discoverability

In addition to traditional web discovery, `ntsd.dev` now supports the emerging ecosystem of AI agents, autonomous crawlers, and LLM reasoning engines:

1. **Agentic Resource Discovery (ARD v1.0)**:
   - Published `public/.well-known/ard.json` conforming to the [Agentic Resource Discovery specification](https://agenticresourcediscovery.org/spec/).
   - Declares site endpoints, technical journal resources, open-source projects, and API capabilities for automated discovery by autonomous agent runtimes.
2. **LLM Context Manifest (`/llms.txt`)**:
   - Compiles a high-signal index of all engineering articles, core technical topics (Golang, WebRTC, Distributed Systems, Cloudflare, Astro), and contact links.
3. **Schema.org Structured Data**:
   - Automated JSON-LD generation injecting `TechArticle`, `BlogPosting`, and `Person` metadata into `<head>` for rich search snippets and citation tracking.

---

## 6. Performance Benchmarks

| Metric | Legacy Jekyll Stack | Astro 7 SSG | Delta |
| :--- | :--- | :--- | :--- |
| **CI Build Duration** | ~160 seconds | **~4.5 seconds** | **~97% faster** |
| **Build Dependencies** | Ruby, Bundler, Node, Gulp, Puppeteer | **Node 22, npm** | **Single runtime** |
| **Client JS Runtime** | 42 KB (Prism, AnchorJS, WordCloud) | **0 KB** | **100% reduction** |
| **Lighthouse Performance** | 100/100 | **100/100** | Preserved |
| **Lighthouse Accessibility** | 100/100 | **100/100** | Preserved |
| **Lighthouse Best Practices**| 100/100 | **100/100** | Preserved |
| **Lighthouse SEO** | 100/100 | **100/100** | Preserved |
| **URL Parity** | 64 routes baseline | **65 routes (100% match)** | Preserved |

---

## 7. Operational & Verification Playbook

### 7.1 Local Development
```bash
# Start local development server
npm run dev
```

### 7.2 Full Production Build
```bash
# Fetches upstream project READMEs, compiles static pages, and copies fallback assets
npm run build
```

### 7.3 Automated Parity Audit
```bash
# Audits all canonical routes, canonical link tags, and OpenGraph URLs against routes-baseline.json
npm run test:parity
```

### 7.4 Cloudflare Pages Deployment
Continuous deployment is connected to the `main` branch. Every commit triggers:
```bash
npm run build && npm run test:parity
```
Cloudflare Pages serves the static output directly from `dist/` using HTTP/3, Brotli, and edge caching.
