import {PRODUCTION_ORIGIN} from "../src/site-config.mjs";
import {emailOnlyConfig} from '../src/email-only-config.mjs';
import {build} from "esbuild";
import fs from "node:fs/promises";
import { routes } from "../src/content.mjs";
import { render } from "../src/templates.mjs";
const intakeConfig=emailOnlyConfig(process.env);
const emailVerification=intakeConfig.enabled && intakeConfig.mode === "verification";
const emailIntake=intakeConfig.enabled && intakeConfig.mode === "production";
const production = process.env.VERCEL_ENV === "production";
let siteUrl = production ? PRODUCTION_ORIGIN : process.env.SITE_URL;
if (production && !siteUrl) throw Error("Production requires SITE_URL");
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
await build({entryPoints:["public/email-only-botid-entry.js"],outfile:"dist/email-only-botid.js",bundle:true,format:"esm",minify:true});
for (const [path] of routes) {
  await fs.mkdir(`dist${path}`, { recursive: true });
  await fs.writeFile(`dist${path}index.html`, render(path, { siteUrl, production, emailVerification, emailIntake }));
}
await fs.writeFile("dist/404.html", render("/404/", { siteUrl, production }));
await fs.writeFile("dist/robots.txt", production ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n");
// No invented domain: generate absolute sitemap only after a real domain is confirmed.
if (siteUrl)
  await fs.writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(([path]) => `<url><loc>${siteUrl}${path}</loc></url>`).join("")}</urlset>`,
  );
console.log(
  `Built ${routes.length} pages + 404. ${production ? "Indexable; intake follows verified configuration." : "Noindex on; inquiry sending disabled."} ${siteUrl ? "Canonical and sitemap generated." : "Canonical and sitemap await approved SITE_URL."}`,
);

if(!production){await fs.mkdir('dist/verification-check',{recursive:true});await fs.writeFile('dist/verification-check/index.html','<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Browser verification check</title><h1>Browser protection check</h1><p>This check sends no email and collects no project details. Vercel processes browser signals for abuse protection.</p><button id="check-botid">Check browser protection</button><p id="botid-result" role="status"></p><script type="module" src="/email-only-botid.js"></script></html>');}
