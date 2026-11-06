# ntsd.dev

Personal website, engineering journal, and open source systems portfolio for **Jirawat Boonkumnerd** ([ntsd.dev](https://ntsd.dev)).

Built with **Astro 7 (Static SSG)**, **Vite 8 / Rolldown**, and **Tailwind CSS**, designed for maximum performance, clean typography, zero framework client runtime JS, and instant edge delivery via Cloudflare Pages.

---

## ⚡ Architectural Highlights

- **Zero Client Framework JS**: Pure static HTML/CSS output with zero JavaScript hydration or client bundle bloat.
- **100/100 Lighthouse Scores**: Optimized for top-tier Performance, Accessibility, Best Practices, and SEO.
- **100% Route Parity**: Preserves historical canonical URL structure and trailing slash conventions (`trailingSlash: 'always'`) with automated route audits.
- **Dynamic Content & Project Aggregation**: Compiles 18 technical articles and 29 open-source projects, automatically fetching and caching upstream GitHub repository READMEs during build.
- **Syntax Highlighting**: Shiki compile-time code highlighting with the `github-dark` theme and custom token styling.
- **Discussion Continuity**: Giscus comments mapped directly to repository discussions with zero legacy comment loss.
- **Offline Reliability**: Transitional PWA service worker (`sw.js`) that supports offline browsing while gracefully purging deprecated caches.
- **AI & Syndication Ready**: Auto-generated `/llms.txt`, full Schema.org JSON-LD structured data, RSS feed (`/feed.xml`), and XML sitemaps.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Astro 7](https://astro.build/) (`output: 'static'`) |
| **Compiler & Bundler** | [Vite 8](https://vite.dev/) + [Rolldown](https://rolldown.rs/) |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) via PostCSS + `@tailwindcss/typography` |
| **Code Highlighting** | [Shiki](https://shiki.style/) (`github-dark`) |
| **Markdown Pipeline** | `@astrojs/markdown-remark` (`rehype-slug`, `rehype-autolink-headings`, custom plugins) |
| **Hosting & CDN** | [Cloudflare Pages](https://pages.cloudflare.com/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v22.x` or higher
- **npm**: `v10.x` or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/ntsd/ntsd.dev.git
cd ntsd.dev

# Install dependencies
npm install
```

### Local Development

```bash
npm run dev
```

Starts the local development server with Vite HMR at `http://localhost:4321`. Note that the service worker is automatically disabled during local development to avoid caching hot modules.

---

## 📦 Build & Verification

```bash
# Full static production build (fetches project READMEs and compiles to dist/)
npm run build

# Verify 100% URL route parity and canonical metadata across all 62 production routes
npm run test:parity

# Preview the production build locally
npm run preview
```

---

## 🌐 Deployment (Cloudflare Pages)

The site is continuously deployed via **Cloudflare Pages Git Integration**:

- **Production Branch**: `main`
- **Build Command**: `npm run build && npm run test:parity`
- **Output Directory**: `dist`
- **Environment Variable**: `NODE_VERSION=22`

Manual preview deployments can also be performed via Wrangler:

```bash
npm run deploy
```

---

## 📄 License

MIT © [Jirawat Boonkumnerd](https://github.com/ntsd)
