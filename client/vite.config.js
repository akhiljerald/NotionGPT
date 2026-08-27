import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // The Notion integration's redirect URI is registered against port 3000,
    // so this must not drift. strictPort makes a busy port an error rather
    // than silently moving to 3001 and breaking the OAuth callback.
    port: 3000,
    strictPort: true,
    open: true,
  },
  build: {
    outDir: 'build',
  },
});
