"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopBar } from "./TopBar";
import { SideNav } from "./SideNav";
import { useCurrentUser } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/", "/revised"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useCurrentUser();

  useEffect(() => {
    if (ready && !user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
    }
  }, [pathname, ready, router, user]);

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  if (!ready || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <span className="meta">loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">跳到主要内容</a>
      <TopBar />
      <div className="flex-1 flex">
        <SideNav />
        <main id="main-content" key={pathname} className="club-page-enter flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
