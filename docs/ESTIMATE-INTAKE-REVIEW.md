# Details-only estimate request — local review

Update: concrete PostgreSQL/outbox adapters now exist on the subsequent local review branch. See [ESTIMATE-DURABILITY-REVIEW.md](ESTIMATE-DURABILITY-REVIEW.md) for current implementation, configuration needs and verification limits. The integration requirements below describe the original intake milestone.

## Implemented

The nonproduction estimate page now contains a responsive, accessible details-only form: name, selected phone/email contact, town or ZIP, project type, description, optional dimensions/timing, and explicit permission to share details with TrueCraft for responding. No prices, uploads, full street address, marketing signup or booking claim. Phone alternative remains visible. Preview privacy text accurately says nothing is sent or saved.

Shared validation treats every value as plain untrusted data. Browser errors link to fields and focus an error summary. Requests retain entered values on failures, prevent concurrent submits, use a stable idempotency key for unchanged retries and only show success when the server confirms durable storage plus provider acceptance. Success never claims inbox delivery or Bo's review. All browser tests stub network requests and use synthetic example.invalid contact data.

Server code: src/estimate-intake.mjs; deployment entry: api/estimate-requests.mjs. Both default to disabled. POST/JSON/body-size checks are implemented. An enabled service requires an exact configured origin, trusted client identity, atomic shared rate limiter, durable idempotent store and notification adapter. It rejects honeypot entries, absent consent, malformed contacts, invalid project types and oversized fields. Bo's authorized recipient is fixed server-side as Texastruecrafthomes@gmail.com; request fields cannot override sender or recipient. The existing Resend adapter escapes content and formats dimensions, consent and a details-only disclaimer. No credentials are read, generated or installed.

The production render remains the existing call-only page. There is intentionally no environment switch to expose a live form before the integration is reviewed. Current deployed site is unchanged.

## Exact unresolved integration requirements

1. **Configuration visibility:** Vercel metadata-only environment listing for project prj_b4D2GbKUyXtGi40qqOLjwBcGqyYB / team team_8w5FXbJbJEP5ODMBWfvv39hR returned HTTP 403, permission to list project environment variables denied. No alternate route attempted. Existing credentials, sender and storage configuration are therefore unknown, not proven absent.
2. **Sender/credential:** confirm an already-authorized project sender/from address and verified sender domain, and an appropriately scoped server-only Resend key. The gmail recipient is not a verified sending identity. No DNS/domain or credential changes are performed or implied. If none exists, obtain specific approval before setup.
3. **Durable storage:** select/authorize an existing backend, access and retention/deletion policy. Implement store.reserve as one atomic create-or-read operation with unique request key, matching fingerprint check, frozen data/consent timestamp+version, server-fixed recipient, creation time, and a single processing lease. Identical completed retries return the same ID; conflicting payloads reject. Persist notification result/provider ID in recordOutcome before responding success. This repo supplies a contract and mocked tests, not a production database adapter.
4. **Recovery:** persist uncertain/failed outcomes and provide an authorized worker/operator process for retry and lease recovery. Retries must use the same frozen message/sender/recipient and idempotency key. After 23 hours the service refuses to resend automatically and requires reconciliation. Configure failure alerts and delivery/bounce handling before claiming reliable delivery. No success state claims delivery.
5. **Shared spam limits:** supply an atomic, shared limiter with a five-attempt/minute policy and trusted platform client identity. Do not trust arbitrary client-supplied forwarded headers. No in-memory limiter is presented as production-safe across instances.
6. **Deployment:** confirm Vercel function routing for /api/estimate-requests alongside static dist output, bind reviewed dependencies in a server-only bootstrap, update privacy to actual storage/providers/retention, and only then enable form submission and route production rendering to the intake page. Frontend flags alone cannot enable the server.

## Required end-to-end test approval (not performed)

Ask permission for one clearly labeled synthetic request to email **Texastruecrafthomes@gmail.com** through the confirmed sender. Proposed name: Synthetic TrueCraft Test; contact: an explicitly approved test address/number; location: Tyler; project: Other; description: Synthetic integration test — no work requested; optional fields empty; explicit test consent. Confirm durable record, provider message ID and actual inbox arrival with the owner/parent. Then retry the same request key to verify a second message is not generated. Mock failures first; any additional real sends require their approved scope. No client messages or test emails have been sent.

## Local review

npm ci --cache /tmp/truecraft-npm-cache
npm run build
npm test
PORT=4180 npm run test:e2e
PORT=4180 npm start

Open http://127.0.0.1:4180/request-estimate/. The preview is noindex and sending is disabled. Production builds continue to show the call-only page. Keep the changes on a review branch until configuration and sending-test approvals are resolved.
