import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
