/**
 * BruinBazaar Vite config.
 * Env: .env loaded from project root; VITE_* exposed to client via import.meta.env.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  root: '.',
  envDir: '.',
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
