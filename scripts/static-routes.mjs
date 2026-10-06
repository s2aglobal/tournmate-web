// GitHub Pages only serves files that exist, so client-side routes like
// /privacy returned HTTP 404 (the SPA still rendered via the 404 page, but
// Google Play's privacy-policy check and crawlers saw a 404). Copy the built
// index.html to <route>/index.html for public routes so they return 200, and
// to 404.html so any other deep link still boots the app.
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const index = join(dist, "index.html");
const routes = ["privacy", "terms"];

for (const route of routes) {
  mkdirSync(join(dist, route), { recursive: true });
  copyFileSync(index, join(dist, route, "index.html"));
}
copyFileSync(index, join(dist, "404.html"));
console.log(`static routes: ${routes.map((r) => `/${r}`).join(", ")}, 404.html`);
