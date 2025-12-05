import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { buildVersionPlugin } from './vite-plugins/buildVersion';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    buildVersionPlugin(),
    // Copy vercel.json to dist folder for deployment
    {
      name: 'copy-vercel-config',
      closeBundle() {
        const src = path.resolve(__dirname, 'vercel.json');
        const dest = path.resolve(__dirname, 'dist/vercel.json');
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log('✓ Copied vercel.json to dist/');
        }
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg'],
      manifest: {
        name: 'VibesApp',
        short_name: 'VibesApp',
        description: 'A picture-based social network',
        theme_color: '#10B981',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.vibesapp\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.cloudfront\.net\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize for offline-first PWA with single cohesive bundle
    rollupOptions: {
      output: {
        // Split vendor code for better caching (React, React Router, etc.)
        // When you update YOUR code, users don't re-download React
        manualChunks: {
          // React core (changes rarely)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries (changes rarely)
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
          // Data fetching (changes rarely)
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    // Suppress chunk size warnings - we WANT a complete offline-capable bundle
    chunkSizeWarningLimit: 2000,
    // Enable better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
});
