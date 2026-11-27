-- ONLY dedicated Neon project frosty-base-97276783 / store_f4OfheZQGM5bKBUo.
-- Verify project identity in the Neon UI before execution. No password is returned.
-- Run once in the new database SQL editor as its owner; existing objects abort.
BEGIN;
CREATE SCHEMA truecraft_intake;
REVOKE ALL ON SCHEMA truecraft_intake FROM PUBLIC;
SET LOCAL search_path = truecraft_intake, pg_catalog;
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

CREATE ROLE truecraft_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA truecraft_intake TO truecraft_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON truecraft_inquiries, truecraft_rate_limits TO truecraft_app;
DO $$ BEGIN EXECUTE format('GRANT CONNECT ON DATABASE %I TO truecraft_app', current_database()); END $$;
ALTER ROLE truecraft_app SET search_path = truecraft_intake, pg_catalog;
ALTER ROLE truecraft_app SET statement_timeout = '10s';
ALTER ROLE truecraft_app SET lock_timeout = '5s';
COMMIT;
-- Role has no password yet. Set/reset it via the secure provider UI, then transfer
-- its pooled TLS URL directly to Vercel TRUECRAFT_DATABASE_URL (Preview only).
-- Do not use or display an owner connection string.
SELECT rolname, rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls
FROM pg_roles WHERE rolname = 'truecraft_app';
SELECT has_schema_privilege('truecraft_app','truecraft_intake','USAGE') AS schema_usage,
 has_schema_privilege('truecraft_app','truecraft_intake','CREATE') AS schema_create,
 has_table_privilege('truecraft_app','truecraft_intake.truecraft_inquiries','SELECT,INSERT,UPDATE,DELETE') AS inquiry_access;
