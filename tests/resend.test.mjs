import test from "node:test";
import assert from "node:assert/strict";
import {
  ResendInquiryAdapter,
  renderInquiryNotification,
} from "../src/adapters/resend.mjs";
import { dispatchInquiry, createInquiryHandler } from "../src/inquiry.mjs";
const data = {
  name: "Synthetic Person",
  method: "email",
  contact: "synthetic@example.invalid",
  location: "Frankston",
  project: "other",
  description: "Synthetic local test only.",
  timeframe: "",
};
const lead = { leadId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", data };
const config = {
  enabled: true,
  apiKey: "mock-key-not-a-credential",
  from: "sender@example.invalid",
  to: "recipient@example.invalid",
};
const response = (
  body = { id: "mock-provider-id" },
  status = 200,
  headers = {},
) => new Response(JSON.stringify(body), { status, headers });

test("disabled by default: even complete config makes zero transport calls", async () => {
  let calls = 0;
  const adapter = new ResendInquiryAdapter({
    ...config,
    enabled: undefined,
    fetchImpl: async () => {
      calls++;
      throw Error("must not call");
    },
  });
  assert.deepEqual(await adapter.notify(lead), {
    status: "disabled",
    delivery: "unconfirmed",
    retryable: false,
  });
  assert.equal(calls, 0);
  assert.equal((await new ResendInquiryAdapter().notify()).status, "disabled");
});
test("mocked request matches Resend REST contract and never reports delivery or acceptance", async () => {
  let request;
  const a = new ResendInquiryAdapter({
    ...config,
    fetchImpl: async (url, options) => {
      request = { url, ...options };
      return response();
    },
  });
  const result = await a.notify(lead);
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.method, "POST");
  assert.equal(request.redirect, "error");
  assert.equal(request.headers.Authorization, `Bearer ${config.apiKey}`);
  const body = JSON.parse(request.body);
  assert.deepEqual(body.to, [config.to]);
  assert.equal(body.reply_to, data.contact);
  assert.equal(body.from, `Truecraft Website <${config.from}>`);
  assert.match(body.text, /Source page: \/request-estimate\//);
  assert.match(body.text, /Ideal timeframe: Not supplied/);
  assert.match(body.subject, new RegExp(lead.leadId));
  assert.deepEqual(result, {
    status: "submitted",
    delivery: "unconfirmed",
    providerId: "mock-provider-id",
    retryable: false,
  });
  assert.equal(result.accepted, undefined);
  assert.equal(result.durable, undefined);
});
test("same stored lead generates identical key and payload for concurrent retries", async () => {
  const requests = [];
  const a = new ResendInquiryAdapter({
    ...config,
    fetchImpl: async (_, o) => {
      requests.push(o);
      return response();
    },
  });
  await Promise.all([a.notify(lead), a.notify(lead)]);
  assert.equal(
    requests[0].headers["Idempotency-Key"],
    `truecraft-inquiry/${lead.leadId}/notification-v1`,
  );
  assert.equal(
    requests[0].headers["Idempotency-Key"],
    requests[1].headers["Idempotency-Key"],
  );
  assert.equal(requests[0].body, requests[1].body);
  // This asserts request stability only; persistent deduplication is still required.
});
test("HTML is escaped and phone inquiries omit reply-to", () => {
  const body = renderInquiryNotification({
    ...lead,
    data: {
      ...data,
      name: "<b>Test & Name</b>",
      description: '<script>alert("test")</script>\nMore details',
      method: "phone",
      contact: "(903) 555-0100",
    },
    from: config.from,
    to: config.to,
  });
  assert.doesNotMatch(body.html, /<script>|<b>/);
  assert.match(body.html, /&lt;script&gt;/);
  assert.match(body.html, /<br>More details/);
  assert.equal(body.reply_to, undefined);
});
test("invalid sender, recipient, fields and header injection never reach transport", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return response();
  };
  for (const patch of [
    { from: "x\r\nBcc: victim@example.invalid" },
    { to: "one@example.invalid,two@example.invalid" },
    { apiKey: "" },
    { apiKey: "key\r\nInjected" },
    { timeoutMs: 0 },
  ])
    assert.notEqual(
      (
        await new ResendInquiryAdapter({
          ...config,
          ...patch,
          fetchImpl,
        }).notify(lead)
      ).status,
      "submitted",
    );
  const a = new ResendInquiryAdapter({ ...config, fetchImpl });
  for (const item of [
    { ...lead, leadId: "bad" },
    { ...lead, data: { ...data, contact: "x\r\nBcc: victim@example.invalid" } },
    { ...lead, data: { ...data, website: "bot" } },
    { ...lead, data: { ...data, description: "x" } },
    { ...lead, data: null },
  ])
    assert.equal((await a.notify(item)).status, "invalid_input");
  assert.equal(calls, 0);
});
test("configuration does not read environment or wire adapter into acceptance", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "synthetic-test-key";
  try {
    assert.equal(
      (await new ResendInquiryAdapter().notify(lead)).status,
      "disabled",
    );
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
  const h = createInquiryHandler();
  const result = await h({
    body: data,
    origin: "http://local",
    expectedOrigin: "http://local",
    ip: "mock",
    key: lead.leadId,
  });
  assert.equal(result.status, 503);
  let calls = 0;
  const adapter = new ResendInquiryAdapter({
    ...config,
    fetchImpl: async () => {
      calls++;
      return response();
    },
  });
  assert.equal((await dispatchInquiry(adapter, data, lead.leadId)).status, 503);
  assert.equal(calls, 0);
});
test("permanent 4xx failures do not retry or expose provider details", async () => {
  for (const status of [400, 401, 403, 404, 409, 422]) {
    const a = new ResendInquiryAdapter({
      ...config,
      fetchImpl: async () =>
        response(
          {
            name: "invalid_idempotent_request",
            message: "private secret and PII",
          },
          status,
        ),
    });
    const r = await a.notify(lead);
    assert.equal(r.retryable, false);
    assert.equal(r.status, "provider_error");
    assert.doesNotMatch(JSON.stringify(r), /private|secret|PII/);
  }
});
test("transient errors and concurrent key conflicts are retryable without automatic sending", async () => {
  for (const status of [408, 429, 500, 503]) {
    let calls = 0;
    const a = new ResendInquiryAdapter({
      ...config,
      fetchImpl: async () => {
        calls++;
        return response({}, status, { "Retry-After": "12" });
      },
    });
    const r = await a.notify(lead);
    assert.equal(r.retryable, true);
    assert.equal(r.retryAfterSeconds, 12);
    assert.equal(calls, 1);
  }
  const a = new ResendInquiryAdapter({
    ...config,
    fetchImpl: async () =>
      response({ name: "concurrent_idempotent_requests" }, 409),
  });
  assert.equal((await a.notify(lead)).retryable, true);
});
test("Retry-After dates are parsed; invalid values are ignored", async () => {
  for (const [header, expected] of [
    ["Fri, 16 Oct 2026 12:00:10 GMT", 10],
    ["invalid", undefined],
    ["-1", undefined],
  ]) {
    const a = new ResendInquiryAdapter({
      ...config,
      now: () => Date.parse("2026-10-16T12:00:00Z"),
      fetchImpl: async () => response({}, 429, { "Retry-After": header }),
    });
    assert.equal((await a.notify(lead)).retryAfterSeconds, expected);
  }
});
test("network failures and malformed success responses remain uncertain", async () => {
  for (const fetchImpl of [
    async () => {
      throw Error("private network credentials");
    },
    async () => new Response("not JSON"),
    async () => response({}),
    async () => response({ id: "<unsafe>" }),
  ]) {
    const a = new ResendInquiryAdapter({ ...config, fetchImpl });
    assert.deepEqual(await a.notify(lead), {
      status: "uncertain",
      delivery: "unconfirmed",
      retryable: true,
    });
  }
});
test("abort timeout bounds request and is marked uncertain, never delivered", async () => {
  const a = new ResendInquiryAdapter({
    ...config,
    timeoutMs: 5,
    fetchImpl: async (_, o) =>
      new Promise((_, reject) =>
        o.signal.addEventListener("abort", () => reject(new Error("aborted")), {
          once: true,
        }),
      ),
  });
  assert.deepEqual(await a.notify(lead), {
    status: "uncertain",
    delivery: "unconfirmed",
    retryable: true,
  });
});
