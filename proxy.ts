import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "bfsu-makers-session";
const PUBLIC = new Set(["/", "/login", "/revised"]);
const ADMIN_ROLES = new Set(["president", "vice_president", "secretary"]);

async function verify(request: NextRequest) {
  const value = request.cookies.get(COOKIE)?.value;
  const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "bfsu-makers-club-local-development-secret-only" : "");
  if (!value || !secret) return null;
  try {
    const { payload } = await jwtVerify(value, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    if (payload.demo && process.env.DEMO_MODE !== "1") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (PUBLIC.has(path) || path.startsWith("/_next") || path.startsWith("/api") || /\.[a-z0-9]+$/i.test(path)) {
    return NextResponse.next();
  }

  const session = await verify(request);
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  if (path.startsWith("/admin") && !ADMIN_ROLES.has(String(session.role))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
