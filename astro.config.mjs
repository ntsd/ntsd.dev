import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { remarkLangCase } from './src/plugins/remark-lang-case.ts';
import { remarkKramdown } from './src/plugins/remark-kramdown.ts';

function postBuildIntegration() {
  return {
    name: 'post-build-integration',
    hooks: {
      'astro:build:done': async () => {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const distDir = path.resolve(process.cwd(), 'dist');

        // Ensure dist/404/index.html exists for canonical /404/ URL parity
        const src404 = path.join(distDir, '404.html');
        const dest404Dir = path.join(distDir, '404');
        const dest404 = path.join(dest404Dir, 'index.html');
        if (fs.existsSync(src404)) {
          if (!fs.existsSync(dest404Dir)) {
            fs.mkdirSync(dest404Dir, { recursive: true });
          }
          fs.copyFileSync(src404, dest404);
          console.log('[post-build] Created dist/404/index.html');
        }

        // Ensure dist/sitemap.xml exists if sitemap-index.xml was generated
        const sitemapIndex = path.join(distDir, 'sitemap-index.xml');
        const sitemapXml = path.join(distDir, 'sitemap.xml');
        if (fs.existsSync(sitemapIndex) && !fs.existsSync(sitemapXml)) {
          fs.copyFileSync(sitemapIndex, sitemapXml);
          console.log('[post-build] Created dist/sitemap.xml');
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://ntsd.dev',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkLangCase, remarkKramdown],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            content: {
              type: 'element',
              tagName: 'span',
              properties: { className: ['anchor-link'] },
              children: [{ type: 'text', value: '#' }],
            },
          },
        ],
      ],
    }),
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  integrations: [
    sitemap(),
    postBuildIntegration(),
  ],
});
