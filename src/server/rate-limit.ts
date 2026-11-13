/**
 * Server-Side Rate Limiter for Abuse Protection
 * Adheres to NFR-04, SEC-10, and API Specification §4–5.
 */

import { RateLimitError } from '@/domain/errors';

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();

export function enforceRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
}): void {
  const now = options.nowMs ?? Date.now();
  const current = buckets.get(options.key);

  if (!current || now >= current.resetAt) {
    buckets.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return;
  }

  if (current.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw new RateLimitError(
      retryAfterSeconds,
      `Rate limit reached. Please wait ${retryAfterSeconds} seconds before trying again.`
    );
  }

  current.count += 1;
}

export function resetRateLimitsForTests(): void {
  buckets.clear();
}

