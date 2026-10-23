import fs from "node:fs";
import {
  business as b,
  services,
  serviceGroups,
  featuredProjects,
  roomProject,
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
const cta = (label = "Call TrueCraft for an estimate") =>
  `<a class="button" href="${b.tel}">${label} <span aria-hidden="true">↗</span></a>`;
const phone = () => `<a href="${b.tel}">${b.phone}</a>`;
const wordmark = () =>
  `<img class="brand-logo" src="/images/truecraft-authentic-logo-facebook.jpg" alt="TrueCraft Home Improvements" width="1024" height="1024">`;
function header(path, production = false) {
  return `<a class="skip" href="#main">Skip to content</a>${production ? "" : '<div class="preview-ribbon">PRIVATE DESIGN PREVIEW <span>•</span> Online inquiries are not connected</div>'}<header class="header wrap"><a class="brand" href="/" aria-label="TrueCraft Home Improvements home">${wordmark()}</a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" hidden>Menu <span aria-hidden="true">☰</span></button><nav id="main-nav" aria-label="Main navigation">${routes
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
  return `<footer><div class="wrap footer-main"><a class="brand" href="/" aria-label="TrueCraft home">${wordmark()}</a><div><p>${b.name}<br>Serving Tyler &amp; East Texas<br>Based in ${b.base}<br>Established ${b.established}</p>${phone()}</div><nav aria-label="Footer navigation">${routes
    .slice(1)
    .map(([url, title]) => `<a href="${url}">${title}</a>`)
    .join(
      "",
    )}</nav></div><div class="wrap footer-bottom"><span>© ${new Date().getUTCFullYear()} ${b.name}</span><span>Home improvements, inside and out.</span></div></footer>${path === "/request-estimate/" ? "" : `<div class="mobile-contact" aria-label="Quick contact"><a href="${b.tel}" aria-label="Call TrueCraft for an estimate">Call for an estimate</a><a href="/request-estimate/">Plan your call ↗</a></div>`}`;
}
const intro = (eyebrow, title, copy) =>
  `<section class="page-intro wrap"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lead">${copy}</p></section>`;
const contactBanner = () =>
  `<section class="contact-banner"><div class="wrap"><div><p class="eyebrow">YOUR HOME. YOUR NEXT CHAPTER.</p><h2>What do you have in mind?</h2><p>Start with an idea, a room, or something that needs attention.</p></div><div>${cta()}<p>${phone()} · <a href="/request-estimate/">Plan your call</a></p></div></div></section>`;
function gallery(items, filter = false) {
  return `${filter ? '<div class="filters" role="group" aria-label="Filter photographs" hidden><button aria-pressed="true" data-filter="All">All photographs</button><button aria-pressed="false" data-filter="Interiors">Interiors</button><button aria-pressed="false" data-filter="Outdoors">Outdoors</button></div><p id="gallery-status" class="sr-only" aria-live="polite"></p>' : ""}<div class="gallery">${items.map((p) => `<figure data-category="${p.category}"><a class="photo-link" href="/images/${photos.find((x) => x.id === p.id).slug}.jpg" aria-label="View full photograph: ${p.title}">${photo(p.id)}<span class="photo-expand" aria-hidden="true">↗</span></a><figcaption><div class="caption-heading"><h3>${p.title}</h3><span>${p.category}</span></div>${p.description ? `<p>${p.description}</p>` : ""}</figcaption></figure>`).join("")}</div>`;
}
const proof = () =>
  `<div class="proof wrap"><a href="${b.maps}" class="rating"><strong>5.0 <span aria-hidden="true">★★★★★</span></strong><span>29 Google reviews <span aria-hidden="true">↗</span></span></a><div><strong>Tyler &amp; East Texas</strong><span>Our service area</span></div><div><strong>Established 2021</strong><span>TrueCraft Home Improvements</span></div></div>`;
function home() {
  return `<section class="photo-hero"><div class="photo-hero-image">${photo(4, { hero: true, full: true })}</div><div class="photo-hero-copy wrap"><p class="eyebrow">TRUECRAFT · SERVING TYLER, TEXAS</p><h1>Home remodeling &amp; improvements <br><em>in Tyler, TX.</em></h1><p>Kitchens, bathrooms, interiors and outdoor spaces. <br>Serving Tyler and surrounding East Texas communities.</p><div class="actions">${cta()}<a class="text-link" href="/request-estimate/">What to discuss when you call ↗</a></div></div></section><figure class="hero-quote wrap"><blockquote>“${reviews[0].quote}”</blockquote><figcaption>${reviews[0].name} · <a href="${b.maps}">Google review excerpt ↗</a></figcaption></figure>${proof()}<section class="section wrap"><div class="section-heading"><div><p class="eyebrow">A CLOSER LOOK</p><h2>Spaces worth coming home to.</h2></div><a class="text-link" href="/our-work/">View all work ↗</a></div>${gallery(featuredProjects)}</section><section class="services-home section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">ROOM TO MAKE IT YOURS</p><h2>One home. Many possibilities.</h2></div><p>From the spaces you use every day<br>to the places you unwind outside.</p></div><div class="service-grid">${serviceGroups.map((s) => `<a class="service-card" href="${b.tel}"><div class="service-card-photo">${photo(s.id === "exteriors" ? 22 : s.photo)}</div><div class="service-card-copy"><h3>${s.name}</h3><p>${s.copy}</p><span class="service-action">Call TrueCraft for an estimate <span aria-hidden="true">↗</span></span></div></a>`).join("")}</div></div></section><section class="section wrap reviews" id="reviews"><div><p class="eyebrow">IN OUR CUSTOMERS’ WORDS</p><h2>Good work.<br>Real experiences.</h2><a class="text-link" href="${b.maps}">Read Google reviews ↗</a><p class="fine">5.0 from 29 Google reviews.<br>Observed ${b.reviewDate}.</p></div><div class="quote-grid">${reviews.map((r) => `<figure><span class="stars" aria-label="Google review">★★★★★</span><blockquote>“${r.quote}”</blockquote><figcaption>${r.name}<span>Google review excerpt</span></figcaption></figure>`).join("")}</div></section><section class="section wrap process"><p class="eyebrow">PLAN YOUR PROJECT CONVERSATION</p><h2>What would you like to change?</h2><p>These details help explain what you have in mind when you call.</p><ol><li><span>01</span><h3>The space and the goal</h3><p>Tell us which room or outdoor area needs attention and what you hope to change.</p></li><li><span>02</span><h3>Your location</h3><p>Share your town or ZIP so we can discuss whether your location is a fit.</p></li><li><span>03</span><h3>Your ideas and timing</h3><p>Describe the work you have in mind and any preferred timing. It is fine to still be exploring.</p></li></ol></section>${contactBanner()}`;
}
function servicesPage() {
  return `${intro("WHAT WE DO", "Make more of your Tyler home.", "Kitchen and bathroom updates, interior improvements, and outdoor projects serving Tyler and surrounding East Texas communities.")}<div class="wrap services-list">${serviceGroups.map((s, i) => `<section id="${s.id}" class="service-row"><div class="service-photo">${photo(s.photo)}</div><div><p class="eyebrow">0${i + 1} / OUR SERVICES</p><h2>${s.name}</h2><p class="lead">${s.copy}</p>${cta("Call to discuss your project")}</div></section>`).join("")}</div><section class="wrap other-project"><h2>Something else in mind?</h2><p>Describe your home improvement or repair idea so we can discuss whether it is a fit.</p>${cta("Call to discuss another project")}</section>${contactBanner()}`;
}
function work() {
  return `${intro("THE TRUECRAFT GALLERY", "Take a closer look.", "Explore the details, inside and out. A selection of genuine photographs supplied by TrueCraft.")}<section class="wrap work-gallery" aria-label="Project photographs">${gallery([], true)}<section class="project-set" aria-labelledby="room-project-heading"><div class="section-heading"><div><p class="eyebrow">PROJECT GALLERY</p><h2 id="room-project-heading">White paneling &amp; staircase</h2></div><p>Three views from one project: room details, paneling and stairs.</p></div>${gallery(roomProject)}</section><section class="project-set" aria-labelledby="more-work-heading"><div class="section-heading"><div><p class="eyebrow">MORE TRUECRAFT WORK</p><h2 id="more-work-heading">Inside &amp; out</h2></div><p>Porches, kitchens and interior details, collected by subject.</p></div>${gallery(projects)}</section><p class="fine gallery-note">Select a photograph to view it in full. Subject collections do not imply that photographs show the same project.</p></section>${contactBanner()}`;
}
function about() {
  return `${intro("SERVING TYLER &amp; EAST TEXAS. ESTABLISHED 2021.", "Home is in the details.", "TrueCraft Home Improvements LLC serves Tyler and surrounding East Texas communities with interior and exterior home improvements. Based in Frankston, Texas.")}<section class="wrap about-section"><div>${photo(7, { hero: true })}</div><div><p class="eyebrow">MEET BO</p><h2>A conversation about your home.</h2><p>Bo Frizzell is your contact at TrueCraft Home Improvements. Call to talk through what you would like to change, where your property is located and the next steps for your project.</p><p>Our work spans kitchens and bathrooms, interior improvements, and outdoor projects including fencing.</p><p>Whether you have a particular update in mind or are still exploring the possibilities, start by sharing what you would like to change.</p><p>Browse the gallery for a closer look at the photographs, then call to discuss your project and location.</p>${cta()}<p class="fine">Based in Frankston, Texas. Call to discuss availability for your location.</p></div></section>${proof()}${contactBanner()}`;
}
const field = (name, label, attrs = "", tag = "input") =>
  `<div class="field ${name === "description" ? "wide" : ""}"><label for="${name}">${label}</label>${tag === "textarea" ? `<textarea id="${name}" name="${name}" ${attrs} aria-describedby="${name}-error"></textarea>` : `<input id="${name}" name="${name}" ${attrs} aria-describedby="${name}-error">`}<span class="field-error" id="${name}-error"></span></div>`;
function estimate() {
  return `${intro("ESTIMATE REQUEST · DETAILS ONLY", "Tell Bo about your project.", "No price is calculated here. Bo reviews your details and provides pricing separately. Sending a request does not book work or guarantee availability.")}<section class="wrap estimate-layout"><aside><p class="eyebrow">PREFER TO CALL?</p><h2>Talk with TrueCraft.</h2><a class="large-phone" href="${b.tel}">${b.phone}</a><p>Serving Tyler and surrounding East Texas communities. Share your town or ZIP; a full street address is not needed.</p><div class="aside-photo">${photo(23)}</div></aside><div class="form-panel"><div class="notice" id="intake-notice"><strong>Preview — online sending is not enabled</strong><p>You can check your details on this page, but nothing will be sent or saved. Call TrueCraft to request an estimate.</p></div><noscript><p>Online requests need JavaScript. Please call (903) 275-0361.</p></noscript><form id="estimate-request" data-submit-enabled="false" novalidate aria-describedby="intake-notice" method="post" action="/api/estimate-requests"><p class="fine">Fields are required unless marked optional. Provide one contact method so TrueCraft can respond.</p><div id="estimate-errors" class="error-summary" tabindex="-1" hidden></div><div class="form-grid">${field("name", "Your name", 'autocomplete="name" maxlength="100" required')}<div class="field"><label for="method">How should TrueCraft contact you?</label><select id="method" name="method" aria-describedby="method-error" required><option value="phone">Phone call</option><option value="email">Email</option></select><span id="method-error" class="field-error"></span></div>${field("contact", "Phone number", 'type="tel" autocomplete="tel" maxlength="254" required')}${field("location", "Project town or ZIP", 'autocomplete="address-level2" maxlength="100" required')}<div class="field"><label for="project">Project type</label><select id="project" name="project" aria-describedby="project-error" required><option value="">Select a project type</option>${services.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select><span id="project-error" class="field-error"></span></div>${field("timeframe", "Desired timing (optional)", 'maxlength="100" placeholder="e.g. Still exploring"')}${field("dimensions", "Approximate dimensions (optional)", 'maxlength="200" placeholder="e.g. About 10 × 12 feet"')}${field("description", "Describe your project", 'rows="5" minlength="10" maxlength="2000" required', "textarea")}</div><div class="field consent-field"><label for="consent"><input id="consent" name="consent" type="checkbox" value="yes" required aria-describedby="consent-error"> I agree to share these details with TrueCraft Home Improvements so they can contact me about this request.</label><span id="consent-error" class="field-error"></span></div><div class="honeypot" aria-hidden="true"><label for="website">Leave this field empty</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div><p class="fine">Please do not include payment information, access codes or other sensitive details. No uploads or marketing signup. Read our <a href="/privacy/">privacy notice</a>.</p><div class="actions"><button type="button" id="check-estimate" class="button secondary" hidden>Check details locally</button><button type="submit" id="send-estimate" class="button" disabled>Online sending unavailable</button></div><p id="estimate-status" role="status" tabindex="-1"></p><p class="fine">No dollar estimate or final price is provided by this tool. Bo reviews the project and provides pricing separately.</p></form></div></section>`;
}

function privacy() {
  return `${intro("ESTIMATE REQUEST PRIVACY", "Your project details.", "This preview does not send or save estimate requests.")}<article class="wrap prose"><h2>What the preview asks for</h2><p>Your name, one contact method, project town or ZIP, project type, description and your agreement to share the details with TrueCraft. Approximate dimensions and desired timing are optional. A full street address, files and payment details are not requested.</p><h2>Nothing is sent in this preview</h2><p>Checking the fields runs in your browser. The submit button is disabled, and the server refuses live intake. This preview does not store entries in cookies or local storage. Your browser may retain autocomplete details according to its settings.</p><h2>Planned use</h2><p>Once sending is approved and tested, the request is intended for Bo at TrueCraft to respond and discuss pricing separately. Storage, email delivery and retention details must be confirmed before that feature is enabled. This is not a marketing signup.</p><h2>Other services</h2><p>The website includes no analytics or advertising trackers. Hosting services process technical request information. Google review links open Google Maps. Calls use your device’s phone application.</p><h2>Contact</h2><p>To discuss your project now, call ${phone()}.</p></article>`;
}

function contact() {
  return `${intro("PLAN YOUR ESTIMATE CONVERSATION", "Start with a phone call.", "Serving Tyler and surrounding East Texas communities. Based in Frankston, Texas.")}<section class="wrap section prose"><h2>Call TrueCraft about your project</h2><p>Tell us what you would like to improve and where the property is located. Call to discuss whether your project and location are a fit, availability and the next steps for an estimate.</p><p>${cta()}</p><p>${phone()}</p><h2>What to have in mind</h2><ul><li>The room or outdoor space you want to improve.</li><li>What you would like to change and the result you have in mind.</li><li>Your town or ZIP and any preferred timing.</li></ul><p>You can browse the <a href="/our-work/">project gallery</a> for examples or review our <a href="/services/">services</a> before calling.</p><p>This website does not collect project details or offer online booking. An estimate conversation is not a booking or a price commitment.</p></section>`;
}

function publicPrivacy() {
  return `${intro("WEBSITE PRIVACY", "A call-only website.", "This website does not offer an online inquiry form.")}<article class="wrap prose"><h2>Information on this website</h2><p>We do not ask you to enter personal or project information on this website. This build includes no analytics, advertising trackers, third-party fonts or embedded maps, and does not use cookies or local storage to collect inquiry details.</p><h2>Hosting and external services</h2><p>Vercel hosts this website and processes technical request information to deliver and secure its pages. See <a href="https://vercel.com/legal/privacy-policy">Vercel’s privacy policy</a> for its practices. Google review links open Google Maps, where Google’s privacy practices apply.</p><h2>Calling TrueCraft</h2><p>Phone links open your device’s calling application. Information you choose to share by phone is outside this website. For questions, call ${phone()}.</p><p class="fine">Website notice dated October 19, 2026.</p></article>`;
}
export function render(path, { siteUrl, production = false } = {}) {
  const route = routes.find((r) => r[0] === path);
  const title = route?.[1] || "Page not found";
  const description =
    (production && path === "/request-estimate/" ? "Call TrueCraft at (903) 275-0361 to discuss home improvements serving Tyler and East Texas." : production && path === "/privacy/" ? "How this call-only TrueCraft website handles information." : route?.[2]) || "Find your way back to TrueCraft Home Improvements.";
  const content = (
    {
      "/": home,
      "/services/": servicesPage,
      "/our-work/": work,
      "/about/": about,
      "/request-estimate/": production ? contact : estimate,
      "/privacy/": production ? publicPrivacy : privacy,
    }[path] ||
    (() =>
      `${intro("404", "That page isn’t here.", "Let’s get you back to a familiar place.")}<div class="wrap section"><a class="button" href="/">Back to home →</a></div>`)
  )();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} | TrueCraft Home Improvements · Serving Tyler, TX</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${production && route ? "index, follow" : "noindex, nofollow"}"><meta name="theme-color" content="#10283f"><meta property="og:type" content="website"><meta property="og:title" content="${escape(title)} | TrueCraft Home Improvements"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${siteUrl || ""}/images/living-room.jpg"><meta name="twitter:card" content="summary_large_image">${siteUrl ? `<link rel="canonical" href="${siteUrl}${path}"><meta property="og:url" content="${siteUrl}${path}">` : ""}<link rel="icon" href="/images/truecraft-authentic-logo-facebook.jpg" type="image/jpeg"><link rel="stylesheet" href="/styles.css"><noscript><link rel="stylesheet" href="/nojs.css"></noscript><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: b.name, telephone: "+19032750361", foundingDate: "2021", ...(siteUrl ? { url: siteUrl } : {}) })}</script><script type="module" src="/site.js"></script></head><body${path === "/" ? ' class="home-page"' : ""}>${header(path, production)}<main id="main">${content}</main>${footer(path)}</body></html>`
    .replaceAll(
      "↗",
      '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>',
    )
    .replaceAll(
      "☰",
      '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    );
}
