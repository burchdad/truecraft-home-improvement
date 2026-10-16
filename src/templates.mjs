import fs from "node:fs";
import {
  business as b,
  services,
  serviceGroups,
  featuredProjects,
  reviews,
  projects,
  routes,
} from "./content.mjs";
const photos = JSON.parse(
  fs.readFileSync(new URL("./photos.json", import.meta.url)),
);
export const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function photo(id, { hero = false, full = false } = {}) {
  const p = photos.find((p) => p.id === id);
  return `<picture><source type="image/webp" srcset="${p.widths.map((w) => `/images/${p.slug}-${w}.webp ${w}w`).join(", ")}" sizes="${full ? "100vw" : "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 600px"}"><img src="/images/${p.slug}.jpg" alt="${escape(p.alt)}" width="${p.width}" height="${p.height}" ${hero ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async"></picture>`;
}
const cta = (label = "Request an estimate", project = "") =>
  `<a class="button" href="/request-estimate/${project ? "?project=" + project : ""}">${label} <span aria-hidden="true">↗</span></a>`;
const phone = () => `<a href="${b.tel}">${b.phone}</a>`;
const wordmark = () =>
  `<span class="wordmark">TRUECRAFT<span>HOME IMPROVEMENTS</span></span>`;
function header(path) {
  return `<a class="skip" href="#main">Skip to content</a><div class="preview-ribbon">PRIVATE DESIGN PREVIEW <span>•</span> Online inquiries are not connected</div><header class="header wrap"><a class="brand" href="/" aria-label="TrueCraft Home Improvements home">${wordmark()}</a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" hidden>Menu <span aria-hidden="true">☰</span></button><nav id="main-nav" aria-label="Main navigation">${routes
    .slice(1, 4)
    .map(
      ([url, title]) =>
        `<a href="${url}" ${path === url ? 'aria-current="page"' : ""}>${title}</a>`,
    )
    .join(
      "",
    )}<a class="nav-phone" href="${b.tel}">${b.phone}</a>${cta()}</nav></header>`;
}
function footer(path) {
  return `<footer><div class="wrap footer-main"><a class="brand" href="/" aria-label="TrueCraft home">${wordmark()}</a><div><p>${b.name}<br>Based in ${b.base}<br>Established ${b.established}</p>${phone()}</div><nav aria-label="Footer navigation">${routes
    .slice(1)
    .map(([url, title]) => `<a href="${url}">${title}</a>`)
    .join(
      "",
    )}</nav></div><div class="wrap footer-bottom"><span>© ${new Date().getUTCFullYear()} ${b.name}</span><span>Home improvements, inside and out.</span></div></footer>${path === "/request-estimate/" ? "" : `<div class="mobile-contact" aria-label="Quick contact"><a href="${b.tel}">Call TrueCraft</a><a href="/request-estimate/">Request an estimate ↗</a></div>`}`;
}
const intro = (eyebrow, title, copy) =>
  `<section class="page-intro wrap"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lead">${copy}</p></section>`;
const contactBanner = () =>
  `<section class="contact-banner"><div class="wrap"><div><p class="eyebrow">YOUR HOME. YOUR NEXT CHAPTER.</p><h2>What do you have in mind?</h2><p>Start with an idea, a room, or something that needs attention.</p></div><div>${cta()}<p>Prefer to talk? ${phone()}</p></div></div></section>`;
