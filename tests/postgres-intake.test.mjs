import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  PostgresIntakeStore,
  PostgresRateLimiter,
} from "../src/adapters/postgres-intake.mjs";
import {
  createEstimateNotifier,
  createEstimateIntake,
  INQUIRY_RECIPIENT,
} from "../src/estimate-intake.mjs";
import { processEstimateOutbox } from "../src/estimate-outbox.mjs";
const data = {
  name: "Synthetic Test",
  method: "email",
  contact: "test@example.invalid",
  project: "other",
  location: "Tyler",
  description: "Synthetic project test only.",
  consent: "yes",
};
const input = {
  key: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  fingerprint: "abc",
  data,
  consentVersion: "estimate-request-v1",
  recipient: INQUIRY_RECIPIENT,
};
async function fixture() {
  const db = new PGlite();
  await db.exec(
    await fs.readFile(
      new URL("../migrations/001-estimate-intake.sql", import.meta.url),
      "utf8",
    ),
  );
  // PGlite is one connection; serialize transactions, as a pool would dedicate a
  // connection per transaction. Row-lock contention needs staging PostgreSQL QA.
  let tail = Promise.resolve();
  const pool = {
    query: (...a) => db.query(...a),
    async connect() {
      let unlock;
      const prior = tail;
      tail = new Promise((r) => (unlock = r));
      await prior;
      return { query: (...a) => db.query(...a), release: unlock };
    },
  };
  let time = 100000,
    requests = [];
  const notifier = createEstimateNotifier({
    enabled: true,
    apiKey: "mock-key-only",
    from: "sender@example.invalid",
    fetchImpl: async (u, o) => {
      requests.push(JSON.parse(o.body));
      return new Response(JSON.stringify({ id: "provider-test-id" }));
    },
  });
  const store = new PostgresIntakeStore({
    pool,
    prepare: (a) => notifier.prepare(a),
    now: () => time,
  });
  return {
    db,
    pool,
    store,
    notifier,
    requests,
    advance: (n) => (time += n),
    now: () => time,
  };
}
test("SQL persistence, unique payloads, concurrent reservations and frozen envelope", async () => {
  const f = await fixture();
  try {
    const records = await Promise.all([
      f.store.reserve(input),
      f.store.reserve(input),
    ]);
    assert.equal(records.filter((r) => r.claimed).length, 1);
    assert.equal(records[0].id, records[1].id);
    assert.equal(
      (await f.store.reserve({ ...input, fingerprint: "changed" })).conflict,
      true,
    );
    const r = records[0];
    assert.deepEqual(r.payload.to, [INQUIRY_RECIPIENT]);
    f.notifier.from = "changed@example.invalid";
    f.advance(60001);
    const recovered = await f.store.reserve(input);
    assert(recovered.claimed);
    assert.equal(recovered.payload.from, r.payload.from);
    await assert.rejects(
      f.store.recordOutcome(
        r.id,
        { status: "submitted", providerId: "stale" },
        r.leaseToken,
      ),
      /Stale/,
    );
    const outcome = await f.notifier.notify({
      leadId: r.id,
      data: r.data,
      frozenPayload: recovered.payload,
    });
    await f.store.recordOutcome(r.id, outcome, recovered.leaseToken);
    assert.equal((await f.store.reserve(input)).notification, "submitted");
    assert.equal(f.requests[0].from, r.payload.from);
    const secondStore = new PostgresIntakeStore({
      pool: f.pool,
      prepare: (a) => f.notifier.prepare(a),
      now: f.now,
    });
    assert.equal(
      (await secondStore.reserve(input)).providerId,
      "provider-test-id",
    );
  } finally {
    await f.db.close();
  }
});
test("atomic limiter caps parallel attempts, resets and stores only client HMAC", async () => {
  const f = await fixture();
  try {
    const limiter = new PostgresRateLimiter({
      pool: f.pool,
      hashSecret: "x".repeat(32),
      now: f.now,
    });
    const outcomes = await Promise.all(
      Array.from({ length: 12 }, () =>
        limiter.consume("192.0.2.1", { limit: 5, windowMs: 60000 }),
      ),
    );
    assert.equal(outcomes.filter(Boolean).length, 5);
    const r = (await f.db.query("SELECT * FROM truecraft_rate_limits")).rows[0];
    assert.match(r.client_hash, /^[a-f0-9]{64}$/);
    assert(!JSON.stringify(r).includes("192.0.2.1"));
    f.advance(60000);
    assert(await limiter.consume("192.0.2.1", { limit: 5, windowMs: 60000 }));
    f.advance(86400001);
    await limiter.prune();
    assert.equal(
      (await f.db.query("SELECT * FROM truecraft_rate_limits")).rows.length,
      0,
    );
  } finally {
    await f.db.close();
  }
});
test("outbox recovers crashes, delays retries, stops permanent failures and expired records", async () => {
  const f = await fixture();
  try {
    await f.store.reserve(input);
    assert.equal(
      (await processEstimateOutbox({ store: f.store, notifier: f.notifier }))
        .disabled,
      true,
    );
    assert.equal(f.requests.length, 0);
    f.advance(60001);
    await processEstimateOutbox({
      enabled: true,
      store: f.store,
      notifier: {
        notify: async () => ({ status: "uncertain", retryable: true }),
      },
    });
    assert.equal(await f.store.claimNext(), null);
    f.advance(120001);
    await processEstimateOutbox({
      enabled: true,
      store: f.store,
      notifier: f.notifier,
    });
    assert.equal(f.requests.length, 1);
    await processEstimateOutbox({
      enabled: true,
      store: f.store,
      notifier: f.notifier,
    });
    assert.equal(f.requests.length, 1);
    const r = await f.store.reserve({
      ...input,
      key: "bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee",
    });
    await f.store.recordOutcome(
      r.id,
      { status: "provider_error", retryable: false },
      r.leaseToken,
    );
    f.advance(60001);
    assert.equal(await f.store.claimNext(), null);
    await f.store.reserve({
      ...input,
      key: "cccccccc-bbbb-cccc-dddd-eeeeeeeeeeee",
    });
    f.advance(23 * 3600000);
    await processEstimateOutbox({
      enabled: true,
      store: f.store,
      notifier: f.notifier,
    });
    assert.equal(f.requests.length, 1);
    assert.equal(
      (
        await f.db.query(
          "SELECT count(*)::int AS n FROM truecraft_inquiries WHERE notification='needs_reconciliation'",
        )
      ).rows[0].n,
      1,
    );
  } finally {
    await f.db.close();
  }
});
test("real SQL intake returns success only after durable provider outcome; duplicates do not resend", async () => {
  const f = await fixture();
  try {
    const limiter = new PostgresRateLimiter({
      pool: f.pool,
      hashSecret: "x".repeat(32),
      now: f.now,
    });
    const run = createEstimateIntake({
      enabled: true,
      origin: "https://example.invalid",
      store: f.store,
      notifier: f.notifier,
      limiter,
      now: f.now,
    });
    const request = {
      body: data,
      requestOrigin: "https://example.invalid",
      key: input.key,
      clientId: "test",
    };
    assert.equal((await run(request)).status, 202);
    assert.equal((await run(request)).status, 202);
    assert.equal(f.requests.length, 1);
  } finally {
    await f.db.close();
  }
});
test("worker stops after bounded attempts and refuses stale lease completion", async () => {
  const f = await fixture();
  try {
    const r = await f.store.reserve(input);
    await f.db.query(
      "UPDATE truecraft_inquiries SET attempts=8,lease_until=0 WHERE id=$1",
      [r.id],
    );
    const result = await f.store.claimNext();
    assert.equal(result.notification, "needs_reconciliation");
    assert.equal(result.claimed, false);
    await assert.rejects(
      f.store.recordOutcome(
        r.id,
        { status: "submitted", providerId: "late" },
        r.leaseToken,
      ),
      /Stale/,
    );
  } finally {
    await f.db.close();
  }
});
test("service factory is disconnected by default and stored envelope cannot redirect recipient", async () => {
  const { createDurableEstimateServices } =
    await import("../src/estimate-services.mjs");
  assert.equal((await createDurableEstimateServices().drain()).disabled, true);
  let sent = 0;
  const notifier = createEstimateNotifier({
    enabled: true,
    apiKey: "mock-key-only",
    from: "sender@example.invalid",
    fetchImpl: async () => {
      sent++;
    },
  });
  const payload = notifier.prepare({ leadId: input.key, data });
  payload.to = ["other@example.invalid"];
  assert.equal(
    (await notifier.notify({ leadId: input.key, data, frozenPayload: payload }))
      .status,
    "invalid_input",
  );
  assert.equal(sent, 0);
});
test('Retry-After longer than exponential delay is respected',async()=>{
 const f=await fixture();try{
 const r=await f.store.reserve(input);
 await f.store.recordOutcome(r.id,{status:'provider_error',retryable:true,retryAfterSeconds:7200},r.leaseToken);
 f.advance(3600001);assert.equal(await f.store.claimNext(),null);
 f.advance(3600000);assert.equal((await f.store.claimNext()).claimed,true);
 }finally{await f.db.close();}
});
