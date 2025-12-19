import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'datova-ai-for-drug-discovery.onrender.com'
    ],
    host: true,
    port: 5173
  }
})