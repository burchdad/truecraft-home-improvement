import {searchTitles, searchDescriptions, planningAnswers} from "./search-content.mjs";
import {editorialHome} from "./editorial-home.mjs";
import {crewSection, serviceCrew} from "./crew.mjs";
import {coverageText, coverageSchema} from "./service-areas.mjs";
import {collections, collectionCards, collectionPage} from './gallery-pages.mjs';
import {referenceHeader, referenceFooter, referenceHome, referenceAreas, referenceBlog, icon} from "./reference-home.mjs";
import {PRODUCTION_ORIGIN} from "./site-config.mjs";
import fs from "node:fs";
import {
  business as b,
  services,
  serviceGroups,
  servicePages,
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
const intro = (eyebrow, title, copy) =>
  `<section class="page-intro wrap"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lead">${copy}</p></section>`;
const contactBanner = () =>
  `<section class="contact-banner"><div class="wrap"><div><p class="eyebrow">YOUR HOME. YOUR NEXT CHAPTER.</p><h2>What do you have in mind?</h2><p>Start with an idea, a room, or something that needs attention.</p></div><div>${cta()}<p>${phone()} · <a href="/request-estimate/">Plan your call</a></p></div></div></section>`;
function gallery(items, filter = false) {
  return `${filter ? '<div class="filters" role="group" aria-label="Filter photographs" hidden><button aria-pressed="true" data-filter="All">All photographs</button><button aria-pressed="false" data-filter="Interiors">Interiors</button><button aria-pressed="false" data-filter="Outdoors">Outdoors</button></div><p id="gallery-status" class="sr-only" aria-live="polite"></p>' : ""}<div class="gallery">${items.map((p) => `<figure data-category="${p.category}"><a class="photo-link" href="/images/${photos.find((x) => x.id === p.id).slug}.jpg" aria-label="View full photograph: ${p.title}">${photo(p.id)}<span class="photo-expand" aria-hidden="true">↗</span></a><figcaption><div class="caption-heading"><h3>${p.title}</h3><span>${p.category}</span></div>${p.description ? `<p>${p.description}</p>` : ""}</figcaption></figure>`).join("")}</div>`;
}
const proof = () =>
  `<div class="proof wrap"><a href="${b.reviewsUrl}" class="rating"><strong>Google reviews</strong><span>Read homeowner experiences <span aria-hidden="true">↗</span></span></a><div><strong>Our service area</strong><span>${coverageText}</span></div><div><strong>Established 2021</strong><span>TrueCraft Home Improvements</span></div></div>`;
function home() { return editorialHome();
}
function servicesPage() {
  // These are existing, source-indexed TrueCraft photographs, not reference crops.
  const serviceImages = {
    "kitchen-updates": [1139, "kitchen"],
    "bathroom-updates": [1173, "bath"],
    "drywall-interior-improvements": [1131, "hammer"],
    "porches-decks": [1056, "home"],
    "fencing-wood-staining": [1040, "fence"],
  };
  return `<div class="reference-design services-overview"><section class="services-intro"><div class="ref-wrap"><nav aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true"> / </span><span>Services</span></nav><p class="ref-eyebrow">WHAT WE DO</p><h1>Make more of your home.</h1><p class="ref-intro">Kitchen and bathroom updates, interior improvements, and outdoor projects serving ${coverageText}.</p></div></section><div class="ref-wrap services-collections">${serviceGroups.map(s => `<section id="${s.id}" class="services-category" aria-labelledby="${s.id}-heading"><div class="services-category-heading"><h2 id="${s.id}-heading">${s.name}</h2><p>${s.copy}</p></div><div class="services-card-grid">${servicePages.filter(p => p.group === s.id).map(p => {
    const [image, symbol] = serviceImages[p.slug];
    return `<article class="ref-service-card"><div class="ref-service-photo">${photo(image)}</div><div class="ref-service-copy"><h3>${icon(symbol)}${escape(p.title)}</h3><p>${escape(p.intro)}</p><a class="ref-link" href="/services/${p.slug}/" aria-label="Learn more about ${escape(p.title.toLowerCase())}">Learn more ${icon('arrow')}</a></div></article>`;
  }).join("")}</div><div class="services-category-action">${cta("Call to discuss your project")}</div></section>`).join("")}</div></div><section class="wrap other-project"><h2>Something else in mind?</h2><p>Describe your home improvement or repair idea so we can discuss whether it is a fit.</p>${cta("Call to discuss another project")}</section>${contactBanner()}`;
}

function work() {
  return `${intro("THE TRUECRAFT GALLERY", "Take a closer look.", "Explore the details, inside and out. A selection of genuine photographs supplied by TrueCraft.")}${collectionCards(photo)}<section class="wrap work-gallery" aria-label="Project photographs">${gallery([], true)}<section class="project-set" aria-labelledby="room-project-heading"><div class="section-heading"><div><p class="eyebrow">PROJECT GALLERY</p><h2 id="room-project-heading">White paneling &amp; staircase</h2></div><p>Two views from one project: a white-paneled room and staircase details.</p></div>${gallery(roomProject)}</section><section class="project-set" aria-labelledby="more-work-heading"><div class="section-heading"><div><p class="eyebrow">MORE TRUECRAFT WORK</p><h2 id="more-work-heading">Inside &amp; out</h2></div><p>Porches, kitchens and interior details, collected by subject.</p></div>${gallery(projects)}</section><p class="fine gallery-note">Select a photograph to view it in full. Subject collections do not imply that photographs show the same project.</p></section>${contactBanner()}`;
}
function about() {
  return `${intro("ESTABLISHED 2021. BASED IN TYLER.", "Home is in the details.", `TrueCraft Home Improvements LLC serves ${coverageText} with interior and exterior home improvements. Based in Tyler, Texas.`)}<section class="wrap about-section"><div>${photo(7, { hero: true })}</div><div><p class="eyebrow">MEET BO</p><h2>A conversation about your home.</h2><p>Bo Frizzell is your contact at TrueCraft Home Improvements. Call to talk through what you would like to change, where your property is located and the next steps for your project.</p><p>Our work spans kitchens and bathrooms, interior improvements, and outdoor projects including fencing.</p><p>Whether you have a particular update in mind or are still exploring the possibilities, start by sharing what you would like to change.</p><p>Browse the gallery for a closer look at the photographs, then call to discuss your project and location.</p>${cta()}<p class="fine">Based in Tyler, Texas. Call to discuss availability for your location.</p></div></section>${proof()}${crewSection(["team"])}${contactBanner()}`;
}
const field = (name, label, attrs = "", tag = "input") =>
  `<div class="field ${name === "description" ? "wide" : ""}"><label for="${name}">${label}</label>${tag === "textarea" ? `<textarea id="${name}" name="${name}" ${attrs} aria-describedby="${name}-error"></textarea>` : `<input id="${name}" name="${name}" ${attrs} aria-describedby="${name}-error">`}<span class="field-error" id="${name}-error"></span></div>`;
function estimate() {
  return `${intro("ESTIMATE REQUEST · DETAILS ONLY", "Tell Bo about your project.", "No price is calculated here. Bo reviews your details and provides pricing separately. Sending a request does not book work or guarantee availability.")}<section class="wrap estimate-layout"><aside><p class="eyebrow">PREFER TO CALL?</p><h2>Talk with TrueCraft.</h2><a class="large-phone" href="${b.tel}">${b.phone}</a><p>Serving ${coverageText}. Share your town or ZIP; a full street address is not needed.</p><div class="aside-photo">${photo(23)}</div></aside><div class="form-panel"><div class="notice" id="intake-notice"><strong>Preview — online sending is not enabled</strong><p>You can check your details on this page, but nothing will be sent or saved. Call TrueCraft to request an estimate.</p></div><noscript><p>Online requests need JavaScript. Please call (903) 275-0361.</p></noscript><form id="estimate-request" data-submit-enabled="false" novalidate aria-describedby="intake-notice" method="post" action="/api/estimate-requests"><p class="fine">Fields are required unless marked optional. Provide one contact method so TrueCraft can respond.</p><div id="estimate-errors" class="error-summary" tabindex="-1" hidden></div><div class="form-grid">${field("name", "Your name", 'autocomplete="name" maxlength="100" required')}<div class="field"><label for="method">How should TrueCraft contact you?</label><select id="method" name="method" aria-describedby="method-error" required><option value="phone">Phone call</option><option value="email">Email</option></select><span id="method-error" class="field-error"></span></div>${field("contact", "Phone number", 'type="tel" autocomplete="tel" maxlength="254" required')}${field("location", "Project town or ZIP", 'autocomplete="address-level2" maxlength="100" required')}<div class="field"><label for="project">Project type</label><select id="project" name="project" aria-describedby="project-error" required><option value="">Select a project type</option>${services.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select><span id="project-error" class="field-error"></span></div>${field("timeframe", "Desired timing (optional)", 'maxlength="100" placeholder="e.g. Still exploring"')}${field("dimensions", "Approximate dimensions (optional)", 'maxlength="200" placeholder="e.g. About 10 × 12 feet"')}${field("description", "Describe your project", 'rows="5" minlength="10" maxlength="2000" required', "textarea")}</div><div class="field consent-field"><label for="consent"><input id="consent" name="consent" type="checkbox" value="yes" required aria-describedby="consent-error"> I agree to share these details with TrueCraft Home Improvements so they can contact me about this request.</label><span id="consent-error" class="field-error"></span></div><div class="honeypot" aria-hidden="true"><label for="website">Leave this field empty</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div><p class="fine">Please do not include payment information, access codes or other sensitive details. No uploads or marketing signup. Read our <a href="/privacy/">privacy notice</a>.</p><div class="actions"><button type="button" id="check-estimate" class="button secondary" hidden>Check details locally</button><button type="submit" id="send-estimate" class="button" disabled>Online sending unavailable</button></div><p id="estimate-status" role="status" tabindex="-1"></p><p class="fine">No dollar estimate or final price is provided by this tool. Bo reviews the project and provides pricing separately.</p></form></div></section>`;
}

function emailVerificationEstimate(){
 return estimate().replace('Preview — online sending is not enabled','Fictional email verification only')
 .replace('You can check your details on this page, but nothing will be sent or saved. Call TrueCraft to request an estimate.','This review accepts only the agreed fictional test and sends it to Stephen for verification, not Bo. Real project inquiries are unavailable. Vercel BotID checks browser signals to reduce automated abuse.')
 .replace('data-submit-enabled="false"','data-submit-enabled="true" data-endpoint="/api/email-estimate"')
 .replace('class="button" disabled>Online sending unavailable','class="button">Send fictional verification')
 + '<script type="module" src="/email-only-botid.js"></script>';
}
function publicEstimate(){
 return estimate().replace('Preview — online sending is not enabled','Send your project details to Bo')
 .replace('You can check your details on this page, but nothing will be sent or saved. Call TrueCraft to request an estimate.','Your details are emailed to TrueCraft. This website does not save a backup or queue automatic retries. If sending fails or you need to follow up, please call. No price or booking is confirmed.')
 .replace('data-submit-enabled="false"','data-submit-enabled="true" data-endpoint="/api/email-estimate"')
 .replace('action="/api/estimate-requests"','action="/api/email-estimate"')
 .replace('class="button" disabled>Online sending unavailable','class="button">Send project details')
 + '<script type="module" src="/email-only-botid.js"></script>';
}
function emailIntakePrivacy(){return `${intro("INQUIRY PRIVACY", "Your project details.", "Details are emailed to TrueCraft so Bo can respond to your request.")}<article class="wrap prose"><h2>What you share</h2><p>The form asks for your name, one contact method, project town or ZIP, project type, description and consent to share these details with TrueCraft. Dimensions and desired timing are optional. Please do not include payment information, access codes or other sensitive details. We do not ask for a full street address or file uploads.</p><h2>Email delivery and retention</h2><p>When you submit, Resend processes the details and sends them to TrueCraft’s email inbox. This website does not save an inquiry database record or queue automatic retries. Resend and the recipient mailbox process and retain messages under their own policies. Email-service acceptance does not confirm inbox delivery or Bo’s review. If you see an error or need to follow up, call ${phone()}.</p><h2>Browser and hosting services</h2><p>Vercel hosts the website and processes technical request and browser signals through BotID for abuse protection. There are no advertising trackers or marketing signups. The form does not save inquiry details in cookies or local storage; your browser may retain autocomplete information according to its settings. Google review links open Google Maps.</p><h2>Your choices</h2><p>You may call instead of using the form. Contact TrueCraft by phone about information you have shared or to request its deletion from their records. No price is calculated and sending details does not book work.</p><p class="fine">Website notice dated October 24, 2026.</p></article>`;}
function emailVerificationPrivacy(){return `${intro("VERIFICATION PRIVACY", "Fictional test only.", "This review is not accepting customer inquiries.")}<article class="wrap prose"><p>The approved fictional request is transmitted to Resend and emailed only to Stephen for delivery verification. This website does not save an inquiry database record or queue automatic retries. Resend and the recipient mailbox process and retain the message under their own policies. Email-service acceptance does not confirm inbox arrival.</p><p>Vercel hosts the page and processes request and browser signals for BotID abuse protection. This is security processing, not advertising analytics. No uploads or marketing signup are offered. Do not enter real customer details. To discuss work, call ${phone()}.</p></article>`;}
function privacy() {
  return `${intro("ESTIMATE REQUEST PRIVACY", "Your project details.", "This preview does not send or save estimate requests.")}<article class="wrap prose"><h2>What the preview asks for</h2><p>Your name, one contact method, project town or ZIP, project type, description and your agreement to share the details with TrueCraft. Approximate dimensions and desired timing are optional. A full street address, files and payment details are not requested.</p><h2>Nothing is sent in this preview</h2><p>Checking the fields runs in your browser. The submit button is disabled, and the server refuses live intake. This preview does not store entries in cookies or local storage. Your browser may retain autocomplete details according to its settings.</p><h2>Planned use</h2><p>Once sending is approved and tested, the request is intended for Bo at TrueCraft to respond and discuss pricing separately. Storage, email delivery and retention details must be confirmed before that feature is enabled. This is not a marketing signup.</p><h2>Other services</h2><p>The website includes no analytics or advertising trackers. Hosting services process technical request information. Google review links open Google Maps. Calls use your device’s phone application.</p><h2>Contact</h2><p>To discuss your project now, call ${phone()}.</p></article>`;
}

function contact() {
  return `${intro("PLAN YOUR ESTIMATE CONVERSATION", "Start with a phone call.", `Serving ${coverageText}. Based in Tyler, Texas.`)}<section class="wrap section prose"><h2>Call TrueCraft about your project</h2><p>Tell us what you would like to improve and where the property is located. Call to discuss whether your project and location are a fit, availability and the next steps for an estimate.</p><p>${cta()}</p><p>${phone()}</p><h2>What to have in mind</h2><ul><li>The room or outdoor space you want to improve.</li><li>What you would like to change and the result you have in mind.</li><li>Your town or ZIP and any preferred timing.</li></ul><p>You can browse the <a href="/our-work/">project gallery</a> for examples or review our <a href="/services/">services</a> before calling.</p><p>This website does not collect project details or offer online booking. An estimate conversation is not a booking or a price commitment.</p></section>`;
}

function publicPrivacy() {
  return `${intro("WEBSITE PRIVACY", "A call-only website.", "This website does not offer an online inquiry form.")}<article class="wrap prose"><h2>Information on this website</h2><p>We do not ask you to enter personal or project information on this website. This build includes no advertising trackers, third-party fonts or embedded maps, and does not use cookies or local storage to collect inquiry details.</p><h2>Hosting and external services</h2><p>Vercel hosts this website and processes technical request information to deliver and secure its pages. See <a href="https://vercel.com/legal/privacy-policy">Vercel’s privacy policy</a> for its practices. Google review links open Google Maps, where Google’s privacy practices apply.</p><h2>Calling TrueCraft</h2><p>Phone links open your device’s calling application. Information you choose to share by phone is outside this website. For questions, call ${phone()}.</p><p class="fine">Website notice dated October 19, 2026.</p></article>`;
}
function servicePage(service) {
  const collection = {"kitchen-updates":"kitchens","bathroom-updates":"bathrooms","drywall-interior-improvements":"interiors","porches-decks":"outdoors","fencing-wood-staining":"fencing"}[service.slug];
  return `<nav class="wrap" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/services/">Services</a> / <span aria-current="page">${escape(service.title)}</span></nav>${intro("HOME IMPROVEMENTS", `${escape(service.title)}`, escape(service.intro))}<section class="wrap about-section"><div>${photo(service.photo, {hero: true})}</div><div><h2>${escape(service.heading)}</h2><p>${escape(service.copy)}</p><h2>What to share with Bo</h2><ul>${service.details.map(detail => `<li>${escape(detail)}</li>`).join("")}</ul>${cta("Call to discuss your project")}<p><a href="/request-estimate/">Plan your estimate or send project details</a></p></div></section><section class="wrap prose section"><h2>${escape(service.question)}</h2><p>${escape(service.answer)}</p><h2>Discuss your project location</h2><p>TrueCraft serves ${coverageText}. Share your town or ZIP with Bo to confirm whether your location and project are a fit.</p><h2>Explore related work</h2>${collection ? `<p><a class="text-link" href="/our-work/${collection}/">Browse the ${escape(service.title.toLowerCase())} photo collection →</a></p>` : ""}<p><a href="/our-work/">View TrueCraft’s project photographs</a> and <a href="/services/">all services</a>.</p><ul>${servicePages.filter(other => other.slug !== service.slug).map(other => `<li><a href="/services/${other.slug}/">${escape(other.title)}</a></li>`).join("")}</ul></section>${planningAnswers(service.slug)}${serviceCrew(service.slug)}${contactBanner()}`;
}
function structuredData(siteUrl, service) {
  const origin = siteUrl || PRODUCTION_ORIGIN;
  const provider = {"@type": "HomeAndConstructionBusiness", "@id": `${origin}/#business`, name: b.name, url: origin, telephone: "+19032750361", email: "texastruecrafthomes@gmail.com", image: `${origin}/images/truecraft-authentic-logo-facebook.jpg`, areaServed: coverageSchema, sameAs: ["https://www.facebook.com/p/TrueCraft-Home-Improvements-100063467111862/", "https://maps.app.goo.gl/Kw2LZEqgUFz26bkq5"]};
  const graph = [provider, {"@type": "WebSite", "@id": `${origin}/#website`, url: origin, name: b.name, publisher: {"@id": provider["@id"]}}];
  if (service) {
    const url = `${origin}/services/${service.slug}/`;
    graph.push({"@type": "Service", "@id": `${url}#service`, name: service.title, description: service.description, url, provider: {"@id": provider["@id"]}, areaServed: provider.areaServed});
    graph.push({"@type": "BreadcrumbList", itemListElement: [ ["Home", `${origin}/`], ["Services", `${origin}/services/`], [service.title, url] ].map(([name, item], index) => ({"@type": "ListItem", position: index + 1, name, item}))});
  }
  return JSON.stringify({"@context": "https://schema.org", "@graph": graph}).replaceAll("<", "\\u003c");
}
function googleAnalytics() {
  return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-VTE47ZTCHG"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-VTE47ZTCHG');
</script>`;
}
const analyticsPrivacy = '<h2>Website analytics</h2><p>We use Google Analytics to understand visits and how pages are used. Google Analytics uses cookies and processes technical information about your browser and visits. We do not send inquiry field contents or personal contact details to Analytics. See <a href="https://policies.google.com/privacy">Google’s privacy policy</a> and <a href="https://tools.google.com/dlpage/gaoptout">Google’s Analytics opt-out tool</a>.</p>';
export function render(path, { siteUrl, production = false, emailVerification = false, emailIntake = false } = {}) {
  const service = servicePages.find(s => path === `/services/${s.slug}/`);
  const route = routes.find((r) => r[0] === path);
  const title = route?.[1] || "Page not found";
  const searchTitle = searchTitles[path] || `${title} | TrueCraft Home Improvements`;
  const description =
    (production && !emailIntake && path === "/request-estimate/" ? `Call TrueCraft at (903) 275-0361 to discuss home improvements serving ${coverageText}.` : production && !emailIntake && path === "/privacy/" ? "How this call-only TrueCraft website handles information." : searchDescriptions[path] || route?.[2]) || "Find your way back to TrueCraft Home Improvements.";
  const content = (
    {
      "/": home,
      "/services/": servicesPage,
      "/our-work/": work,
      "/about/": about,
      "/areas/": referenceAreas,
      "/blog/": referenceBlog,
      "/request-estimate/": production ? (emailIntake ? publicEstimate : contact) : emailVerification ? emailVerificationEstimate : estimate,
      "/privacy/": production ? (emailIntake ? emailIntakePrivacy : publicPrivacy) : emailVerification ? emailVerificationPrivacy : privacy,
    }[path] || (collections.categories.find(c => path === `/our-work/${c.slug}/`) ? () => collectionPage(collections.categories.find(c => path === `/our-work/${c.slug}/`), photo, photos, escape) : undefined) || (service ? () => servicePage(service) : undefined) ||
    (() =>
      `${intro("404", "That page isn’t here.", "Let’s get you back to a familiar place.")}<div class="wrap section"><a class="button" href="/">Back to home →</a></div>`)
  )();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">${production ? googleAnalytics() : ""}<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="google-site-verification" content="uY54vnrgA6nBAv3z_xuGWU0vSGI7EqPuixry-_HAIMc" /><meta name="google-site-verification" content="nTj3V7PdtpuZ5b4kBWfZKGIy2CRLnARbWdhB3jHhysI" /><meta name="google-site-verification" content="kzgnwfsQuZN6KloZkS0VxdUXQrDWmPI8C7IXoRF3YnY" /><meta name="msvalidate.01" content="96D6D2B55D94154BE6C7F6B25E3B4EE8" /><title>${escape(searchTitle)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${production && route ? "index, follow" : "noindex, nofollow"}"><meta name="theme-color" content="#10283f"><meta property="og:type" content="website"><meta property="og:site_name" content="TrueCraft Home Improvements LLC"><meta property="og:locale" content="en_US"><meta property="og:title" content="${escape(searchTitle)}"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${siteUrl || ""}/images/living-room.jpg"><meta property="og:image:alt" content="Living room photograph supplied by TrueCraft Home Improvements"><meta name="twitter:title" content="${escape(searchTitle)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${siteUrl || ""}/images/living-room.jpg"><meta name="twitter:card" content="summary_large_image">${siteUrl ? `<link rel="canonical" href="${siteUrl}${path}"><meta property="og:url" content="${siteUrl}${path}">` : ""}<link rel="icon" href="/images/truecraft-authentic-logo-facebook.jpg" type="image/jpeg"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/reference.css"><link rel="stylesheet" href="/collections.css"><link rel="stylesheet" href="/editorial.css"><noscript><link rel="stylesheet" href="/nojs.css"></noscript><script type="application/ld+json">${structuredData(siteUrl, service)}</script><script type="module" src="/site.js"></script></head><body${path === "/" ? ' class="home-page"' : ""}>${referenceHeader(path, production)}<main id="main">${content}${production && path === "/privacy/" ? `<section class="wrap prose">${analyticsPrivacy}</section>` : ""}</main>${referenceFooter()}</body></html>`
    .replaceAll(
      "↗",
      '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>',
    )
    .replaceAll(
      "☰",
      '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    );
}
