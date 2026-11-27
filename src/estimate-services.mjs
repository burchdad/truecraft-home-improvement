import {
  createEstimateIntake,
  createEstimateNotifier,
  createEstimateHttpHandler,
} from "./estimate-intake.mjs";
import {
  PostgresIntakeStore,
  PostgresRateLimiter,
} from "./adapters/postgres-intake.mjs";
import { processEstimateOutbox } from "./estimate-outbox.mjs";
// Not imported by the deployed endpoint. Activation requires a reviewed bootstrap.
// The caller owns the private pool and an authenticated platform client ID resolver.
export function createDurableEstimateServices({
  enabled = false,
  mode = "verification",
  pool,
  origin,
  hashSecret,
  apiKey,
  from,
  clientId,
  fetchImpl,
  now = Date.now,
} = {}) {
  if (!enabled)
    return {
      handler: createEstimateHttpHandler(),
      drain: () => processEstimateOutbox(),
    };
  if (
    typeof clientId !== "function" ||
    new URL(origin).origin !== origin ||
    !origin.startsWith("https://")
  )
    throw Error("Invalid intake configuration");
  const notifier = createEstimateNotifier({
    enabled: true,
    mode,
    apiKey,
    from,
    fetchImpl,
  });
  const store = new PostgresIntakeStore({
    pool,
    prepare: (input) => notifier.prepare(input),
    now,
  });
  const limiter = new PostgresRateLimiter({ pool, hashSecret, now });
  const intake = createEstimateIntake({
    enabled: true,
    mode,
    origin,
    store,
    limiter,
    notifier,
    now,
  });
  return {
    handler: createEstimateHttpHandler({ intake, clientId }),
    drain: () => processEstimateOutbox({ enabled: true, store, notifier }),
    store,
    limiter,
  };
}
