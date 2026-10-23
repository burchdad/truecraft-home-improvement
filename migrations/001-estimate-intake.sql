-- Run only against an explicitly approved private PostgreSQL database.
CREATE TABLE truecraft_inquiries (
 id text PRIMARY KEY,
 request_key text UNIQUE NOT NULL,
 fingerprint text NOT NULL,
 data jsonb NOT NULL,
 payload jsonb NOT NULL,
 recipient text NOT NULL,
 consent_version text NOT NULL,
 created_at bigint NOT NULL,
 notification text NOT NULL DEFAULT 'pending',
 provider_id text,
 attempts integer NOT NULL DEFAULT 0,
 next_attempt_at bigint NOT NULL,
 lease_token text,
 lease_until bigint NOT NULL DEFAULT 0,
 last_status text,
 CHECK (notification IN ('pending','processing','submitted','retry','failed','needs_reconciliation'))
);
CREATE INDEX truecraft_outbox_due ON truecraft_inquiries(next_attempt_at)
 WHERE notification IN ('pending','retry','processing');
CREATE TABLE truecraft_rate_limits (
 client_hash text PRIMARY KEY,
 window_start bigint NOT NULL,
 attempts integer NOT NULL
);
REVOKE ALL ON truecraft_inquiries, truecraft_rate_limits FROM PUBLIC;
