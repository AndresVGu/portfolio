import { defineConfig } from 'astro/config';

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://andresvillarreal.netlify.app',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'ja', 'ko'],
    routing:{
      prefixDefaultLocale: false // es -> /es, en -> /en
    }
  }
});