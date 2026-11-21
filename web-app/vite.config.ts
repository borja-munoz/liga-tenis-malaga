import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Custom service worker (src/sw/sw.ts): DuckDB reads the database with
      // HEAD and Range requests, which the generated one can't serve offline
      strategies: 'injectManifest',
      srcDir: 'src/sw',
      filename: 'sw.ts',
      // New versions wait for the user to accept the update prompt
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'tennis-ball.svg', 'icons/apple-touch-icon-180x180.png'],
      injectManifest: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,woff2}',
          // The data: versioned by content, so new data means a new version
          'db/*.duckdb',
        ],
        // The DuckDB .wasm builds (~35-40 MB) are cached at runtime instead
        globIgnores: ['**/*.wasm'],
        maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,
      },
      manifest: {
        id: './',
        name: 'Liga Tenis Málaga',
        short_name: 'Liga Tenis',
        description: 'Estadísticas, partidos y cara a cara de los jugadores de la Liga Tenis Málaga.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#0B1B3F',
        background_color: '#050D22',
        categories: ['sports'],
        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
