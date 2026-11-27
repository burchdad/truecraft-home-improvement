import test from "node:test";
import assert from "node:assert/strict";
import { validateInquiry } from "../public/validation.js";
import {
  createInquiryHandler,
  dispatchInquiry,
  PreviewProvider,
} from "../src/inquiry.mjs";
import { createServer } from "../src/server.mjs";
const valid = {
  name: "Test Person",
  method: "email",
  contact: "synthetic@example.invalid",
  location: "Frankston",
  project: "other",
  description: "Synthetic local test only.",
};
const request = {
  body: valid,
  origin: "http://local",
  expectedOrigin: "http://local",
  ip: "test",
  key: "local-test-key-123456",
};
test("requires only selected contact method and normalizes fields", () => {
  assert.deepEqual(validateInquiry(valid).errors, {});
  assert.equal(validateInquiry({ ...valid, name: " Test " }).data.name, "Test");
  assert.deepEqual(
    validateInquiry({ ...valid, method: "phone", contact: "(903) 555-0100" })
      .errors,
    {},
  );
});
test("rejects malformed contacts, unknown type, short description, overlength and wrong types", () => {
  for (const patch of [
    { contact: "bad" },
    { method: "sms" },
    { project: "invented" },
    { description: "x" },
    { name: "a".repeat(101) },
    { contact: 42 },
    { name: "X\r\nBcc: test" },
    { method: "phone", contact: "123" },
    { description: {} },
  ])
    assert.ok(
      Object.keys(validateInquiry({ ...valid, ...patch }).errors).length,
    );
  assert.ok(validateInquiry(null).errors.form);
});
test("preview and duplicate submissions never accept or store leads", async () => {
  const h = createInquiryHandler();
  for (let i = 0; i < 2; i++) {
    const r = await h(request);
    assert.equal(r.status, 503);
    assert.equal(r.body.accepted, false);
    assert.match(r.body.message, /Nothing was sent or saved/);
  }
});
test("origin, honeypot, rate limit, expiry, validation and key gates", async () => {
  let time = 0,
    calls = 0;
  const h = createInquiryHandler({
    now: () => time,
    limit: 2,
    provider: {
      accept: async () => {
        calls++;
        return { accepted: false };
      },
    },
  });
  assert.equal((await h({ ...request, origin: "https://other" })).status, 403);
  assert.equal(
    (await h({ ...request, body: { ...valid, website: "bot" } })).status,
    400,
  );
  assert.equal((await h({ ...request, body: {} })).status, 422);
  assert.equal((await h(request)).status, 429);
  time = 60001;
  assert.equal((await h({ ...request, key: "" })).status, 400);
  assert.equal((await h(request)).status, 503);
  assert.equal(calls, 1);
});
test("adapter rejects exceptions and unproven receipt", async () => {
  for (const provider of [
    {
      accept: async () => {
        throw Error("private detail");
      },
    },
    { accept: async () => ({ accepted: true, id: "x" }) },
    new PreviewProvider(),
  ]) {
    const r = await dispatchInquiry(provider, valid, request.key);
    assert.equal(r.status, 503);
    assert.equal(r.body.accepted, false);
    assert.doesNotMatch(JSON.stringify(r), /private detail/);
  }
});
test("adapter contract reports received only with durable identifier (local mock)", async () => {
  const r = await dispatchInquiry(
    {
      accept: async ({ idempotencyKey }) => ({
        accepted: true,
        durable: true,
        id: idempotencyKey,
      }),
    },
    valid,
    request.key,
  );
  assert.equal(r.status, 202);
  assert.equal(r.body.id, request.key);
});
test("HTTP endpoint rejects malformed, oversized, foreign-origin and valid preview payloads", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const post = (body) =>
      fetch(base + "/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: base,
          "Idempotency-Key": request.key,
        },
        body,
      });
    assert.equal((await post("{")).status, 400);
    assert.equal((await post("x".repeat(12001))).status, 413);
    assert.equal((await post(JSON.stringify(valid))).status, 503);
    const r = await fetch(base + "/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil.invalid",
      },
      body: JSON.stringify(valid),
    });
    assert.equal(r.status, 403);
    assert.equal((await fetch(base + "/api/inquiries")).status, 405);
    assert.equal((await fetch(base + "/missing/")).status, 404);
    assert.equal(
      (await fetch(base)).headers.get("x-robots-tag"),
      "noindex, nofollow",
    );
  } finally {
    await new Promise((r) => server.close(r));
  }
});
