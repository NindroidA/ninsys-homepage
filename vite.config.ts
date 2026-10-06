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
    rolldownOptions: {
      output: {
        // Shared vendor code gets its own cacheable chunks so the homepage's critical JS
        // stays small. Rolldown pulls a group's dependencies into it by default, so with the
        // old `manualChunks` the motion chunk swallowed React itself and every page
        // preloaded framer-motion. Higher priority claims modules first: React (and Vite's
        // preload helper) always land in react-vendor, and motion holds only motion.
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /preload-helper|[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              priority: 2,
            },
            {
              name: "motion",
              test: /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
              priority: 1,
            },
          ],
        },
      },
    },
  },
});
