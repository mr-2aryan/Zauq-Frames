import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// The admin panel. In development it runs on :5175 and sends the API and uploaded
// images to the API server (:5000), and the shop's own images to the shop (:5173).
// API_PROXY_TARGET / IMAGES_PROXY_TARGET point them elsewhere (e.g. for a test run).
const API = process.env.API_PROXY_TARGET || 'http://localhost:5000';
// Trailing slashes matter: '/media' alone would also catch the admin's own /media-library page.
const proxy = { '/api/': API, '/media/': API, '/uploads/': API, '/images/': process.env.IMAGES_PROXY_TARGET || 'http://localhost:5173' };

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5175, proxy },
  preview: { port: 4175, proxy },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 1500 },
});
