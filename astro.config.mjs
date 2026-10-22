import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://karolmassagista.com.br',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  server: { host: '127.0.0.1', port: 4323 },
  output: 'static',
  compressHTML: true,
  vite: {
    optimizeDeps: {
      noDiscovery: true
    }
  },
  integrations: [
    sitemap({
      filter: (page) => page !== 'https://karolmassagista.com.br/massagista-em-campinas/'
    })
  ]
});
