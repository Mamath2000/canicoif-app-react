import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement selon le mode (dev/prod)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // host: '0.0.0.0',
      proxy: {
        '/api': env.VITE_BACKEND_URL || 'http://localhost:8000'
      }
    }
  }
})