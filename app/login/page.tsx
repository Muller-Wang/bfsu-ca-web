"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClubBrand } from "@/components/brand/ClubBrand";
import { Composition } from "@/components/brand/ClubExperience";
import s from "@/app/revised/revised.module.css";
import { api } from "@/lib/api-client";
import { ROLE_LABEL, type User } from "@/lib/types";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("presentation") !== "1") return;
    api<{ demoEnabled: boolean; demoUsers: User[] }>("/api/config?presentation=1")
      .then((result) => setDemoUsers(result.demoEnabled ? result.demoUsers : []))
      .catch(() => setDemoUsers([]));
  }, []);

  async function signIn(demoId?: string) {
    setError("");
    setSubmitting(true);
    try {
      await api<{ user: User }>(demoId ? "/api/auth/demo" : "/api/auth/login", {
        method: "POST",
        body: JSON.stringify(demoId ? { id: demoId } : { id: studentId.trim(), password }),
      });
      // Refresh every independently loaded client session after authentication.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className={`club-login ${s.root}`}>
    <a href="#login-form" className="skip-link">跳到登录表单</a>
    <header className="club-login-header"><Link href="/" aria-label="北外创客俱乐部，返回首页"><ClubBrand /></Link></header>
    <main className="club-login-layout">
      <div className="club-login-art"><Composition compact /><h2 className="club-login-motto">每一个好想法，<br />都从这里开始。</h2></div>
      <section id="login-form" className="club-login-form" aria-labelledby="login-title">
        <p className="meta">MEMBERS / 成员入口</p><h1 id="login-title">欢迎回来。</h1><p>继续你在北外的创造。</p>
        <form onSubmit={(event) => { event.preventDefault(); void signIn(); }} aria-busy={submitting}>
          <label htmlFor="student-id">学号<input id="student-id" value={studentId} onChange={(event) => setStudentId(event.target.value)} required inputMode="numeric" pattern="[0-9]{11,12}" maxLength={12} autoComplete="username" placeholder="请输入 11 或 12 位学号" /></label>
          <label htmlFor="password">密码<input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required autoComplete="current-password" placeholder="输入密码" /></label>
          {error && <p role="alert" className="text-danger text-sm">{error}</p>}
          <button className="club-login-submit" type="submit" disabled={submitting}>{submitting ? "登录中…" : "登录工作台 ↗"}</button>
        </form>
        <p className="mt-6">仅限内部成员 · 使用你的学号和密码</p>
        {demoUsers.length > 0 && <section className="club-demo" aria-label="演示角色"><p className="meta">Demo · 快速切换角色</p>{demoUsers.map((user) => <button key={user.id} disabled={submitting} onClick={() => void signIn(user.id)}>{user.name} · {user.department} · {ROLE_LABEL[user.role]}</button>)}</section>}
      </section>
    </main>
  </div>;
}
