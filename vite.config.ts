import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { writeFileSync, copyFileSync } from "fs";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    {
      name: "spa-fallback",
      closeBundle() {
        // GitHub Pages doesn't support SPA rewrites — copy index.html as 404.html
        // so all routes resolve to the React app instead of a GitHub 404 page
        if (isSsrBuild) return;
        const dist = resolve(__dirname, "dist");
        copyFileSync(`${dist}/index.html`, `${dist}/404.html`);
      },
    },
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      // The SSR build (scripts/prerender.tsx) externalizes dependencies, so
      // manual chunks only apply to the browser build.
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
              vendor: ["react", "react-dom", "react-router-dom"],
            },
          },
    },
  },
}));
