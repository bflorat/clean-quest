import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const proxyTarget = process.env.PB_INTERNAL_URL || env.VITE_POCKETDB_URL || 'http://localhost:8090'
  return {
    base: env.VITE_BASE || '/',
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: proxyTarget, changeOrigin: true }
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      globals: true,
      css: true
    }
  }
})
