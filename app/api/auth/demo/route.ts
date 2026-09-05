import { NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/server/demo-store";
import { issueSession } from "@/lib/server/auth";
import { isDemoEnabled } from "@/lib/server/env";
import { assertSameOrigin } from "@/lib/server/request";

const DemoSchema = z.object({ id: z.string() });

export async function POST(request: Request) {
  try { assertSameOrigin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  if (!isDemoEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = DemoSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "无效账号" }, { status: 400 });
  const user = demoStore.users.find((item) => item.id === parsed.data.id);
  if (!user) return NextResponse.json({ error: "无效账号" }, { status: 404 });
  await issueSession(user, true);
  return NextResponse.json({ user });
}
