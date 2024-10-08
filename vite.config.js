import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: {
    // this should be moved to .env.test
    'process.env.VITE_FIREBASE_CONFIG': `'${JSON.stringify({
      projectId: 'electrofishing-testing',
    })}'`,
    'process.env.VITE_BUILD': '"test"',
  },
  server: {
    host: true,
  },
  exclude: ['./e2e/**', './playwright-report/**'],
  test: {
    exclude: ['./e2e/**', '**/node_modules/**'],
  },
});