function gallery(items, filter = false) {
  return `${filter ? '<div class="filters" role="group" aria-label="Filter photographs" hidden><button aria-pressed="true" data-filter="All">All photographs</button><button aria-pressed="false" data-filter="Interiors">Interiors</button><button aria-pressed="false" data-filter="Outdoors">Outdoors</button></div><p id="gallery-status" class="sr-only" aria-live="polite"></p>' : ""}<div class="gallery">${items.map((p) => `<figure data-category="${p.category}"><a class="photo-link" href="/images/${photos.find((x) => x.id === p.id).slug}.jpg" aria-label="View full photograph: ${p.title}">${photo(p.id)}<span class="photo-expand" aria-hidden="true">↗</span></a><figcaption><div class="caption-heading"><h3>${p.title}</h3><span>${p.category}</span></div>${p.description ? `<p>${p.description}</p>` : ""}</figcaption></figure>`).join("")}</div>`;
}
const proof = () =>
  `<div class="proof wrap"><a href="${b.maps}" class="rating"><strong>5.0 <span aria-hidden="true">★★★★★</span></strong><span>22 Google reviews <span aria-hidden="true">↗</span></span></a><div><strong>Frankston, Texas</strong><span>Our home base</span></div><div><strong>Established 2021</strong><span>TrueCraft Home Improvements</span></div></div>`;
function home() {
  return `<section class="photo-hero"><div class="photo-hero-image">${photo(4, { hero: true, full: true })}</div><div class="photo-hero-copy wrap"><p class="eyebrow">TRUECRAFT · FRANKSTON, TEXAS</p><h1>Home remodeling &amp; improvements <br><em>in Frankston, TX.</em></h1><p>Kitchens, bathrooms, interiors and outdoor spaces. <br>See our work. Tell us what you would like to change.</p><div class="actions">${cta()}<a class="text-link" href="${b.tel}" aria-label="Call TrueCraft at ${b.phone}">Call ${b.phone}</a></div></div></section><figure class="hero-quote wrap"><blockquote>“${reviews[0].quote}”</blockquote><figcaption>${reviews[0].name} · <a href="${b.maps}">Google review excerpt ↗</a></figcaption></figure>${proof()}<section class="section wrap"><div class="section-heading"><div><p class="eyebrow">A CLOSER LOOK</p><h2>Spaces worth coming home to.</h2></div><a class="text-link" href="/our-work/">View all work ↗</a></div>${gallery(featuredProjects)}</section><section class="services-home section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">ROOM TO MAKE IT YOURS</p><h2>One home. Many possibilities.</h2></div><p>From the spaces you use every day<br>to the places you unwind outside.</p></div><div class="service-grid">${serviceGroups.map((s) => `<a class="service-card" href="/request-estimate/?project=${s.id}"><div class="service-card-photo">${photo(s.photo)}</div><div class="service-card-copy"><h3>${s.name}</h3><p>${s.copy}</p><span class="service-action">Request an estimate <span aria-hidden="true">↗</span></span></div></a>`).join("")}</div></div></section><section class="section wrap reviews" id="reviews"><div><p class="eyebrow">IN OUR CUSTOMERS’ WORDS</p><h2>Good work.<br>Real experiences.</h2><a class="text-link" href="${b.maps}">Read Google reviews ↗</a><p class="fine">5.0 from 22 Google reviews.<br>Observed ${b.reviewDate}.</p></div><div class="quote-grid">${reviews.map((r) => `<figure><span class="stars" aria-label="Google review">★★★★★</span><blockquote>“${r.quote}”</blockquote><figcaption>${r.name}<span>Google review excerpt</span></figcaption></figure>`).join("")}</div></section><section class="section wrap process"><p class="eyebrow">PLAN YOUR PROJECT CONVERSATION</p><h2>What would you like to change?</h2><p>These details help explain what you have in mind when you call or prepare an inquiry.</p><ol><li><span>01</span><h3>The space and the goal</h3><p>Tell us which room or outdoor area needs attention and what you hope to change.</p></li><li><span>02</span><h3>Your location</h3><p>Share your town or ZIP so we can discuss whether your location is a fit.</p></li><li><span>03</span><h3>Your ideas and timing</h3><p>Describe the work you have in mind and any preferred timing. It is fine to still be exploring.</p></li></ol></section>${contactBanner()}`;
}
function servicesPage() {
  return `${intro("WHAT WE DO", "Make more of your home.", "Kitchen and bathroom updates, interior improvements, and outdoor projects. Based in Frankston, Texas.")}<div class="wrap services-list">${serviceGroups.map((s, i) => `<section id="${s.id}" class="service-row"><div class="service-photo">${photo(s.photo)}</div><div><p class="eyebrow">0${i + 1} / OUR SERVICES</p><h2>${s.name}</h2><p class="lead">${s.copy}</p>${cta("Discuss your project", s.id)}</div></section>`).join("")}</div><section class="wrap other-project"><h2>Something else in mind?</h2><p>Describe your home improvement or repair idea so we can discuss whether it is a fit.</p>${cta("Discuss another project", "other")}</section>${contactBanner()}`;
}
function work() {
  return `${intro("THE TRUECRAFT GALLERY", "Take a closer look.", "Explore the details, inside and out. A selection of genuine photographs supplied by TrueCraft.")}<section class="wrap work-gallery" aria-label="Project photographs">${gallery(projects, true)}<p class="fine gallery-note">Photographs are presented by subject. Select a photograph to view it in full.</p></section>${contactBanner()}`;
}
function about() {
  return `${intro("BASED IN FRANKSTON. ESTABLISHED 2021.", "Home is in the details.", "TrueCraft Home Improvements LLC brings together interior and exterior home improvement services in Frankston, Texas.")}<section class="wrap about-section"><div>${photo(7, { hero: true })}</div><div><p class="eyebrow">GET TO KNOW TRUECRAFT</p><h2>A local starting point for your next project.</h2><p>Our work spans kitchens and bathrooms, interior improvements, and outdoor projects including fencing.</p><p>Whether you have a particular update in mind or are still exploring the possibilities, start by sharing what you would like to change.</p><p>Browse the gallery for a closer look at the photographs, then call to discuss your project and location.</p>${cta()}<p class="fine">Based in Frankston, Texas. Call to discuss availability for your location.</p></div></section>${proof()}${contactBanner()}`;
}
const field = (name, label, attrs = "", tag = "input") =>
  `<div class="field ${name === "description" ? "wide" : ""}"><label for="${name}">${label}</label>${tag === "textarea" ? `<textarea id="${name}" name="${name}" ${attrs} aria-describedby="${name}-error"></textarea>` : `<input id="${name}" name="${name}" ${attrs} aria-describedby="${name}-error">`}<span class="field-error" id="${name}-error"></span></div>`;
