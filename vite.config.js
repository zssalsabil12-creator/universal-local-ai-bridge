import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor': ['framer-motion'],
          'icons-vendor': ['lucide-react'],
          'charts-vendor': ['recharts'],
          'utils-vendor': ['date-fns', 'uuid', 'jszip'],
        },
      },
    },
    chunkSizeWarningLimit: 450,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
});
