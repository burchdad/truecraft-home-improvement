# TrueCraft private review build

## Local review

Requires Node 24+ and npm. Run `npm ci`, `npm run build`, then `npm start`.
Open http://127.0.0.1:4173. The server binds only to loopback. Do not expose it publicly: noindex is not access control. No hosting provider, account, domain, analytics, database or mail service was provisioned.

`npm test` runs validation, rejection-path and adapter contract tests. `npm run test:e2e` uses Playwright and the installed `/usr/bin/chromium`; set `CHROMIUM_PATH` to another installed Chromium binary if needed. `npm run check` checks JavaScript syntax. `npm audit` audits development dependencies. Production runtime uses only Node built-ins.

## Architecture

Small static generator with shared templates (`src/templates.mjs`), centralized factual content (`src/content.mjs`), photo metadata (`src/photos.json`) and progressive enhancement (`public/site.js`). Six pages are pre-rendered into ignored `dist/`, with a real 404. No framework hydration or external fonts. Original repository README is unchanged.

The navy/gold/cream palette follows the supplied brand reference. Original composition follows the handoff’s ten-site research conclusions: immediate service/place message, static genuine hero, visible proof, restrained navigation and short inquiry form. No competitor code, assets or copy were reused. Full brief, START-HERE, review evidence, asset instructions and manifest were read. No `start_skill` or AGENTS.md was available in the environment, skill catalog or repository.

## Assets

All 21 original JPEG checksums were verified, with 20 distinct hashes. Ten unique photographs were selected; originals remain unchanged in the handoff outside the repository. WebP responsive sizes and JPEG fallbacks are generated separately with Sharp, stripping metadata. `docs/asset-provenance.json` maps derivatives to supplied sources. This document and provenance are outside the served `dist/` directory.

Rebuild derivatives with `node scripts/assets.mjs /path/to/handoff/assets`. Photo use is authorized for this private draft only. No photo chronology, location, material installation scope or project story is inferred. Gallery filters are subject categories, not asserted project groupings. Full-image links provide native browser inspection without a modal.

## Inquiry behavior and integration boundary

The form is explicitly **Preview only, not connected**. Submit is disabled. “Check details locally” runs shared validation in the browser and never transmits entries. Required fields: name, selected contact method/contact, town or ZIP, type, description; timeframe optional. Errors have field associations and a focused summary. Entries remain after errors. No uploads, SMS or marketing opt-ins.

The Node endpoint is a defensive preview endpoint: JSON/size/origin checks, bounded field validation, honeypot, short-lived per-address rate limit, idempotency-key format check, and a server-only provider boundary. `PreviewProvider` always refuses acceptance with 503 and never persists or sends. There is no environment switch that enables live delivery, and no actual recipient exists in executable configuration. Duplicate preview requests cannot cause duplicate sends because there are no sends. Exception paths never report success.

`dispatchInquiry` defines a future contract: an approved provider must return a durable receipt ID before the application may say received. Its successful path is exercised only with a synthetic in-process mock. A separate, disabled Resend notification adapter now exists in `src/adapters/resend.mjs` with mocked tests; it does not implement inquiry acceptance and is not wired into the server. See `RESEND-INTEGRATION.md`. **This is not a completed production integration.** Durable storage, atomic deduplication by stable key, notification queue/retry, operator alerts, cross-instance rate limiting, origin configuration for the final domain and real provider implementation remain necessary. Do not connect a notification-only adapter that claims durable receipt without approved durable storage.

No actual email was sent and no homeowner data was submitted. The tentative recipient from the handoff is unconfirmed and is not a public contact or active destination.

## Configuration

- `PORT`: optional local preview port, default 4173.
- `CHROMIUM_PATH`: optional browser executable for QA.
- `SITE_URL`: optional **confirmed HTTPS origin** at build time; emits canonical URLs, absolute social preview URL and sitemap. Omitted until domain confirmation. No fake host is used.
- The disconnected Resend notification adapter reads no environment variables. Proposed future server-only settings are documented in RESEND-INTEGRATION.md; no credentials are configured. Storage/queue and production origin settings still await an approved architecture.

All pages always emit noindex/nofollow; robots disallows crawling and the server also emits X-Robots-Tag. Production indexing cannot be enabled by an accidental environment change. Remove these intentionally only after launch approval. Visible Google proof is attributed and dated October 16, 2026. Organization structured data omits ratings, street address, geo, hours and unsupported claims.

## Launch blockers (all unresolved)

1. Confirm exact inquiry destination and responsible recipient; approve actual test sending. The suggested inbox remains tentative. Confirm email vs CRM requirements.
2. Select and authorize provider and durable storage/queue; implement integration, access controls, deduplication, retries, operational failure alerts and retention/deletion. No provisioning or credentials are authorized now.
3. Authorize a synthetic end-to-end test and verify durable record plus arrival in the approved inbox/CRM, formatting, duplication protection and retry behavior. HTTP/provider acceptance alone is insufficient.
4. Confirm phone routing for (903) 275-0361, current service offering, service coverage beyond the Frankston base, estimate terms, proposed process and final copy. No “free” estimate promise is used.
5. Approve photo publication rights and privacy review (including small personal details visible in interiors), captions and exact project scope; confirm any future named team identities. Supply a clean logo if desired; current text wordmark is intentional.
6. Approve the two attributed review excerpts for public use and refresh the 5.0 / 22 Google observation before publication.
7. Confirm domain, hosting, DNS and public deployment authorization. Configure SITE_URL, check sitemap/canonicals/social metadata on the final host, then intentionally remove preview/indexing blocks.
8. Update and approve privacy wording for actual recipients, storage, access, retention/deletion and hosting logs. Perform final device/assistive-technology checks and deployment performance checks.

No public deployment, main merge, remote push, client contact, real email, credential setup or paid provisioning was performed.
