/**
 * Small in-memory rate limiter (per IP, sliding window). Good enough for a
 * single instance; swap for Redis/Upstash when you scale out.
 */
const WINDOW_MS = 60_000;
const buckets = new Map<string, number[]>();

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip")) ?? "anonymous";
}

export function rateLimit(key: string, limit: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= limit) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - hits[0])) / 1000);
    buckets.set(key, hits);
    return { ok: false, retryAfterSec };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= WINDOW_MS)) buckets.delete(k);
  }
  return { ok: true, retryAfterSec: 0 };
}
