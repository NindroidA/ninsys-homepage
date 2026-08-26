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
    // Never <link modulepreload> the heavy three.js chunk: it's loaded lazily and
    // only on capable devices (see useRender3D). Preloading it would ship ~322KB
    // gzip to every visitor — including mobile — defeating the gate. It still loads
    // at runtime when the lazy ServerRackScene chunk actually executes.
    modulePreload: {
      resolveDependencies: (_filename, deps) => deps.filter((d) => !d.includes("three")),
    },
    rollupOptions: {
      output: {
        // Keep the heavy 3D stack and animation runtime in their own cacheable
        // chunks so the homepage's critical JS stays small. React is pinned to its
        // own vendor chunk so shared React internals don't get hoisted into the
        // lazy "three" chunk (which would force it to load on every page).
        manualChunks(id) {
          // Pin Vite's preload helper to the eager react vendor chunk; otherwise
          // Rollup may park it inside "three", forcing three to load everywhere.
          if (id.includes("preload-helper")) return "react-vendor";
          if (!id.includes("node_modules")) return;
          if (/[\\/](three|@react-three)[\\/]/.test(id)) return "three";
          if (id.includes("framer-motion")) return "motion";
          if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return "react-vendor";
          }
        },
      },
    },
  },
});
