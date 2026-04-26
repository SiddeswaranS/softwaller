// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.softwaller.com',
  trailingSlash: 'never',
  build: {
    // 'preserve' keeps the structure of src/pages: about.astro → about.html,
    // blog/index.astro → blog/index.html (so /blog/ still resolves).
    format: 'preserve',
  },
  integrations: [
    sitemap({
      // Astro's sitemap omits the .html extension and the trailing slash, but the
      // actual files are .html (and blog uses an index.html in /blog/). Rewrite
      // each URL so it matches an indexable file on disk.
      serialize(item) {
        const url = new URL(item.url);
        if (url.pathname === '/') return item;
        if (url.pathname === '/blog' || url.pathname === '/blog/') {
          item.url = url.origin + '/blog/';
          return item;
        }
        if (!url.pathname.endsWith('.html')) {
          item.url = url.origin + url.pathname + '.html';
        }
        return item;
      },
    }),
    mdx(),
    compress({
      CSS: true,
      HTML: true,
      Image: false,
      JavaScript: true,
      SVG: false,
    }),
  ],
});
