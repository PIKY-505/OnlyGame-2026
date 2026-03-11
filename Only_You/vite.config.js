import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- CAMBIO CLAVE ---
  // Usamos './' para que funcione en CUALQUIER carpeta o repositorio automáticamente.
  base: "./",

  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("ogl")) return "ogl";
            if (id.includes("framer-motion") || id.includes("motion"))
              return "framer-motion";
            return "vendor";
          }
        },
      },
    },
  },
});
