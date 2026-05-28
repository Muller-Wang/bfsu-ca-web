"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { USERS } from "@/lib/mock/users";
import { setLocal } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";

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
      {/* Left side — editorial banner */}
      <aside className="hidden md:flex md:w-1/2 bg-card border-r rule px-16 py-20 flex-col justify-between relative overflow-hidden">
        <div>
          <div className="meta text-xs">BEIJING FOREIGN STUDIES UNIVERSITY</div>
          <h1 className="display mt-10 leading-[0.95] text-[clamp(4rem,6.0vw,6.0rem)]">
            北外创协
            <br />
            <span className="text-accent italic font-serif">Creative</span>
            <br />
            Association
          </h1>
          <p className="mt-12 text-base text-ink-soft max-w-md leading-relaxed">
            北外创协的内网和管理系统
            用于策划、申报、归档、日程安排
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div className="meta text-xs">EST. 2014 · INTERNAL</div>
          <div className="display text-8xl text-rule select-none">№ 01</div>
        </div>

        {/* Decorative rule */}
        <div className="absolute top-1/2 left-16 right-16 border-t border-rule pointer-events-none" />
      </aside>

      {/* Right side — login form */}
      <main className="flex-1 flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-md">
          <div className="meta text-xs mb-4">SIGN IN · 登录</div>
          <h2 className="display text-6xl mb-3 leading-[1.05]">欢迎回来</h2>
          <p className="text-base text-ink-soft mb-12">使用学号和密码登录系统</p>

          <form onSubmit={handleLogin} className="space-y-7">
            <div>
              <label className="meta text-xs block mb-3">学号 / STUDENT ID</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-transparent border-b rule pb-3 outline-none focus:border-ink font-mono text-lg transition-colors"
                placeholder="23110301001"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="meta text-xs block mb-3">密码 / PASSWORD</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full bg-transparent border-b rule pb-3 outline-none focus:border-ink font-mono text-lg transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && <div className="text-sm text-danger">{error}</div>}

            <button
              type="submit"
              className="w-full mt-4 py-4 bg-ink text-card hover:bg-accent transition-colors text-base tracking-[0.3em]"
            >
              登 录
            </button>
          </form>

          <div className="mt-12 pt-7 border-t rule">
            <div className="meta text-xs mb-4">DEMO · 快速切换角色查看</div>
            <div className="grid grid-cols-1 gap-2">
              {USERS.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u.id)}
                  className="text-left px-4 py-2.5 border rule hover:bg-card hover:border-accent transition-colors flex items-center justify-between text-sm"
                >
                  <span>
                    {u.name}
                    <span className="text-ink-soft ml-2 text-xs">{u.department}</span>
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
