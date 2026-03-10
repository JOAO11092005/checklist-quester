import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],

  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    strictPort: true,
  },

  base: '/',

  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  optimizeDeps: {
    force: true,
  },
});