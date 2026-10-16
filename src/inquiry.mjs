import { validateInquiry } from "../public/validation.js";
export class PreviewProvider {
  async accept() {
    return {
      accepted: false,
      code: "PREVIEW_ONLY",
      message:
        "Preview only, not connected. Nothing was sent or saved. Please call (903) 275-0361.",
    };
  }
}
// Future adapters must durably accept by idempotency key before returning accepted:true.
// No production provider is supplied or selectable through environment variables.
export async function dispatchInquiry(provider, data, key) {
  try {
    const result = await provider.accept({ data, idempotencyKey: key });
    if (
      result.accepted === true &&
      typeof result.id === "string" &&
      result.id &&
      result.durable === true
    )
      return {
        status: 202,
        body: { accepted: true, id: result.id, message: "Request received." },
      };
    return {
      status: 503,
      body: {
        accepted: false,
        message:
          result.message || "Nothing was accepted. Please call (903) 275-0361.",
      },
    };
  } catch {
    return {
      status: 503,
      body: {
        accepted: false,
        message: "Nothing was confirmed received. Please call (903) 275-0361.",
      },
    };
  }
}
export function createInquiryHandler({
  provider = new PreviewProvider(),
  now = Date.now,
  limit = 6,
} = {}) {
  const attempts = new Map();
  return async ({ body, origin, expectedOrigin, ip, key }) => {
    if (origin !== expectedOrigin)
      return {
        status: 403,
        body: {
          accepted: false,
          message: "This request origin is not allowed.",
        },
      };
    const time = now();
    for (const [k, v] of attempts)
      if (time - v.start >= 60000) attempts.delete(k);
    const bucket = attempts.get(ip) || { start: time, count: 0 };
    bucket.count++;
    attempts.set(ip, bucket);
    if (bucket.count > limit)
      return {
        status: 429,
        body: {
          accepted: false,
          message:
            "Too many attempts. Please wait a minute or call (903) 275-0361.",
        },
      };
    const { data, errors } = validateInquiry(body);
    if (data.website)
      return {
        status: 400,
        body: {
          accepted: false,
          message: "Unable to accept this request. Please call.",
        },
      };
    if (Object.keys(errors).length)
      return { status: 422, body: { accepted: false, errors } };
    if (!/^[a-zA-Z0-9-]{16,80}$/.test(key || ""))
      return {
        status: 400,
        body: { accepted: false, message: "A valid request key is required." },
      };
    return dispatchInquiry(provider, data, key);
  };
}
