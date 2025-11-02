import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const proxyTarget = process.env.PB_INTERNAL_URL || env.VITE_POCKETDB_URL || 'http://localhost:8090'
  // Read package version to inject into the app at build time
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
  return {
    base: env.VITE_BASE || '/',
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version || '0.0.0'),
    },
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
