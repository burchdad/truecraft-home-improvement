# Resend inquiry notification adapter — private review

## Implemented, sending disabled

`src/adapters/resend.mjs` implements the Resend REST send-email contract using Node fetch without a new runtime dependency. The adapter is server-only, is not imported by the server or build, reads no environment variables, and defaults to disabled. `enabled: true` appears only in mocked tests. The public form remains preview-only and its submit button remains disabled. `/api/inquiries` still uses `PreviewProvider` and rejects valid requests with 503. No Resend account, sender, API key or recipient has been configured; no real network call or email was made by these tests.

The adapter exposes `notify({leadId,data})`, not `accept()`. It cannot be substituted for durable inquiry acceptance. `dispatchInquiry` refuses it; even a successful email submission does not produce an accepted/durable receipt or a frontend success state.

Features:

- Bounded validation of allowed inquiry fields and server-supplied sender/recipient; no arbitrary recipient overrides from inquiries.
- Fixed Resend HTTPS endpoint, redirects rejected, configurable bounded request timeout (default 10 seconds).
- Plain text and escaped HTML, fixed subject containing only an opaque lead ID, validated reply-to only for email contact preference. No homeowner auto-reply or marketing enrollment.
- Deterministic `truecraft-inquiry/<leadId>/notification-v1` idempotency key. No timestamps or random retry keys.
- Distinct disabled/configuration/input/provider/uncertain/submitted outcomes. Provider submission always leaves delivery unconfirmed.
- Retry classification for 429, 408, 5xx, and Resend's concurrent-idempotent-request conflict; Retry-After seconds/dates parsed for a future queue. Other 4xx (including changed-payload idempotency conflict) require correction/operator action.
- No internal retry loop: an approved durable queue must own retry state. Network timeouts, lost responses and malformed success responses remain uncertain; reuse the same persisted key and frozen payload when safely retrying.
- Provider error bodies and thrown error strings are not returned or logged.

## Mocked verification

`npm test`: 18 tests pass (7 existing validation/HTTP tests plus 11 Resend tests). Tests use only synthetic `example.invalid` mailboxes and an injected fake fetch. They cover disabled behavior, REST shape, concurrent-request key/payload stability, HTML escaping, header injection and invalid config, no accidental environment activation, no acceptance-provider substitution, permanent/transient failures, Retry-After, uncertain results and abort timeouts. These tests do **not** prove provider-side deduplication, durable storage or real inbox arrival.

## Still needed before reliable live inquiries

1. Confirm the exact responsible recipient, verified sender domain/from address and approved use of Resend. The handoff's tentative inbox remains unconfirmed and is not configured. Authorize credential setup, sender DNS/authentication and synthetic test sending separately. Future settings should be server-only: `RESEND_API_KEY`, `INQUIRY_FROM_EMAIL`, `INQUIRY_TO_EMAIL`; these names are proposed and intentionally not loaded by the app.
2. Select an approved durable store with least-privilege access, backups/recovery and owner-approved retention/deletion. Define lead ID, creation time, normalized fields and request fingerprint; enforce an atomic unique idempotency key. An identical retry returns the existing lead; a key reused with different input must be rejected. Maintain a stable client key across retries when live submission is implemented.
3. Commit the lead and a notification outbox event together in one transaction before returning received status. Persist a versioned, frozen sender/recipient/message payload (or immutable rendering inputs and template version) and key; otherwise a later copy or recipient change could violate Resend idempotency.
4. Add a worker with atomic claims/leases, crash recovery, bounded exponential backoff with jitter, Retry-After scheduling, attempt counts, state transitions, provider message ID and permanent-failure/dead-letter handling. Set up operator alerts and a way to find/retry pending or failed inquiries without exposing PII in logs.
5. Resend keeps idempotency keys for 24 hours. Never blindly resend an uncertain event after that window: reconcile provider status/recorded ID and require an explicit recovery decision where necessary. Do not claim exactly-once delivery. Crash after provider submission but before local status commit is a required failure test.
6. Add signature-verified Resend delivery/bounce/complaint webhooks with timestamp/replay checks and durable event deduplication. Provider API acceptance is not delivery; delivery events still do not prove owner review. Define handling for bounced/suppressed recipient notifications and alerts.
7. Configure approved production origins/proxy trust and shared rate limiting, with accessible anti-abuse controls. Current loopback origin and in-memory limits are preview-only. Update form handling and privacy wording for actual collection/storage/providers only after approval.
8. Run an authorized synthetic end-to-end test against the approved destination. Verify durable record, inbox arrival, formatting, duplicate requests, concurrency, provider failures, timeout-after-acceptance, worker restarts and recovery. No live acceptance should be enabled until these checks and launch approvals are complete.

## Primary references checked

- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://resend.com/docs/api-reference/errors

These support the REST request format, idempotency lifetime and error distinctions. No external API send was used.
