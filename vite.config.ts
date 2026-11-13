import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { writeFileSync, copyFileSync } from "fs";

// Read by src/services/firebase.ts. A build without them deploys a blank page
// (auth/invalid-api-key), so fail the build instead.
const REQUIRED_FIREBASE_ENV = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

export default defineConfig(({ command, mode, isSsrBuild }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const missing = REQUIRED_FIREBASE_ENV.filter((key) => !env[key]?.trim());
    if (missing.length) {
      throw new Error(
        `Missing Firebase config for mode "${mode}": ${missing.join(", ")}. ` +
          `Set them in .env.${mode} (see .env.example) or the environment.`,
      );
    }
  }

  return {
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
                firebase: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/functions", "firebase/storage"],
                vendor: ["react", "react-dom", "react-router-dom"],
              },
            },
      },
    },
  };
});
