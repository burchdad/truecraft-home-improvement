# Private review QA — October 16, 2026

## Automated evidence

- `npm run build`: six pre-rendered routes plus 404; sending disabled, noindex enabled.
- `npm run check`: JavaScript syntax checks pass.
- `npm test`: 7/7 passing. Validation and normalization, phone/email selection, length/type/header-injection rejection, origin check, honeypot, rate limit/expiry, idempotency-key validation, duplicate preview requests, provider refusal/exception/unproven receipt, HTTP malformed and oversized bodies, real preview 503, 404 and noindex headers.
- `npm run test:e2e`: 7/7 Chromium suites passing. All six routes checked at 360, 390, 768, 1024 and 1440 CSS pixels. All internal page/image links return 200; visible images decode; no horizontal overflow; each route has one H1 and noindex. Axe WCAG 2 A/AA and 2.1 AA scans report zero violations at these widths.
- Interactive checks: menu focus entry/Escape/focus return, gallery filtering, service preselection, field-associated validation and focused summary, retained values, double-click validation with zero POSTs, disabled submission, 740×360 landscape, 200% zoom and usable JavaScript-disabled navigation/phone fallback.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- README unchanged; no configured credentials or tentative inbox in browser assets/source; raw originals and reference sheets are not served.

## Rendered review

Full-page screenshots: Home, Our Work and Request Estimate, each at 390×844 and 1440×1000. These are actual Chromium renders, not design mockups. Home first-screen screenshots supplement the tall page captures. Additional full-page JPEG captures cover Home, Work and Estimate at 360×844, 768×844, 1024×844 and 740×360. Images were reviewed for crop, spacing, readable text, navigation, first-screen actions and form clarity. Replaced unavailable diagonal-arrow font glyphs with inline SVG. Fixed the mobile menu initialization shift; the final local sample recorded CLS 0 at both 390 and 1440 pixels, LCP 144 ms / 124 ms, and approximately 151 KB / 713 KB of initial resources respectively. These loopback figures are not deployment performance claims. Mobile contact controls are omitted on the form route so they cannot cover fields or the keyboard. Full-page screenshot fixed bars appear at their initial viewport position; they remain fixed while browsing.

- [Home desktop](home-1440.png) / [Home mobile](home-390.png)
- [Work desktop](our-work-1440.png) / [Work mobile](our-work-390.png)
- [Estimate desktop](request-estimate-1440.png) / [Estimate mobile](request-estimate-390.png)

The system Chromium executable was used after the Playwright-managed browser download returned HTTP 403 “Domain forbidden.” This did not block rendered QA. No sandbox approval was requested or denied.

## Scope and limitations

This is Gate A private design review. No live provider, durable lead store, email arrival, retry queue, production deduplication or operational alert was tested because none is connected or authorized. Local provider mocks are contract tests only. No real inbox messages, client contact or public deployment occurred.

Automated accessibility results are not certification. Screen-reader and physical-device/mobile-keyboard testing, slower network/CPU testing, final hosting security/privacy review and field performance remain launch checks. Local performance observations, when recorded in `local-performance.json`, are a single unthrottled loopback run, not Core Web Vitals field results and not an INP measurement.

See `../BUILD-AND-LAUNCH.md` for exact launch decisions and integration requirements.
