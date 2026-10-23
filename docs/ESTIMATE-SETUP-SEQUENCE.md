# Approved setup sequence — awaiting dedicated resource ID

Do not create a database resource here: the parent owns provisioning through its authenticated browser. Do not connect until the parent returns the new resource identifier and confirms dedicated ownership, Free/$0 price, iad1 region and approved terms. Existing client databases are excluded.

## Server-only configuration names

These are proposed names for the forthcoming reviewed bootstrap. The existing deployed endpoint remains disabled and currently does not read these variables. Presence alone does not enable sending.

| Name | Purpose | Secret? |
| --- | --- | --- |
| TRUECRAFT_DATABASE_URL | TLS pooled connection using the restricted inquiry application role | Yes |
| TRUECRAFT_RESEND_API_KEY | Send-only key restricted to the approved verified sending domain | Yes |
| TRUECRAFT_RESEND_FROM | Approved sender mailbox; display name is fixed in code | No |
| TRUECRAFT_RATE_LIMIT_HMAC_SECRET | Hash trusted client identifiers for shared rate limits | Yes |
| TRUECRAFT_SITE_ORIGIN | Exact approved request origin, no wildcard | No |
| TRUECRAFT_INTAKE_MODE | verification until parent confirms inbox receipt | No |
| TRUECRAFT_INTAKE_ENABLED | false until public activation is separately verified | No |
| TRUECRAFT_VERIFICATION_SECRET | Protect the isolated synthetic-test endpoint from public use | Yes |
| CRON_SECRET | Bearer authentication for the protected Vercel hourly outbox endpoint | Yes |

There is no arbitrary recipient variable. The server maps verification mode only to burchsl4@gmail.com. After parent-confirmed inbox receipt, production mode maps only to Texastruecrafthomes@gmail.com. Mode never comes from request fields. Frozen verification outbox messages cannot be resent by the production notifier. Do not delete them or regenerate their keys to force a retry.

Scope test credentials/configuration to the exact review branch/environment first. Do not use NEXT_PUBLIC_, VITE_ or other browser-exposed prefixes. Return only variable names/IDs/presence from setup tools. Production environment changes must not enable the current call-only deployment. No secrets in Git, logs, screenshots, command arguments or chat.

## Ordered setup and credential boundaries

1. **Resource handoff — no credentials required:** verify new resource ID, name, region, isolation and Free price. Inspect its available nonsecret connection metadata. Do not query any other-client resource.
2. **Schema installation — privileged database credential required:** obtain through the secure provider connection flow. Run the prepared migration only on the new dedicated database, inside a transaction. Prefer a private truecraft_intake schema; set the migration search_path explicitly to that schema. Revoke PUBLIC schema/table access. Inspect created tables/constraints before proceeding.
3. **Restricted runtime role — database owner credential required:** create a non-owner role with no superuser, database creation, role creation or schema creation privileges. Grant only connection, private-schema usage and SELECT/INSERT/UPDATE/DELETE on the two intake tables. Configure its fixed search_path to truecraft_intake; no end-user SQL execution. Verify positive application operations and negative DDL/other-schema access. Keep the owner connection out of the Vercel runtime.
4. **Application pool — restricted database credential required:** use TLS verification and provider-approved pooled URL; bind a pg-compatible pool with bounded connections/query timeouts. The adapter is implemented, but the hosted driver/bootstrap binding awaits the actual resource. Run real multi-connection reservation, lease, rollback and rate-limit tests using fictional data and mocked email transport.
5. **Email credential — authorized Resend key creation required:** recheck existing key metadata for a duplicate TrueCraft key. Create only a sending_access key restricted to verified domain 068fda88-440c-44b8-bcc3-09cb557bcf7f. Transfer the one-time token directly into Vercel secret storage without displaying it. If the available secure flow cannot avoid disclosure, stop and request secure operator transfer. Never send through the account-level connector as a substitute for exercising the application pipeline.
6. **Private configuration — Vercel write access required:** securely store restricted DB URL, send-only key and generated independent HMAC/verification/cron secrets. Set approved sender, review origin, verification mode and intake disabled. Re-read only names/presence to confirm. Redact every returned value, including encrypted values.
7. **Safe test deployment:** implement/review server-only bootstrap and exact platform client-ID resolver. Keep normal public POST intake unavailable and production UI call-only. A protected verification endpoint may exercise the same validator/store/notifier pipeline only after constant-time bearer authorization and verification-mode enforcement. No secret in URL query strings. No real-send browser tests. Preview must remain noindex. Confirm ordinary unauthenticated requests cannot trigger storage or sending.
8. **One authorized fictional test:** submit one clearly labeled fictional inquiry through the protected application pipeline, to Stephen only. Record request ID and provider acceptance ID without contact or credential leakage. Retry the same key/payload to verify no duplicate email. Parent verifies actual inbox receipt; provider acceptance alone is insufficient. Stop here until that confirmation.
9. **Recovery and transition:** confirm retention/deletion policy and alert handling. Drain or reconcile verification records before switching mode; never retarget frozen records. After inbox confirmation, select production destination and perform final migration/config/runtime review. Protected hourly worker uses CRON_SECRET, server-fixed mode, bounded batch size, no-cache responses, and no inquiry data in logs. On Pro, hourly cadence fits the approved plan; no paid upgrade is authorized.
10. **Public activation gate:** require successful actual-database tests, provider acceptance plus parent inbox confirmation, real privacy/provider/retention wording, correct trusted client identity, protected worker tests, canonical/mobile regression checks, and a reviewed deployment diff preserving the porch updates. Until all pass, production remains call-only and intake disabled.

## Current state

No resource creation, migration, runtime credentials, protected endpoint, scheduler or real email test has been executed by this worker. No production configuration has changed. Steps above describe the remaining controlled sequence, not completed integration.

## Verification after sender correction

Complete rerun: preview build and syntax checks passed; 38 server/SQL tests passed; all 13 Playwright tests passed, including mobile/desktop accessibility, image/link checks, disabled submission, mocked error/retry behavior and no-price wording. No real network email transport was used. Production was not deployed or changed.
