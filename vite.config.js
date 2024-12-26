import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://myclinic-api.vercel.app'
          : 'http://localhost:8080',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
