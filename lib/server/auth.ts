import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { Role, User } from "@/lib/types";
import { USERS } from "@/lib/mock/users";
import { db } from "./db";
import { isDemoEnabled, sessionSecret } from "./env";

export const SESSION_COOKIE = "bfsu-makers-session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const ADMIN_ROLES: Role[] = ["president", "vice_president", "secretary"];

interface SessionPayload extends JWTPayload {
  role: Role;
  demo?: boolean;
}

function rowToUser(row: Record<string, unknown>): User {
  const probationEnd = row.probation_ends_at ? new Date(String(row.probation_ends_at)) : null;
  const left = probationEnd
    ? Math.max(0, Math.ceil((probationEnd.getTime() - Date.now()) / 86_400_000))
    : undefined;
  return {
    id: String(row.id),
    workNo: String(row.work_no),
    name: String(row.name),
    nameEn: row.name_en ? String(row.name_en) : undefined,
    department: row.department as User["department"],
    role: row.role as Role,
    title: row.title ? String(row.title) : undefined,
    joinDate: String(row.join_date).slice(0, 10),
    probationLeftDays: left,
  };
}

export async function issueSession(user: User, demo = false) {
  const token = await new SignJWT({ role: user.role, demo } satisfies Omit<SessionPayload, keyof JWTPayload>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export async function readSessionToken(token?: string): Promise<SessionPayload | null> {
  try {
    const raw = token ?? (await cookies()).get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    const { payload } = await jwtVerify(raw, sessionSecret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.role !== "string") return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<User | null> {
  const session = await readSessionToken();
  if (!session?.sub) return null;

  if (session.demo) {
    if (!isDemoEnabled()) return null;
    return USERS.find((user) => user.id === session.sub) ?? null;
  }

  const sql = db();
  const rows = await sql`
    SELECT id, work_no, name, name_en, department, role, title, join_date, probation_ends_at
    FROM users
    WHERE id = ${session.sub} AND status = 'active'
    LIMIT 1
  `;
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function currentSessionIsDemo() {
  const session = await readSessionToken();
  return session?.demo === true && isDemoEnabled();
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

export async function requireRole(roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Response("Forbidden", { status: 403 });
  return user;
}

export async function requireAdmin(): Promise<User> {
  return requireRole(ADMIN_ROLES);
}

export function isAdminRole(role: Role) {
  return ADMIN_ROLES.includes(role);
}
