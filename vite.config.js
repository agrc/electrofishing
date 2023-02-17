import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.REACT_APP_FIREBASE_CONFIG': `'${JSON.stringify({
      projectId: 'electrofishing-testing',
    })}'`,
    'process.env.REACT_APP_BUILD': '"test"',
  },
});
