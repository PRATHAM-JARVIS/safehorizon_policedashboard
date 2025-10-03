import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    // Optimize build performance
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for stable dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI libraries chunk
          ui: ['lucide-react', 'recharts'],
          // Map libraries chunk
          maps: ['leaflet', 'react-leaflet'],
          // State management chunk
          state: ['zustand', 'axios'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dev server
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand'],
    exclude: [],
  },
})
