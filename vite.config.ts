import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Bind all interfaces so the dev server is reachable when the repo is worked
    // on from a headless box over SSH (otherwise Vite listens on localhost only).
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the animation runtime in its own cacheable chunk so the homepage's
        // critical JS stays small. React is pinned to its own vendor chunk so shared
        // React internals don't get hoisted into a lazy chunk (which would force that
        // chunk to load on every page).
        manualChunks(id) {
          // Pin Vite's preload helper to the eager react vendor chunk; otherwise
          // Rollup may park it inside a lazy chunk and force that chunk to load everywhere.
          if (id.includes("preload-helper")) return "react-vendor";
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "motion";
          if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return "react-vendor";
          }
        },
      },
    },
  },
});
