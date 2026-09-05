import { NextResponse } from "next/server";
import { isDemoEnabled } from "@/lib/server/env";
import { USERS } from "@/lib/mock/users";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const presentationRequested = new URL(request.url).searchParams.get("presentation") === "1";
  const demoEnabled = isDemoEnabled() && presentationRequested;
  return NextResponse.json({
    demoEnabled,
    demoUsers: demoEnabled ? USERS.filter((user) => user.id !== "202420107031").slice(0, 5) : [],
  });
}
