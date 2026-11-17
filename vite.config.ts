import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

const THEME_COLOR = '#2f7d4f';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // A new version activates on the next load; the page loads no inline script,
      // so registration ships as its own file (CSP `script-src 'self'`).
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      // Icons and their <link> tags are generated from public/favicon.svg at build time.
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        name: 'letsgetfit',
        short_name: 'letsgetfit',
        description:
          'A solo training app that builds a plan from your goal, the exercises you know and the equipment you own.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // Catalogue images are too many to precache: each is kept once viewed, so it shows
        // offline afterwards. Names carry a content hash, so a cached copy never goes stale.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/catalogue/images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'catalogue-images',
              expiration: { maxEntries: 1000 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
  },
});
