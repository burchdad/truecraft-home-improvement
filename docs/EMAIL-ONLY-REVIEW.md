# Email-only inquiry review

Separate branch review/truecraft-email-only; durable branch/artifacts preserved. No database credentials are read, no DB connection is made, and no role or permission operations are performed. The denied database revoke must not be retried.

## Behavior

The proposed public behavior is direct provider submission: show success only after Resend returns a valid acceptance ID; no database receipt, guaranteed inbox delivery, booking or price claim. Provider/network failures keep details in the browser and advise calling. There is no background retry/outbox, independent retained lead, provider-delivery webhook or eventual-delivery guarantee. For a lightweight contact form this is a valid tradeoff only if accepted explicitly; it is not equivalent to the durable implementation.

Normalized identical details plus mode/version generate a stable SHA-256 provider key across processes. Resend deduplicates the same key/payload for 24 hours, not forever. Reopening/retrying the same details within that period should not create another email; changing details can. Do not change the message template without bumping the email-only version.

Abuse protection: server-side BotID Basic (explicit basic, forced nondevelopment check, reject bots/verified bots/bypasses), exact origin, JSON/body bounds, shared input validation, consent, honeypot and a bounded 3/minute per-instance throttle. The local throttle is NOT a global distributed quota and resets on cold starts; BotID is the primary cross-instance bot check. This does not prevent determined human spam or guarantee a global spending cap. No WAF/account security/permissions changes or new persistent credential were made. Deep Analysis is not enabled. Missing BotID/OIDC support fails closed; it must be verified in the actual Vercel browser session before approval for public use. No manual override of human verification is permitted.

## Restricted personal test

/api/email-estimate can run only when VERCEL_ENV=preview, TRUECRAFT_EMAIL_ONLY_VERIFICATION=true and TRUECRAFT_EMAIL_ONLY_TEST_UNTIL (epoch milliseconds) is still future. It accepts only the exact normalized fixture in src/email-verification.mjs and always uses verification recipient burchsl4@gmail.com. The production environment cannot activate this endpoint. Only use the deployment-specific VERCEL_URL hostname, because the exact Origin is checked.

The UI has a separate verification notice and privacy wording; all other preview/production renders remain disabled/call-only. No automated real-send tests. First exercise direct-call rejection and exact fixture validation without human proof; then parent browser performs the authorized single fictional send using real BotID. Record provider acceptance ID and subject/time, and await parent Gmail receipt confirmation before any public/Bo transition.

Existing TRUECRAFT_RESEND_API_KEY must be scoped to this review branch without decrypting or regenerating it. No elevated DB variables are used, even if still injected by the paused provider setup. No temporary owner connection is employed as a substitute.

References: https://vercel.com/docs/botid/get-started and https://resend.com/docs/dashboard/emails/idempotency-keys
