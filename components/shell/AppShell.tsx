"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopBar } from "./TopBar";
import { SideNav } from "./SideNav";
import { getStoredUser } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  if (!checked) {
    return (
      <div className="min-h-screen grid place-items-center">
        <span className="meta">loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-1 flex">
        <SideNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
