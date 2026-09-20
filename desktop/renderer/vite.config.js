import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion-vendor": ["framer-motion"],
          "icons-vendor": ["lucide-react"],
          "charts-vendor": ["recharts"],
          "utils-vendor": ["date-fns", "uuid", "jszip"]
        }
      }
    },
    chunkSizeWarningLimit: 450
  },
  server: { host: "127.0.0.1", port: 3001, strictPort: true }
});
