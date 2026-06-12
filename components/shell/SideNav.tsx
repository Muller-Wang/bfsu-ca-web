"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { canSeeAdmin, getStoredUser } from "@/lib/auth";
import type { User } from "@/lib/types";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", zh: "主页" },
  { href: "/calendar", label: "Calendar", zh: "日历" },
  { href: "/tasks", label: "Tasks", zh: "任务" },
  { href: "/ideas", label: "Ideas", zh: "创意点子库" },
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

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside className="w-52 shrink-0 border-r rule min-h-[calc(100vh-4rem)] sticky top-16 self-start flex flex-col">
      <nav className="px-4 py-6 flex flex-col gap-0.5">
        {ITEMS.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className="flex items-baseline justify-between px-3 py-2 rounded-[8px] transition-colors"
              style={{
                background: active ? "var(--color-accent-wash)" : undefined,
                color: active ? "var(--color-accent)" : "var(--color-ink)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--color-paper-sunken)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "";
              }}
            >
              <span
                className="small-caps text-xs font-mono"
                style={{ color: active ? "var(--color-accent)" : "var(--color-ink-mute)" }}
              >
                {it.label}
              </span>
              <span className="text-sm">{it.zh}</span>
            </Link>
          );
        })}

        {canSeeAdmin(user) && (
          <>
            <div className="my-3 border-t rule" />
            {(() => {
              const active = pathname.startsWith("/admin");
              return (
                <Link
                  href="/admin"
                  className="flex items-baseline justify-between px-3 py-2 rounded-[8px] transition-colors"
                  style={{
                    background: active ? "var(--color-accent-wash)" : undefined,
                    color: active ? "var(--color-accent)" : "var(--color-ink)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "var(--color-paper-sunken)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "";
                  }}
                >
                  <span
                    className="small-caps text-xs font-mono"
                    style={{ color: active ? "var(--color-accent)" : "var(--color-ink-mute)" }}
                  >
                    Admin
                  </span>
                  <span className="text-sm">管理后台</span>
                </Link>
              );
            })()}
          </>
        )}
      </nav>

      <div className="mt-auto px-5 py-5 border-t rule">
        <div className="font-mono leading-loose tracking-widest uppercase" style={{ fontSize: 10, color: "var(--color-ink-mute)" }}>
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
