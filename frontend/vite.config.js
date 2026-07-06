import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The backend base URL used by the dev-server proxy. Locally this defaults to
// localhost:9999; inside Docker Compose it is set to http://backend:9999.
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:9999';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Polling makes file-change detection reliable inside Docker bind mounts
    // (particularly on Windows / WSL), which keeps HMR live-reload working.
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});
