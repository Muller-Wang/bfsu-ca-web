import "server-only";

const attempts = new Map<string, { count: number; resetAt: number }>();

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = process.env.APP_ORIGIN || new URL(request.url).origin;
  if (origin && origin !== expectedOrigin) throw new Response("Forbidden", { status: 403 });
}

export function assertLoginRateLimit(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return;
  }
  if (current.count >= 10) throw new Response("Too Many Requests", { status: 429 });
  current.count += 1;
}
