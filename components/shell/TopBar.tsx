"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <header className="border-b rule bg-paper/90 backdrop-blur sticky top-0 z-30">
      <div className="px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3 select-none">
          <span className="display text-2xl">创协</span>
          <span className="meta">BFSU · Creative Association</span>
        </Link>

        <div className="flex items-center gap-5">
          <button className="meta hover:text-ink transition-colors" aria-label="搜索">
            <span aria-hidden>⌕</span>
            <span className="ml-2 hidden md:inline">搜索</span>
          </button>

          <button className="relative meta hover:text-ink transition-colors" aria-label="通知">
            <span aria-hidden>◔</span>
            <span className="ml-2 hidden md:inline">通知</span>
            <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] bg-accent text-card font-mono">
              3
            </span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 group"
              >
                <span className="w-7 h-7 rounded-full bg-accent/15 text-accent grid place-items-center font-serif text-sm">
                  {user.name.slice(-1)}
                </span>
                <span className="hidden md:inline text-sm">{user.name}</span>
                <span className="meta opacity-60 group-hover:opacity-100">▾</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border rule rounded-sm shadow-lg">
                  <div className="px-3 py-3 border-b rule">
                    <div className="text-sm">{user.name} · {user.nameEn}</div>
                    <div className="meta mt-1">
                      {user.department} · {ROLE_LABEL[user.role]}
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-paper"
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={() => {
                      setLocal(null);
                      router.push("/login");
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-paper text-danger"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-sm underline decoration-rule underline-offset-4 hover:text-accent">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
