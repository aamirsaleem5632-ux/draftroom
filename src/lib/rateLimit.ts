/**
 * A very simple "sliding window" rate limiter that keeps its counts in memory.
 *
 * Good enough for an MVP on one server. Limits:
 *  - counts reset when the server restarts;
 *  - on serverless hosts each instance has its own counts, so the limit is
 *    approximate. For real protection later, use a shared store (e.g. Redis).
 */

const hits = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

  if (recent.length >= max) {
    hits.set(key, recent);
    const oldest = recent[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep memory bounded: drop keys with no recent activity.
  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [storedKey, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) {
        hits.delete(storedKey);
      }
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** For tests only. */
export function resetRateLimit(): void {
  hits.clear();
}
