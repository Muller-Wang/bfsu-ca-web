"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canSeeAdmin, useCurrentUser } from "@/lib/auth";

export const NAV_ITEMS = [
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
  const { user } = useCurrentUser();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const navItem = (href: string, label: string, zh: string) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderRadius: 8,
          textDecoration: "none",
          background: active ? "var(--color-accent-wash)" : "transparent",
          color: active ? "var(--color-accent)" : "var(--ink-soft)",
          fontWeight: active ? 500 : 400,
          transition: "background 120ms, color 120ms",
        }}
        onMouseEnter={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.background = "var(--paper-sunken)";
        }}
        onMouseLeave={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: active ? "var(--ink-soft)" : "var(--ink-faint)",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 14 }}>{zh}</span>
      </Link>
    );
  };

  return (
    <aside
      className="hidden md:flex"
      style={{
        width: "13rem",
        flexShrink: 0,
        borderRight: "1px solid var(--line-faint)",
        minHeight: "calc(100vh - 64px)",
        position: "sticky",
        top: 64,
        flexDirection: "column",
      }}
    >
      <nav style={{ padding: "20px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((it) => navItem(it.href, it.label, it.zh))}

        {canSeeAdmin(user) && (
          <>
            <div style={{ margin: "12px 0", borderTop: "1px solid var(--line-faint)" }} />
            {navItem("/admin", "Admin", "管理后台")}
          </>
        )}
      </nav>

      <div style={{ marginTop: "auto", padding: "20px 16px", borderTop: "1px solid var(--line-faint)" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.8,
            color: "var(--ink-faint)",
          }}
        >
          BFSU
          <br />
          BFSU Makers Club
          <br />
          Internal · v0.2
        </div>
      </div>
    </aside>
  );
}
