import { validateInquiry } from "../../public/validation.js";
import { services } from "../content.mjs";

const ENDPOINT = "https://api.resend.com/emails";
const mailbox = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(
    value,
  );
const identifier = (value) =>
  typeof value === "string" && /^[A-Za-z0-9-]{16,80}$/.test(value);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const outcome = (status, details = {}) => ({
  status,
  delivery: "unconfirmed",
  ...details,
});

export function renderInquiryNotification({ leadId, data, from, to }) {
  const checked = validateInquiry(data);
  if (
    !identifier(leadId) ||
    Object.keys(checked.errors).length ||
    checked.data.website ||
    !mailbox(from) ||
    !mailbox(to)
  )
    throw new Error("Invalid notification input");
  const inquiry = checked.data;
  const reference = `TC-${leadId.replaceAll('-', '').slice(0, 12).toUpperCase()}`;
  const sections = [
    ["Customer & contact", [
      ["Name", inquiry.name],
      ["Preferred contact", inquiry.method === "email" ? "Email" : "Phone call"],
      ["Contact", inquiry.contact],
      ["Town or ZIP", inquiry.location],
    ]],
    ["Project details", [
      ["Project type", services.find((s) => s.id === inquiry.project).name],
      ["Project description", inquiry.description],
      ["Approximate dimensions", typeof data.dimensions === "string" ? data.dimensions.trim().slice(0, 200) || "Not supplied" : "Not supplied"],
      ["Ideal timeframe", inquiry.timeframe || "Not supplied"],
    ]],
    ["Request information", [
      ["Reference", reference],
      ["Consent to respond", data.consent === "yes" ? "Agreed to share details with TrueCraft for responding" : "Not recorded"],
      ["Source page", "/request-estimate/"],
    ]],
  ];
  const disclaimer = "Details only. No price calculated; Bo provides pricing separately. No booking confirmed.";
  const field = ([label, value]) => `<p style="margin:0 0 18px;font-size:16px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word"><strong style="display:block;font-size:13px;color:#475569">${escape(label)}</strong>${escape(value).replace(/\r?\n/g, "<br>")}</p>`;
  return {
    from: `Truecraft Website <${from}>`,
    to: [to],
    subject: `TrueCraft project inquiry | ${reference}`,
    // Homeowner-supplied values never control the sender or recipient.
    ...(inquiry.method === "email" ? { reply_to: inquiry.contact } : {}),
    text: "TrueCraft project inquiry\n\n" + sections.map(([title, rows]) => title + "\n" + rows.map(([label, value]) => `${label}: ${value}`).join("\n\n")).join("\n\n") + "\n\n" + disclaimer,
    html: '<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>TrueCraft project inquiry</title></head><body style="margin:0;padding:0;background:#f1f5f9;color:#172b3a;font-family:Arial,Helvetica,sans-serif">' +
      '<div lang="en" dir="ltr" style="padding:16px 12px"><div style="max-width:600px;margin:0 auto;background:#ffffff;padding:24px 20px;border-top:4px solid #285c4d">' +
      '<p style="margin:0 0 8px;font-size:13px;font-weight:bold;letter-spacing:1px;color:#285c4d">TRUECRAFT HOME IMPROVEMENT</p><h1 style="margin:0 0 28px;font-size:26px;line-height:1.25">Project inquiry</h1>' +
      sections.map(([title, rows]) => `<h2 style="margin:24px 0 16px;padding-top:16px;border-top:1px solid #d7e0e7;font-size:19px;line-height:1.4">${escape(title)}</h2>${rows.map(field).join("")}`).join("") +
      `<p style="margin:24px 0 0;padding:16px;background:#edf4f1;color:#172b3a;font-size:14px;line-height:1.6"><strong>Pricing &amp; booking</strong><br>${disclaimer}</p></div></div></body></html>`,
  };
}

