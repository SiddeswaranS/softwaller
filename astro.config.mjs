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
    sitemap(),
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
