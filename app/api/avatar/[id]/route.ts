import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { currentSessionIsDemo, requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { demoStore } from "@/lib/server/demo-store";
import { safeStoredPath } from "@/lib/server/files";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await context.params;
    if (!/^\d{11,12}$/.test(id)) return NextResponse.json({ error: "头像不存在" }, { status: 404 });

    let key: string | undefined;
    if (await currentSessionIsDemo()) {
      const user = demoStore.users.find((item) => item.id === id);
      if (user?.avatarUrl) key = `avatars/${id}.webp`;
    } else {
      const rows = await db()`SELECT avatar_key FROM users WHERE id=${id} AND status='active' LIMIT 1`;
      key = rows[0]?.avatar_key ? String(rows[0].avatar_key) : undefined;
    }
    if (!key) return NextResponse.json({ error: "头像不存在" }, { status: 404 });

    const bytes = await readFile(safeStoredPath(key));
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: error.status === 401 ? "请先登录" : "头像不可用" }, { status: error.status });
    }
    return NextResponse.json({ error: "头像不存在" }, { status: 404 });
  }
}