function retryAfter(header, now) {
  if (!header) return undefined;
  const seconds = /^\d+$/.test(header)
    ? Number(header)
    : (Date.parse(header) - now) / 1000;
  return Number.isFinite(seconds) && seconds >= 0
    ? Math.ceil(seconds)
    : undefined;
}

// Notification transport only, not an inquiry acceptance/storage provider.
// The application never constructs this adapter or reads credentials from env.
// Future approved outbox workers must explicitly enable it after durable storage.
export class ResendInquiryAdapter {
  constructor({
    enabled = false,
    apiKey,
    from,
    to,
    fetchImpl = globalThis.fetch,
    timeoutMs = 10000,
    now = Date.now,
  } = {}) {
    this.enabled = enabled === true;
    this.apiKey = apiKey;
    this.from = from;
    this.to = to;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
    this.now = now;
  }

  prepare({leadId,data}) {
    return renderInquiryNotification({leadId,data,from:this.from,to:this.to});
  }

  async notify({ leadId, data, frozenPayload } = {}) {
    if (!this.enabled) return outcome("disabled", { retryable: false });
    if (
      typeof this.apiKey !== "string" ||
      !/^[A-Za-z0-9_-]{8,256}$/.test(this.apiKey) ||
      typeof this.fetchImpl !== "function" ||
      !Number.isInteger(this.timeoutMs) ||
      this.timeoutMs < 1 ||
      this.timeoutMs > 30000
    )
      return outcome("configuration_error", { retryable: false });
    let payload;
    try {
      payload = renderInquiryNotification({
        leadId,
        data,
        from: this.from,
        to: this.to,
      });
      // Only the durable server outbox supplies this field; never map it from
      // request input. Preserve the original envelope across code/config changes.
      if (frozenPayload) {
        if ((frozenPayload.subject !== `TrueCraft inquiry ${leadId}` && frozenPayload.subject !== payload.subject) ||
            JSON.stringify(frozenPayload.to) !== JSON.stringify([this.to]) ||
            !/^Truecraft Website <[^<>\r\n]+>$/.test(frozenPayload.from || '') ||
            !mailbox(frozenPayload.from.slice("Truecraft Website <".length,-1)) ||
            typeof frozenPayload.text !== 'string' || typeof frozenPayload.html !== 'string' ||
            (frozenPayload.reply_to && !mailbox(frozenPayload.reply_to)) ||
            Object.keys(frozenPayload).some(k=>!['from','to','subject','text','html','reply_to'].includes(k))) throw Error('Invalid stored envelope');
        payload = frozenPayload;
      }
    } catch {
      return outcome("invalid_input", { retryable: false });
    }
    // Retries reuse BOTH this key and the frozen payload in an approved outbox.
    const idempotencyKey = `truecraft-inquiry/${leadId}/notification-v1`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(ENDPOINT, {
        method: "POST",
        redirect: "error",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        // Never forward provider bodies: they may contain submitted data or secrets.
        let code;
        if (response.status === 409) {
          try {
            code = (await response.json()).name;
          } catch {
            /* safe permanent conflict default */
          }
        }
        const retryable =
          response.status === 429 ||
          response.status === 408 ||
          response.status >= 500 ||
          (response.status === 409 &&
            code === "concurrent_idempotent_requests");
        return outcome("provider_error", {
          httpStatus: response.status,
          retryable,
          ...(retryable
            ? {
                retryAfterSeconds: retryAfter(
                  response.headers.get("retry-after"),
                  this.now(),
                ),
              }
            : {}),
        });
      }
      let body;
      try {
        body = await response.json();
      } catch {
        return outcome("uncertain", { retryable: true });
      }
      if (
        typeof body?.id !== "string" ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(body.id)
      )
        return outcome("uncertain", { retryable: true });
      // An API id is not proof of inbox arrival, durable lead storage, or owner review.
      return outcome("submitted", { providerId: body.id, retryable: false });
    } catch {
      // Timeout/network loss can happen AFTER Resend accepts the request.
      return outcome("uncertain", { retryable: true });
    } finally {
      clearTimeout(timer);
    }
  }
}
