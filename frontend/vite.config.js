/**
 * BruinBazaar Vite config.
 * Env: .env loaded from project root; VITE_* exposed to client via import.meta.env.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'BruinBazaar',
        short_name: 'BruinBazaar',
        start_url: '/',
        display: 'standalone',
        theme_color: '#2774AE',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  root: '.',
  envDir: '..',
  envPrefix: 'VITE_',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
  },
  preview: {
    port: 4173,
  },
}));