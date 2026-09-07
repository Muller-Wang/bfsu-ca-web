import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { issueSession } from "@/lib/server/auth";
import type { User } from "@/lib/types";
import { assertLoginRateLimit, assertSameOrigin } from "@/lib/server/request";
import { isDemoEnabled } from "@/lib/server/env";
import { findUser, LOCAL_LOGIN_PASSWORD_HASHES } from "@/lib/mock/users";

const LoginSchema = z.object({ id: z.string().regex(/^\d{11,12}$/), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  try { assertSameOrigin(request); assertLoginRateLimit(request); }
  catch (error) { return NextResponse.json({ error: error instanceof Response && error.status === 429 ? "登录尝试过多，请稍后再试" : "Forbidden" }, { status: error instanceof Response ? error.status : 403 }); }
  const parsed = LoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "学号或密码错误" }, { status: 400 });

  if (isDemoEnabled()) {
    const user = findUser(parsed.data.id);
    const passwordHash = LOCAL_LOGIN_PASSWORD_HASHES[parsed.data.id];
    if (!user || !passwordHash || !(await compare(parsed.data.password, passwordHash))) {
      return NextResponse.json({ error: "学号或密码错误" }, { status: 401 });
    }
    await issueSession(user, true);
    return NextResponse.json({ user });
  }

  try {
  const sql = db();
  const rows = await sql`
    SELECT id, work_no, name, name_en, department, role, title, join_date, password_hash
    FROM users WHERE id = ${parsed.data.id} AND status = 'active' LIMIT 1
  `;
  const row = rows[0];
  if (!row || !(await compare(parsed.data.password, String(row.password_hash)))) {
    return NextResponse.json({ error: "学号或密码错误" }, { status: 401 });
  }

  const user: User = {
    id: String(row.id), workNo: String(row.work_no), name: String(row.name),
    nameEn: row.name_en ? String(row.name_en) : undefined,
    department: row.department as User["department"], role: row.role as User["role"],
    title: row.title ? String(row.title) : undefined, joinDate: String(row.join_date).slice(0, 10),
  };
  await issueSession(user);
  return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "数据库暂未就绪，请联系管理员完成配置后再登录" }, { status: 503 });
  }
}
