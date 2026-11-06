## Track Selection

- [ ] **Bug Fix / Minor Patch** (non-test diff <= 100 lines and < 3 core files)
- [ ] **Feature / Architectural Change — Stage 1: Design Doc PR** (adds/updates `docs/designs/<name>.md`)
- [x] **Feature / Architectural Change — Stage 2: Implementation PR** (implements approved design doc)

## Summary of Changes

Migrated `ntsd.dev` from Jekyll 4 + Gulp + Puppeteer to Astro SSG (`output: 'static'`).
- Consolidated build pipeline to single Node.js runtime (Astro 5, Tailwind v3, TypeScript).
- Preserved 100% canonical URL and route parity across all 55 production routes (`trailingSlash: 'always'`).
- Preserved Giscus comment threads via exact pathname mapping.
- Transitional PWA service worker with legacy cache purging and 200 OK stubs for legacy precache assets.
- Preserved 100/100 Lighthouse benchmark scores across Performance, Accessibility, Best Practices, and SEO.
- Compile-time `/llms.txt` and Schema.org JSON-LD generation.
- Decommissioned Ruby, Bundler, Gulp, Express, Puppeteer, and `ntsd-dev-worker`.

## Related Documents & Issues

- Refs `docs/designs/astro_migration.md`

## Verification

- [x] `npm run build`: Static compilation completes in ~1.5s with zero errors.
- [x] `npm run test:parity`: 100% route coverage verified against `routes-baseline.json` (55/55 routes).
- [x] `npx linkinator`: 0 broken internal links across all pages and project READMEs.
- [x] `npx lighthouse`: 100/100 across all four audit categories.

## Author Checklist

- [x] I have tested these changes locally and verified all automated tests pass.
- [x] No autonomous pull requests or commits were made without human review.

