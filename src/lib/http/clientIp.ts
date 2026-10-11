/**
 * Best-effort client IP, used only as a key for rate limiting.
 * Hosts such as Vercel and Netlify set these headers. If you run behind your
 * own proxy, make sure it overwrites them, because clients can fake them.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}
