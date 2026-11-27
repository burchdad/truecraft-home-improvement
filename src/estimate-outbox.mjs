// Explicit invocation only. No timer, public worker route, credentials or scheduler.
export async function processEstimateOutbox({
  enabled = false,
  store,
  notifier,
  limit = 10,
} = {}) {
  if (!enabled) return { processed: 0, disabled: true };
  if (
    !store?.durable ||
    !notifier ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50
  )
    throw Error("Invalid worker configuration");
  let processed = 0;
  for (; processed < limit; processed++) {
    const record = await store.claimNext();
    if (!record) break;
    if (!record.claimed) continue;
    let result;
    try {
      result = await notifier.notify({
        leadId: record.id,
        data: record.data,
        frozenPayload: record.payload,
      });
    } catch {
      result = { status: "uncertain", retryable: true };
    }
    // Persist or throw; lease recovery retains the same payload and provider key.
    await store.recordOutcome(record.id, result, record.leaseToken);
  }
  return { processed };
}
