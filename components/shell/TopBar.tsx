"use client";

import Link from "next/link";
import Image from "next/image";
import { ClubBrand } from "@/components/brand/ClubBrand";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, Menu, X } from "lucide-react";
import { canSeeAdmin, logout, useCurrentUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";
import { NAV_ITEMS } from "./SideNav";

const ENABLE_GLOBAL_TOOLS = false;

export function TopBar() {
  const { user } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: 64,
        display: "flex",
        alignItems: "center",
        background: "color-mix(in srgb, var(--surface) 80%, transparent)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        borderBottom: "1px solid var(--line-faint)",
      } as React.CSSProperties}
    >
      <div
        style={{
          width: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          <ClubBrand compact />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {ENABLE_GLOBAL_TOOLS && <button
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-soft)", background: "none", border: "none", cursor: "pointer", transition: "color 120ms" }}
            aria-label="搜索"
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-soft)")}
          >
            <Search size={15} strokeWidth={1.75} />
            <span className="hidden md:inline">搜索</span>
          </button>}

          {ENABLE_GLOBAL_TOOLS && <button
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-soft)", background: "none", border: "none", cursor: "pointer", transition: "color 120ms" }}
            aria-label="通知"
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-soft)")}
          >
            <Bell size={15} strokeWidth={1.75} />
            <span className="hidden md:inline">通知</span>
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "var(--ink)",
                color: "#fff",
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              3
            </span>
          </button>}

          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="打开账户菜单"
                aria-expanded={menuOpen}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "var(--ink)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" unoptimized />
                  ) : user.name.slice(-1)}
                </span>
                <span className="hidden md:inline" style={{ fontSize: 14, color: "var(--ink)" }}>{user.name}</span>
                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  style={{
                    color: "var(--ink-mute)",
                    transition: "transform 150ms",
                    transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: 220,
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-lg)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line-faint)" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                      {user.name} · {user.nameEn}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--ink-mute)",
                        marginTop: 4,
                      }}
                    >
                      {user.department} · {ROLE_LABEL[user.role]}
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    style={{ display: "block", padding: "11px 16px", fontSize: 14, color: "var(--ink)", textDecoration: "none", transition: "background 120ms" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--paper)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      // Ensure every client-side auth cache is discarded.
                      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                      window.location.assign("/login");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "11px 16px",
                      fontSize: 14,
                      color: "var(--color-danger)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 120ms",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-danger-wash)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "1.9rem",
                padding: "0 1rem",
                fontSize: 13,
                fontWeight: 500,
                color: "#fff",
                background: "var(--ink)",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              登录
            </Link>
          )}
          {user && (
            <button
              type="button"
              className="md:hidden grid h-9 w-9 place-items-center rounded-lg border rule text-ink-soft"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? "关闭导航" : "打开导航"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          )}
        </div>
      </div>
      {user && mobileOpen && (
        <nav className="absolute left-0 right-0 top-16 z-40 border-b rule bg-surface p-3 shadow-lg md:hidden" aria-label="移动端导航">
          <div className="grid grid-cols-2 gap-1">
            {[...NAV_ITEMS, ...(canSeeAdmin(user) ? [{ href: "/admin", label: "Admin", zh: "管理后台" } as const] : [])].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm transition-colors ${pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) ? "bg-paper-sunken text-ink" : "text-ink-soft hover:bg-paper-sunken"}`}
              >
                <span className="meta mr-2 text-[9px]">{item.label}</span>{item.zh}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
