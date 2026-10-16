import fs from "node:fs/promises";
import { routes } from "../src/content.mjs";
import { render } from "../src/templates.mjs";
let siteUrl = process.env.SITE_URL;
if (siteUrl) {
  const url = new URL(siteUrl);
  if (
    url.protocol !== "https:" ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw Error("SITE_URL must be an approved HTTPS origin");
  siteUrl = url.origin;
}
await fs.rm("dist", { recursive: true, force: true });
await fs.mkdir("dist", { recursive: true });
await fs.cp("public", "dist", { recursive: true });
for (const [path] of routes) {
  await fs.mkdir(`dist${path}`, { recursive: true });
  await fs.writeFile(`dist${path}index.html`, render(path, { siteUrl }));
}
await fs.writeFile("dist/404.html", render("/404/", { siteUrl }));
await fs.writeFile("dist/robots.txt", "User-agent: *\nDisallow: /\n");
// No invented domain: generate absolute sitemap only after a real domain is confirmed.
if (siteUrl)
  await fs.writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(([path]) => `<url><loc>${siteUrl}${path}</loc></url>`).join("")}</urlset>`,
  );
console.log(
  `Built ${routes.length} pages + 404. Noindex on; inquiry sending disabled. ${siteUrl ? "Canonical and sitemap generated." : "Canonical and sitemap await approved SITE_URL."}`,
);
