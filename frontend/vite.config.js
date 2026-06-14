import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
