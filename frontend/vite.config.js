import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // ── Configuration Vitest ──────────────────────────────────────────────────
  test: {
    // Simule un environnement navigateur (DOM) pour tester les composants Vue
    environment: 'jsdom',
    // Rendre les helpers Vitest (describe, it, expect…) disponibles globalement
    globals: true,
    // Résolution de l'alias @ dans les tests (même config que Vite)
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
