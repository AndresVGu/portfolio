import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  il8n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    routing:{
      prefixDefaultLocale: false // es -> /es, en -> /en
    }
  }
});