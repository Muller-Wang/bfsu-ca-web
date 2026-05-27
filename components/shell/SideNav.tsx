"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { canSeeAdmin, getStoredUser } from "@/lib/auth";
import type { User } from "@/lib/types";

const ITEMS = [
  { href: "/", label: "Dashboard", zh: "主页" },
  { href: "/calendar", label: "Calendar", zh: "日历" },
  { href: "/tasks", label: "Tasks", zh: "任务" },
  { href: "/workspace", label: "Workspace", zh: "外联工作区" },
  { href: "/library", label: "Library", zh: "资料库" },
  { href: "/profile", label: "Profile", zh: "个人中心" },
] as const;

export function SideNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-52 shrink-0 border-r rule min-h-[calc(100vh-4rem)] sticky top-16 self-start">
      <nav className="px-6 py-8 flex flex-col gap-1">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "group flex items-baseline justify-between py-2 transition-colors",
              isActive(it.href) ? "text-accent" : "text-ink hover:text-accent"
            )}
          >
            <span
              className={clsx(
                "small-caps text-xs font-mono",
                isActive(it.href) ? "text-accent" : "text-ink-soft"
              )}
            >
              {it.label}
            </span>
            <span className="text-sm">{it.zh}</span>
          </Link>
        ))}

        {canSeeAdmin(user) && (
          <>
            <div className="my-4 border-t rule" />
            <Link
              href="/admin"
              className={clsx(
                "group flex items-baseline justify-between py-2 transition-colors",
                pathname.startsWith("/admin") ? "text-accent" : "text-ink hover:text-accent"
              )}
            >
              <span
                className={clsx(
                  "small-caps text-xs font-mono",
                  pathname.startsWith("/admin") ? "text-accent" : "text-ink-soft"
                )}
              >
                Admin
              </span>
              <span className="text-sm">管理后台</span>
            </Link>
          </>
        )}
      </nav>

      <div className="px-6 py-6 mt-auto">
        <div className="meta text-[10px] leading-relaxed">
          BFSU
          <br />
          Creative Association
          <br />
          Internal · v0.1
        </div>
      </div>
    </aside>
  );
}
