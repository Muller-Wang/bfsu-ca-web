"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { USERS } from "@/lib/mock/users";
import { setLocal } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";
import { BauhausMark } from "@/components/ui/BauhausMark";

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find((u) => u.id === studentId);
    if (!user || password.length < 4) {
      setError("学号或密码错误");
      return;
    }
    setLocal(user);
    router.push("/dashboard");
  };

  const quickLogin = (id: string) => {
    const user = USERS.find((u) => u.id === id);
    if (user) {
      setLocal(user);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <aside
        className="hidden md:flex md:w-1/2 flex-col justify-between px-16 py-16 relative overflow-hidden"
        style={{ background: "var(--color-accent)" }}
      >
        <div className="relative z-10">
          <div
            className="font-mono text-[11px] tracking-[0.14em] uppercase mb-10"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Beijing Foreign Studies University
          </div>
          <h1 className="display text-[clamp(3.5rem,5.5vw,5rem)] leading-[1.0]" style={{ color: "#fff" }}>
            北外创协
            <br />
            <span className="italic" style={{ color: "var(--color-gold)" }}>Creative</span>
            <br />
            Association
          </h1>
          <p className="mt-8 text-base leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            北外创协的内网与管理系统——用于策划、申报、归档、日程安排。
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <Image src="/bfsu-badge.png" alt="BFSU" width={40} height={40} className="object-contain opacity-80" />
            <div className="font-mono text-[10px] tracking-widest uppercase leading-loose" style={{ color: "rgba(255,255,255,0.35)" }}>
              Est. 2014
              <br />
              Internal
            </div>
          </div>
          <div className="display text-7xl select-none" style={{ color: "rgba(255,255,255,0.08)" }}>
            № 01
          </div>
        </div>

        {/* Bauhaus decoration — bottom-right corner */}
        <div className="absolute -bottom-16 -right-16 opacity-15" aria-hidden>
          <BauhausMark size={240} invertColors />
        </div>
      </aside>

      {/* Right panel — login form */}
      <main className="flex-1 flex items-center justify-center px-10 py-12 bg-paper">
        <div className="w-full max-w-md rise rise-1">
          <div className="meta text-xs mb-4">Sign in · 登录</div>
          <h2 className="display text-5xl text-ink mb-2 leading-[1.05]">欢迎回来</h2>
          <p className="text-base text-ink-soft mb-10">使用学号和密码登录系统</p>

          <form onSubmit={handleLogin} className="space-y-7">
            <div>
              <label className="meta text-xs block mb-3">学号 / Student ID</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-transparent border-b rule pb-3 outline-none font-mono text-[17px] transition-colors"
                style={{ borderColor: "var(--color-line)", fontFamily: "var(--font-mono)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-line)")}
                placeholder="23110301001"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="meta text-xs block mb-3">密码 / Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full bg-transparent border-b pb-3 outline-none font-mono text-[17px] transition-colors"
                style={{ borderColor: "var(--color-line)", fontFamily: "var(--font-mono)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-line)")}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && <div className="text-sm" style={{ color: "var(--color-danger)" }}>{error}</div>}

            <button
              type="submit"
              className="w-full mt-4 py-4 text-base tracking-[0.25em] text-white rounded-[10px] transition-opacity hover:opacity-90 active:scale-[0.99]"
              style={{ background: "var(--color-accent)" }}
            >
              登 录
            </button>
          </form>

          <div className="mt-10 pt-6 border-t rule">
            <div className="meta text-xs mb-4">Demo · 快速切换角色</div>
            <div className="grid grid-cols-1 gap-1.5">
              {USERS.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u.id)}
                  className="text-left px-4 py-2.5 border rule bg-surface rounded-[8px] transition-colors flex items-center justify-between text-sm group"
                  style={{ transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-line)")}
                >
                  <span>
                    {u.name}
                    <span className="text-ink-mute ml-2 text-xs">{u.department}</span>
                  </span>
                  <span className="meta">{ROLE_LABEL[u.role]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
