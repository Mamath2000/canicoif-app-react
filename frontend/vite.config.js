import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement selon le mode (dev/prod)
  const env = loadEnv(mode, process.cwd(), '');

  // Récupère la version du package.json
  const pkg = require('./package.json');
  const version = pkg.version;

  // Récupère le hash court du commit git, priorité à la variable d'env (utile en CI/CD ou build sans .git)
  let gitRef = process.env.VITE_GIT_REF || '';
  try {
    if (!gitRef) {
      gitRef = execSync('git rev-parse --short HEAD').toString().trim();
    }
  } catch (e) {
    gitRef = 'dev';
  }

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_VERSION': JSON.stringify(version),
      'import.meta.env.VITE_GIT_REF': JSON.stringify(gitRef),
    },
    server: {
      // host: '0.0.0.0',
      proxy: {
        '/api': env.VITE_BACKEND_URL || 'http://localhost:8000'
      }
    }
  }
})