import { randomUUID, createHmac } from "node:crypto";
const WINDOW = 23 * 60 * 60 * 1000;
// Inject a private pg-compatible pool. No environment reads or schema mutations.
export class PostgresIntakeStore {
  constructor({ pool, prepare, now = Date.now, leaseMs = 60000 }) {
    if (!pool?.connect || typeof prepare !== "function" || leaseMs < 30000)
      throw Error("Invalid store configuration");
    Object.assign(this, { pool, prepare, now, leaseMs, durable: true });
  }
  async transaction(fn) {
    const c = await this.pool.connect();
    try {
      await c.query("BEGIN");
      const r = await fn(c);
      await c.query("COMMIT");
      return r;
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }
  map(r, claimed = false) {
    return {
      id: r.id,
      data: r.data,
      payload: r.payload,
      createdAt: Number(r.created_at),
      notification: r.notification,
      providerId: r.provider_id,
      leaseToken: r.lease_token,
      claimed,
      durable: true,
    };
  }
  async claim(c, r) {
    const now = this.now();
    if (
      ["submitted", "failed", "needs_reconciliation"].includes(
        r.notification,
      ) ||
      Number(r.lease_until) > now ||
      Number(r.next_attempt_at) > now
    )
      return this.map(r);
    if (now - Number(r.created_at) >= WINDOW || r.attempts >= 8) {
      await c.query(
        "UPDATE truecraft_inquiries SET notification='needs_reconciliation',lease_token=NULL,lease_until=0 WHERE id=$1",
        [r.id],
      );
      return this.map({ ...r, notification: "needs_reconciliation" });
    }
    const token = randomUUID();
    const { rows } = await c.query(
      "UPDATE truecraft_inquiries SET notification='processing',lease_token=$2,lease_until=$3,attempts=attempts+1 WHERE id=$1 RETURNING *",
      [r.id, token, now + this.leaseMs],
    );
    return this.map(rows[0], true);
  }
  async reserve(input) {
    return this.transaction(async (c) => {
      const id = randomUUID();
      const payload = this.prepare({ leadId: id, data: input.data });
      await c.query(
        `INSERT INTO truecraft_inquiries(id,request_key,fingerprint,data,payload,recipient,consent_version,created_at,next_attempt_at)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$8) ON CONFLICT(request_key) DO NOTHING`,
        [
          id,
          input.key,
          input.fingerprint,
          input.data,
          payload,
          input.recipient,
          input.consentVersion,
          this.now(),
        ],
      );
      const {
        rows: [r],
      } = await c.query(
        "SELECT * FROM truecraft_inquiries WHERE request_key=$1 FOR UPDATE",
        [input.key],
      );
      if (r.fingerprint !== input.fingerprint) return { conflict: true };
      return this.claim(c, r);
    });
  }
  async claimNext() {
    return this.transaction(async (c) => {
      const {
        rows: [r],
      } = await c.query(
        `SELECT * FROM truecraft_inquiries WHERE notification IN ('pending','retry','processing')
   AND next_attempt_at <= $1 AND lease_until <= $1 ORDER BY next_attempt_at FOR UPDATE SKIP LOCKED LIMIT 1`,
        [this.now()],
      );
      return r ? this.claim(c, r) : null;
    });
  }
  async recordOutcome(id, outcome, token) {
    if (!token) throw Error("Lease token required");
    const submitted =
      outcome.status === "submitted" &&
      /^[A-Za-z0-9_-]{1,128}$/.test(outcome.providerId || "");
    const status = submitted
      ? "submitted"
      : outcome.status === "needs_reconciliation"
        ? "needs_reconciliation"
        : outcome.retryable === true
          ? "retry"
          : "failed";
    // Persist only bounded status metadata, never arbitrary provider responses.
    const seconds = Number(outcome.retryAfterSeconds || 0);
    const delay = Number.isFinite(seconds)
      ? Math.max(60000, Math.min(WINDOW, seconds * 1000))
      : WINDOW;
    const r = await this.pool.query(
      `UPDATE truecraft_inquiries SET notification=$3,provider_id=$4,last_status=$5,
   next_attempt_at=$6 + GREATEST($7, LEAST(3600000, 60000 * power(2,LEAST(attempts-1,6)))), lease_token=NULL,lease_until=0
   WHERE id=$1 AND lease_token=$2 AND notification='processing' RETURNING id`,
      [
        id,
        token,
        status,
        submitted ? outcome.providerId : null,
        String(outcome.status).slice(0, 40),
        this.now(),
        delay,
      ],
    );
    if (r.rows.length !== 1) throw Error("Stale processing lease");
  }
}
export class PostgresRateLimiter {
  constructor({ pool, hashSecret, now = Date.now }) {
    if (
      !pool?.query ||
      typeof hashSecret !== "string" ||
      hashSecret.length < 32
    )
      throw Error("Invalid limiter configuration");
    Object.assign(this, { pool, hashSecret, now, shared: true });
  }
  async consume(clientId, { limit, windowMs }) {
    if (
      typeof clientId !== "string" ||
      !clientId ||
      clientId.length > 256 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      !Number.isInteger(windowMs) ||
      windowMs < 1000
    )
      throw Error("Invalid limit input");
    const hash = createHmac("sha256", this.hashSecret)
      .update(clientId)
      .digest("hex");
    const now = this.now();
    const {
      rows: [r],
    } = await this.pool.query(
      `INSERT INTO truecraft_rate_limits(client_hash,window_start,attempts) VALUES($1,$2,1)
   ON CONFLICT(client_hash) DO UPDATE SET
   attempts=CASE WHEN truecraft_rate_limits.window_start <= $3 THEN 1 ELSE LEAST(truecraft_rate_limits.attempts+1,$4+1) END,
   window_start=CASE WHEN truecraft_rate_limits.window_start <= $3 THEN $2 ELSE truecraft_rate_limits.window_start END RETURNING attempts`,
      [hash, now, now - windowMs, limit],
    );
    return r.attempts <= limit;
  }
  async prune() {
    await this.pool.query(
      "DELETE FROM truecraft_rate_limits WHERE window_start < $1",
      [this.now() - 86400000],
    );
  }
}
