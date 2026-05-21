"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const ADMIN_NAV = [
  { href: "/admin", label: "成员管理", en: "MEMBERS" },
  { href: "/admin/events", label: "活动管理", en: "EVENTS" },
  { href: "/admin/credits", label: "学时管理", en: "CREDITS" },
  { href: "/admin/permissions", label: "权限设置", en: "PERMISSIONS" },
  { href: "/admin/announcements", label: "系统公告", en: "ANNOUNCEMENTS" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="px-10 py-10 max-w-6xl">
      <div className="rise rise-1 mb-2">
        <div className="meta">ADMIN · 管理后台</div>
        <h1 className="display text-4xl mt-2">管理后台</h1>
        <p className="meta mt-2">仅社长 · 副社长 · 秘书处可访问</p>
      </div>

      <hr className="border-t rule my-8" />

      <div className="grid grid-cols-[200px_1fr] gap-10">
        <aside className="rise rise-2">
          <nav className="flex flex-col gap-1">
            {ADMIN_NAV.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={clsx(
                    "flex items-baseline justify-between py-2 transition-colors group",
                    active ? "text-accent" : "text-ink hover:text-accent"
                  )}
                >
                  <span className="text-sm">{it.label}</span>
                  <span className={clsx("meta", active ? "text-accent" : "text-ink-soft")}>
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
