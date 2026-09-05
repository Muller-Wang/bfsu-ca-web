import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { isDemoEnabled } from "@/lib/server/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoEnabled()) return NextResponse.json({ status: "ok", mode: "demo" });
  try {
    await db()`SELECT 1`;
    return NextResponse.json({ status: "ok", mode: "production" });
  } catch {
    return NextResponse.json({ status: "unavailable", database: "disconnected" }, { status: 503 });
  }
}
