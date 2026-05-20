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
    router.push("/");
  };

  const quickLogin = (id: string) => {
    const user = USERS.find((u) => u.id === id);
    if (user) {
      setLocal(user);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — editorial banner */}
      <aside className="hidden md:flex md:w-2/5 bg-card border-r rule px-12 py-16 flex-col justify-between relative overflow-hidden">
        <div>
          <div className="meta">BEIJING FOREIGN STUDIES UNIVERSITY</div>
          <h1 className="display text-5xl mt-6 leading-[1.05]">
            创协
            <br />
            <span className="text-accent italic font-serif">Creative</span>
            <br />
            Association
          </h1>
          <p className="mt-8 text-sm text-ink-soft max-w-xs leading-relaxed">
            一个让秘书处、各部部长和成员都在同一张桌上工作的地方。
            策划、申报、归档、学时——一以贯之。
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div className="meta">EST. 2024 · INTERNAL</div>
          <div className="display text-7xl text-rule select-none">№ 01</div>
        </div>

        {/* Decorative rule */}
        <div className="absolute top-1/2 left-12 right-12 border-t border-rule pointer-events-none" />
      </aside>

      {/* Right side — login form */}
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="meta mb-2">SIGN IN · 登录</div>
          <h2 className="display text-3xl mb-1">欢迎回来</h2>
          <p className="text-sm text-ink-soft mb-8">使用学号和密码登录系统</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="meta block mb-2">学号 / STUDENT ID</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-transparent border-b rule pb-2 outline-none focus:border-ink font-mono text-base transition-colors"
                placeholder="23110301001"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="meta block mb-2">密码 / PASSWORD</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full bg-transparent border-b rule pb-2 outline-none focus:border-ink font-mono text-base transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && <div className="text-sm text-danger">{error}</div>}

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-ink text-card hover:bg-accent transition-colors text-sm tracking-wider"
            >
              登 录
            </button>
          </form>

          <div className="mt-10 pt-6 border-t rule">
            <div className="meta mb-3">DEMO · 快速切换角色查看</div>
            <div className="grid grid-cols-1 gap-1.5">
              {USERS.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u.id)}
                  className="text-left px-3 py-2 border rule hover:bg-card hover:border-accent transition-colors flex items-center justify-between text-sm"
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
