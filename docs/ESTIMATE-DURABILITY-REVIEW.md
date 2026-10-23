# Durable intake implementation — local review only

Branch: review/truecraft-intake-durable. Based on intake 9227df6 plus published porch change 8f387ae (cherry-picked). No external deployment, database migration, environment lookup or email sending performed.

## Implemented adapters

- PostgreSQL migration: private inquiry/outbox table and shared rate-limit table; PUBLIC privileges revoked. A private, non-browser database role is required. No Supabase or public Data API exposure is configured or assumed.
- PostgresIntakeStore: parameterized queries, unique request keys, payload conflict detection, transaction/row locks, immutable original message and consent record, lease tokens and stale-writer rejection. Identical completed retries return the original receipt.
- PostgresRateLimiter: atomic five-attempt/minute counter, HMAC client identifiers rather than stored raw IPs, expiry pruning. Trusted client identity must come from the deployment platform integration, not arbitrary forwarded headers.
- Outbox: persisted processing states, SKIP LOCKED claims, lease recovery, bounded exponential retry delays and provider Retry-After, eight-attempt limit, stop/reconcile at 23 hours from creation. Original sender/recipient/body and provider idempotency key survive retries. Permanent failures stop automatically. Result persistence must succeed before browser success.
- Explicit dependency factory: createDurableEstimateServices accepts a private pg-compatible pool, sender/key, limiter secret, canonical origin and trusted client identity resolver. Default remains disabled. No environment reads, scheduler, unauthenticated worker endpoint or live bootstrap added.
- Existing Resend transport is reused. Acceptance means provider acceptance only, never inbox delivery, owner review, a calculated price or a booking.

## Local verification and its limits

Tests use synthetic example.invalid details and a mocked email transport. SQL is executed by embedded PostgreSQL (PGlite), not mocked SQL responses. Reservation, restart through a new adapter, conflict, lease recovery/stale leases, limits, retry timing, permanent failures, reconciliation, and success auditing are exercised. PGlite serializes transactions: real multi-connection locking, service role permissions, TLS, pool configuration and durability of the selected hosted backend still require staging integration tests. PGlite is a development-only dependency, not the production storage proposal. No claim of completed production integration or inbox delivery.

## Required configuration and approvals before activation

Existing project configuration remains UNKNOWN because the earlier metadata request was denied. Do not infer absent credentials/storage. No retry was attempted.

Proposed server-only variable names for a future approved bootstrap (not read or installed by this change):

- TRUECRAFT_DATABASE_URL
- TRUECRAFT_RESEND_API_KEY
- TRUECRAFT_RESEND_FROM
- TRUECRAFT_RATE_LIMIT_HMAC_SECRET
- TRUECRAFT_SITE_ORIGIN
- TRUECRAFT_OUTBOX_WORKER_SECRET (only if a protected HTTP worker is chosen)

Recipient is fixed in code: Texastruecrafthomes@gmail.com. Do not use that Gmail recipient as a sender identity. Confirm an already-authorized verified sender and scoped key. Existing authorized variable names may be mapped rather than duplicated. Creating credentials, configuring a database, running the migration or scheduling a worker requires approval for that concrete action; none is implied by the local code.

Choose/confirm an existing private PostgreSQL backend and a pg-compatible pool with verified TLS; no purchase is required by this implementation and no infrastructure was provisioned. Confirm retention/deletion policy and backups. The code does not automatically delete inquiries: agree on a retention period before collecting actual leads. The limiter can prune entries older than 24 hours; inquiry deletion must preserve a non-PII idempotency tombstone for the agreed duplicate window. Confirm scheduled outbox execution, alerting for failed/reconciliation records, and delivery/bounce monitoring; no public admin endpoint is supplied.

Before enabling: review/apply schema in the authorized environment, test multiple database connections and failure recovery, bind the platform's trusted client identity, verify API routing alongside static output, document actual storage/email providers and retention in production privacy copy, then deliberately wire the production UI and server together. Current production remains call-only; the API still returns unavailable. Do not publish a working-looking form with a disconnected backend.

## Exact email test approval still needed

Approve one clearly labeled synthetic inquiry to Texastruecrafthomes@gmail.com via the confirmed sender, using an approved test reply address/number (not real customer data), name “Synthetic TrueCraft Test”, location Tyler, project Other, description “Synthetic integration test — no work requested”, blank optional fields and explicit test consent. Confirm durable receipt, provider ID and inbox arrival through the parent. Retry the SAME key/payload to prove no second email is sent. Do not send until permission and configuration are resolved. Additional sends need their approved scope.

## Reference contracts

PostgreSQL locking and ON CONFLICT: https://www.postgresql.org/docs/current/sql-select.html and https://www.postgresql.org/docs/current/sql-insert.html
Resend's 24-hour provider idempotency window: https://resend.com/docs/dashboard/emails/idempotency-keys

## Completed checks

- 13 Playwright browser checks passed across mobile/desktop, keyboard navigation, accessibility, retained failure values and mocked retry behavior.
- Production HTML is byte-for-byte identical across all six routes to published commit 8f387ae4fcff4d9ed7cf27d83f85c36dcdd46ae4. The remote production branch still points to that SHA.
- Desktop/mobile intake screenshots reviewed; copies are outside Git in /workspace/truecraft-intake-durable-qa/.
