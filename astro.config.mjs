import { defineConfig } from 'astro/config';
import config from './src/config/site.config.js';

export default defineConfig({
  site: config.siteUrl,
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
});
