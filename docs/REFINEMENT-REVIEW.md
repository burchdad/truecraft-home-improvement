# Focused refinement — October 16, 2026

The existing six-page layout is retained. Home now leads with remodeling/improvements and Frankston; the landscape hero preserves its complete 4:3 image. Its primary estimate and secondary call actions remain visible at phone widths. The Google excerpt stays attributed and linked, beside the invitation on desktop and immediately after the photo on mobile.

Featured photographs are bathroom (15), interior detail (1), porch (19), and garage (11). The living-room hero (4) is not repeated in this selection. Square gallery frames have reviewed crops and full-image links. Captions describe visible subjects only, not installation scope, homeowner goals, location or chronology. Services present three photo-led groups; all link to a preselected estimate. Other projects remains an estimate option and a separate service-page invitation.

The unconfirmed process sequence was replaced with useful preparation guidance: space/goals, town or ZIP, and ideas/timing. No Bo biography or unconfirmed project story has been added. Owner reiterated that only existing verified facts and neutral captions should appear.

## Validation

- Build and syntax checks pass; 18 unit/integration tests pass, including mocked Resend failure and idempotency behavior.
- Seven browser suites pass on all six routes at 360, 390, 768, 1024 and 1440 CSS pixels, plus landscape/enlarged text/JavaScript-disabled checks. Images, internal links, noindex, overflow, keyboard menu, gallery filters, form errors and zero inquiry POSTs checked. Automated axe scans found no violations.
- Additional rendered checks verify all three homepage service cards preselect the correct estimate option at 390 and 1440.
- Updated screenshots in docs/qa: Home, Our Work, Estimate and Services at desktop/mobile widths; home-first-screen captures reviewed at full viewport size. These are local Chromium renders; they do not establish live-host browser performance or inbox receipt.

## Remaining gates

Form and sending remain disabled. Existing Resend adapter is disconnected and mocked only. Confirm recipient, verified sender, storage/outbox/worker architecture and authorized credential setup; implement durable acceptance with atomic deduplication, retries and failure alerts; verify actual inbox receipt and failure recovery before enabling. See RESEND-INTEGRATION.md for the full implementation contract.

Bo-approved introduction, process, project details, service coverage, photo publication permissions and final contact/business details remain pending. No unconfirmed copy is included in the preview. No main merge or production promotion is authorized. Preview must remain authentication-protected and noindex.
