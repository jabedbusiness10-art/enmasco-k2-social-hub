/**
 * TASK-57 — Retry & backoff configuration.
 * Exponential backoff with jitter, dead-letter after maxAttempts.
 */

export interface RetryOptions {
  attempts: number;
  backoffStrategy: "fixed" | "exponential";
  backoffDelay: number; // ms (base for exponential)
  maxDelay: number; // ms cap
}

export const DEFAULT_RETRY: RetryOptions = {
  attempts: 3,
  backoffStrategy: "exponential",
  backoffDelay: 5000,
  maxDelay: 5 * 60_000,
};

/** Compute the delay (ms) before the next retry attempt (1-based). */
export function backoffFor(attempt: number, opts: RetryOptions = DEFAULT_RETRY): number {
  if (opts.backoffStrategy === "fixed") {
    return Math.min(opts.backoffDelay, opts.maxDelay);
  }
  const exp = opts.backoffDelay * 2 ** (attempt - 1);
  // Add up to 15% jitter to avoid thundering-herd retries.
  const jitter = Math.random() * 0.15 * exp;
  return Math.min(Math.floor(exp + jitter), opts.maxDelay);
}

/** BullMQ-compatible backoff config object. */
export function bullmqBackoff(opts: RetryOptions = DEFAULT_RETRY) {
  return {
    type: opts.backoffStrategy === "exponential" ? ("exponential" as const) : ("fixed" as const),
    delay: opts.backoffDelay,
  };
}
