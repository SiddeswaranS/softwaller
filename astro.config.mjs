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
    // Emit /about.html, /products/crm-software.html — preserves indexed URLs.
    format: 'file',
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
