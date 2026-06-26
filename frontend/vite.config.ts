import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth':        'http://localhost:8082',
      '/agente':      'http://localhost:8082',
      '/residuos':    'http://localhost:8082',
      '/gamificacion':'http://localhost:8082',
      '/impacto':     'http://localhost:8082',
      '/usuario':     'http://localhost:8082',
    }
  }
})
