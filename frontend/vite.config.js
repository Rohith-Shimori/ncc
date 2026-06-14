import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'NCC Digital Training',
        short_name: 'NCC Training',
        description: 'Digital Training and Management System for NCC Cadets',
        theme_color: '#0a1628',
        background_color: '#0a1628',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/ncc-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  build: {
    target: 'esnext', // Avoid transpilation compilation overhead
    sourcemap: false,
    reportCompressedSize: false, // Disables calculating gzip size of chunks, saving considerable build time!
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group huge packages separately so the main vendor chunk stays small
            if (id.includes('xlsx') || id.includes('recharts') || id.includes('react-dom')) {
              return 'vendor-large';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