function estimate() {
  return `${intro("LET’S TALK ABOUT YOUR HOME", "What are you planning?", "Tell us a little about your project. Include the space you want to improve, your goals, town or ZIP and any preferred timing. An inquiry is not a booking or a price commitment.")}<section class="wrap estimate-layout"><aside><p class="eyebrow">PREFER A CONVERSATION?</p><h2>Give us a call.</h2><a class="large-phone" href="${b.tel}">${b.phone}</a><p>Based in Frankston, Texas.<br>Tell us your town or ZIP so we can discuss your location.</p><div class="aside-photo">${photo(19)}</div></aside><div class="form-panel"><div class="notice" id="preview-notice"><strong>Preview only, not connected</strong><p>This form does not send or save inquiries. You can check your details locally, or call TrueCraft to discuss your project.</p></div><noscript><p>Form checking needs JavaScript. Nothing can be sent from this preview. Please use the phone link.</p></noscript><form id="inquiry" novalidate aria-describedby="preview-notice" method="post" action="/api/inquiries"><p class="fine">All fields are required unless marked optional. Only one contact method is needed.</p><div id="error-summary" class="error-summary" tabindex="-1" hidden></div><div class="form-grid">${field("name", "Your name", 'autocomplete="name" maxlength="100" required')}<div class="field"><label for="method">Preferred contact method</label><select id="method" name="method" aria-describedby="method-error" required><option value="phone">Phone call</option><option value="email">Email</option></select><span id="method-error" class="field-error"></span></div>${field("contact", "Phone number", 'type="tel" autocomplete="tel" maxlength="254" required')}${field("location", "Town or ZIP", 'autocomplete="address-level2" maxlength="100" required')}<div class="field"><label for="project">Project type</label><select id="project" name="project" aria-describedby="project-error" required><option value="">Select a project type</option>${services.map((s) => `<option value="${s.id}">${s.id === "other" ? "Not sure / Other" : s.name}</option>`).join("")}</select><span id="project-error" class="field-error"></span></div>${field("timeframe", "Ideal timeframe (optional)", 'maxlength="100" placeholder="e.g. Still exploring"')}${field("description", "Tell us about your project", 'rows="5" minlength="10" maxlength="2000" required', "textarea")}</div><div class="honeypot" aria-hidden="true"><label for="website">Leave this field empty</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div><p class="fine">Please avoid sensitive information. Read our <a href="/privacy/">privacy notice</a>.</p><div class="actions"><button type="button" id="check-details" class="button secondary" hidden>Check details locally</button><button type="submit" class="button" disabled>Sending unavailable</button></div><p id="form-status" role="status"></p></form></div></section>`;
}
function privacy() {
  return `${intro("PRIVACY NOTICE", "Your information in this preview.", "This notice describes the private design preview as it works today.")}<article class="wrap prose"><h2>Form entries stay in your browser</h2><p>The estimate form is not connected to an inquiry service. “Check details locally” checks the fields in your browser only. It does not send, save or email them. This site does not put entries in local storage or cookies; your browser may retain autocomplete information according to your own settings.</p><h2>What the form asks for</h2><p>Name, preferred contact method, phone number or email, town or ZIP, project type, project description and an optional timeframe. Do not enter sensitive personal information. The preview endpoint rejects submissions and does not store inquiry records.</p><h2>Technical data and external links</h2><p>This build includes no analytics, advertising trackers, third-party fonts or embedded maps. The local server does not log request bodies. It temporarily counts submission attempts by connection address to limit abuse; counters expire after one minute. Hosting infrastructure may have its own technical logs and must be reviewed before launch.</p><p>Google review links open Google Maps, where Google’s privacy practices apply. Calling uses your device’s phone application; information you share in a call is outside this website preview.</p><h2>Before online inquiries are enabled</h2><p>The recipient, provider, storage access, retention and deletion process must be approved and this notice updated to reflect the actual setup.</p><h2>Contact</h2><p>For a conversation with ${b.name}, call ${phone()}.</p><p class="fine">Preview notice dated October 16, 2026.</p></article>`;
}
export function render(path, { siteUrl } = {}) {
  const route = routes.find((r) => r[0] === path);
  const title = route?.[1] || "Page not found";
  const description =
    route?.[2] || "Find your way back to TrueCraft Home Improvements.";
  const content = (
    {
      "/": home,
      "/services/": servicesPage,
      "/our-work/": work,
      "/about/": about,
      "/request-estimate/": estimate,
      "/privacy/": privacy,
    }[path] ||
    (() =>
      `${intro("404", "That page isn’t here.", "Let’s get you back to a familiar place.")}<div class="wrap section"><a class="button" href="/">Back to home →</a></div>`)
  )();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} | TrueCraft Home Improvements · Frankston, TX</title><meta name="description" content="${escape(description)}"><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#10283f"><meta property="og:type" content="website"><meta property="og:title" content="${escape(title)} | TrueCraft Home Improvements"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${siteUrl || ""}/images/living-room.jpg"><meta name="twitter:card" content="summary_large_image">${siteUrl ? `<link rel="canonical" href="${siteUrl}${path}"><meta property="og:url" content="${siteUrl}${path}">` : ""}<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css"><noscript><link rel="stylesheet" href="/nojs.css"></noscript><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: b.name, telephone: "+19032750361", foundingDate: "2021", ...(siteUrl ? { url: siteUrl } : {}) })}</script><script type="module" src="/site.js"></script></head><body${path === "/" ? ' class="home-page"' : ""}>${header(path)}<main id="main">${content}</main>${footer(path)}</body></html>`
    .replaceAll(
      "↗",
      '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>',
    )
    .replaceAll(
      "☰",
      '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    );
}
