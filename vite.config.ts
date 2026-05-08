import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { writeFileSync, copyFileSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "spa-fallback",
      closeBundle() {
        // GitHub Pages doesn't support SPA rewrites — copy index.html as 404.html
        // so all routes resolve to the React app instead of a GitHub 404 page
        const dist = resolve(__dirname, "dist");
        copyFileSync(`${dist}/index.html`, `${dist}/404.html`);
      },
    },
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
