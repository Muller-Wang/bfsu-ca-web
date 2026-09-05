import { NextResponse } from "next/server";
import { clearSession } from "@/lib/server/auth";
import { assertSameOrigin } from "@/lib/server/request";

export async function POST(request: Request) {
  try { assertSameOrigin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  await clearSession();
  return NextResponse.json({ ok: true });
}
