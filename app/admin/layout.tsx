"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";
import { canSeeAdmin, useCurrentUser } from "@/lib/auth";

const ADMIN_NAV = [
  { href: "/admin", label: "成员管理", en: "MEMBERS" },
  { href: "/admin/events", label: "活动管理", en: "EVENTS" },
  { href: "/admin/credits", label: "学时管理", en: "CREDITS" },
  { href: "/admin/templates", label: "模板管理", en: "TEMPLATES" },
  { href: "/admin/permissions", label: "权限设置", en: "PERMISSIONS" },
  { href: "/admin/announcements", label: "系统公告", en: "ANNOUNCEMENTS" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useCurrentUser();
  const allowed = canSeeAdmin(user);

  // 权限守卫：仅社长/副社长/办公室可访问，其余角色直接访问 URL 会被拦回主页
  useEffect(() => {
    if (ready && !allowed) {
      router.replace("/dashboard");
    }
  }, [allowed, ready, router]);

  if (!allowed) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <span className="meta">checking permission…</span>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-6xl">
      <div className="rise rise-1 mb-2">
        <div className="meta">ADMIN · 管理后台</div>
        <h1 className="display text-4xl mt-2">管理后台</h1>
        <p className="meta mt-2">仅社长 · 副社长 · 办公室可访问</p>
      </div>

      <hr className="border-t rule my-8" />

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[200px_1fr] lg:gap-10">
        <aside className="rise rise-2">
          <nav className="flex gap-5 overflow-x-auto border-b rule lg:flex-col lg:gap-1 lg:border-0">
            {ADMIN_NAV.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={clsx(
                    "flex shrink-0 items-baseline justify-between gap-3 py-2 transition-colors group",
                    active ? "text-ink font-medium" : "text-ink-soft hover:text-ink"
                  )}
                >
                  <span className="text-sm">{it.label}</span>
                  <span className={clsx("meta", active ? "text-ink" : "text-ink-mute")}>
                    {active ? "◆" : ""}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rise rise-3 min-w-0">{children}</main>
      </div>
    </div>
  );
}
