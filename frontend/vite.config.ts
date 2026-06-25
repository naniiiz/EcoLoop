import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth':        'http://localhost:8080',
      '/agente':      'http://localhost:8080',
      '/residuos':    'http://localhost:8080',
      '/gamificacion':'http://localhost:8080',
      '/impacto':     'http://localhost:8080',
      '/usuario':     'http://localhost:8080',
    }
  }
})
