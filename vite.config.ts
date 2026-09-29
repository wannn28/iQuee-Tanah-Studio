import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In production Nginx serves dist/ and proxies /api/ to the Node API container.
// In dev/preview, Vite proxies /api to the local API (server/, default port 8001).
const api = { '/api': { target: 'http://localhost:8001', changeOrigin: false } }

export default defineConfig({
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
})
