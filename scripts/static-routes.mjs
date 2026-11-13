// GitHub Pages only serves files that exist, so client-side routes like
// /privacy returned HTTP 404 (the SPA still rendered via the 404 page, but
// Google Play's privacy-policy check and crawlers saw a 404). For each public
// legal route, write the built index.html with the page pre-rendered into
// #root (so crawlers that don't run JS still see the full text) to both
// <route>/index.html and <route>.html, so /privacy, /privacy/ and
// /privacy.html all return 200. Copy the plain index.html to 404.html so any
// other deep link still boots the app.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dist = "dist";
const ssrDir = "dist-ssr";
const index = join(dist, "index.html");
const template = readFileSync(index, "utf8");

const { render, routes } = await import(
  pathToFileURL(join(ssrDir, "prerender.js")).href
);

const escapeAttr = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

for (const route of routes) {
  const { title, description, html } = render(route);
  if (!html.includes("<h1>")) throw new Error(`prerender of /${route} is empty`);
  const page = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${escapeAttr(description)}">`
    )
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  if (!page.includes(html)) throw new Error(`could not inject /${route} into index.html`);
  mkdirSync(join(dist, route), { recursive: true });
  writeFileSync(join(dist, route, "index.html"), page);
  writeFileSync(join(dist, `${route}.html`), page);
}
copyFileSync(index, join(dist, "404.html"));
rmSync(ssrDir, { recursive: true, force: true });
console.log(
  `static routes: ${routes.map((r) => `/${r}, /${r}.html`).join(", ")} (pre-rendered), 404.html`
);
