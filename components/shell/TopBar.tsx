"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown } from "lucide-react";
import { getStoredUser, setLocal } from "@/lib/auth";
import { ROLE_LABEL, type User } from "@/lib/types";

export function TopBar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <header
      className="border-b rule sticky top-0 z-30"
      style={{ background: "color-mix(in srgb, var(--color-paper) 90%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } as React.CSSProperties}
    >
      <div className="px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3 select-none">
          <span className="display text-2xl">
            <span style={{ color: "var(--color-accent)" }}>创</span>协
          </span>
          <span className="meta hidden sm:inline">BFSU · Creative Association</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1.5 text-ink-soft hover:text-ink transition-colors text-sm"
            aria-label="搜索"
          >
            <Search size={15} strokeWidth={1.75} />
            <span className="hidden md:inline">搜索</span>
          </button>

          <button
            className="relative flex items-center gap-1.5 text-ink-soft hover:text-ink transition-colors text-sm"
            aria-label="通知"
          >
            <Bell size={15} strokeWidth={1.75} />
            <span className="hidden md:inline">通知</span>
            <span
              className="absolute -top-1.5 -right-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] text-white font-mono"
              style={{ background: "var(--color-accent)" }}
            >
              3
            </span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2"
              >
                <span
                  className="w-7 h-7 rounded-full grid place-items-center font-serif text-sm text-white"
                  style={{ background: "var(--color-accent)" }}
                >
                  {user.name.slice(-1)}
                </span>
                <span className="hidden md:inline text-sm text-ink">{user.name}</span>
                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  className="text-ink-mute transition-transform duration-150"
                  style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border rule rounded-[10px] shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b rule">
                    <div className="text-sm font-medium text-ink">{user.name} · {user.nameEn}</div>
                    <div className="meta mt-1">{user.department} · {ROLE_LABEL[user.role]}</div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink hover:bg-paper transition-colors"
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={() => {
                      setLocal(null);
                      router.push("/login");
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm transition-colors"
                    style={{ color: "var(--color-danger)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-danger-wash)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm text-ink-soft hover:text-ink transition-colors underline underline-offset-4"
              style={{ textDecorationColor: "var(--color-line)" }}
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
