"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import { ROLE_LABEL } from "@/lib/types";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  useEffect(() => {
    const presentation = new URLSearchParams(window.location.search).get("presentation") === "1";
    if (!presentation) return;
    api<{ demoEnabled: boolean; demoUsers: User[] }>("/api/config?presentation=1")
      .then((result) => setDemoUsers(result.demoEnabled ? result.demoUsers : []))
      .catch(() => setDemoUsers([]));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ id: studentId.trim(), password }),
      });
      // A full navigation refreshes the shell's independently loaded session state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "学号或密码错误");
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (id: string) => {
    setError("");
    setSubmitting(true);
    try {
      await api<{ user: User }>("/api/auth/demo", { method: "POST", body: JSON.stringify({ id }) });
      // A full navigation refreshes the shell's independently loaded session state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "演示登录失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left — ink panel */}
      <aside
        style={{
          display: "none",
          width: "50%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 56px",
          background: "var(--ink)",
          color: "var(--on-dark)",
          position: "relative",
          overflow: "hidden",
        }}
        className="md:flex"
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--on-dark-soft)",
              marginBottom: 56,
            }}
          >
            Beijing Foreign Studies University
          </div>
          <h1
            style={{
              fontSize: "clamp(40px, 5vw, 68px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.04,
              color: "#fff",
              margin: 0,
            }}
          >
            创意，
            <br />
            在北外。
          </h1>
          <p
            style={{
              marginTop: 24,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--on-dark-soft)",
              maxWidth: 340,
            }}
          >
            内网与管理系统——策划、申报、归档、日程安排，一处搞定。
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Image
            src="/bfsu-badge.png"
            alt="BFSU"
            width={36}
            height={36}
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.45 }}
          />
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            BFSU Makers Club
            <br />
            Est. 2014 · Internal System
          </div>
        </div>

        {/* Decorative watermark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -40,
            bottom: -60,
            fontSize: 220,
            fontWeight: 700,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            color: "rgba(255,255,255,0.04)",
            userSelect: "none",
            fontFamily: "var(--font-sans)",
          }}
        >
          创
        </div>
      </aside>

      {/* Right — form */}
      <main
        className="px-5 py-10 sm:px-10 sm:py-12"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--ink-mute)",
              marginBottom: 16,
            }}
          >
            Sign in · 登录
          </div>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              margin: "0 0 8px",
            }}
          >
            欢迎回来。
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", marginBottom: 40 }}>使用学号和密码登录系统</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--ink-mute)",
                  marginBottom: 10,
                }}
              >
                学号 / Student ID
              </label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                inputMode="numeric"
                pattern="[0-9]{11,12}"
                maxLength={12}
                style={{
                  width: "100%",
                  background: "transparent",
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: 10,
                  outline: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: 17,
                  color: "var(--ink)",
                  transition: "border-color 150ms",
                  boxSizing: "border-box",
                }}
                placeholder="请输入 11 或 12 位学号"
                autoComplete="username"
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--ink-mute)",
                  marginBottom: 10,
                }}
              >
                密码 / Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                style={{
                  width: "100%",
                  background: "transparent",
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: 10,
                  outline: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: 17,
                  color: "var(--ink)",
                  transition: "border-color 150ms",
                  boxSizing: "border-box",
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
              />
            </div>

            {error && (
              <div role="alert" aria-live="polite" style={{ fontSize: 14, color: "var(--color-danger)" }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 8,
                height: "2.8rem",
                padding: "0 1.5rem",
                fontSize: 15,
                fontWeight: 500,
                color: "#fff",
                background: "var(--ink)",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "opacity 150ms",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              {submitting ? "登录中…" : "登 录"}
            </button>
          </form>

          {/* 仅 DEMO_MODE=1 且显式进入 /login?presentation=1 时渲染。 */}
          {demoUsers.length > 0 && (
          <div
            style={{
              marginTop: 40,
              paddingTop: 28,
              borderTop: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                marginBottom: 14,
              }}
            >
              Demo · 快速切换角色
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => quickLogin(u.id)}
                  style={{
                    textAlign: "left",
                    padding: "10px 16px",
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 14,
                    color: "var(--ink)",
                    transition: "border-color 120ms",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--line)")}
                >
                  <span>
                    {u.name}
                    <span style={{ color: "var(--ink-mute)", marginLeft: 8, fontSize: 12 }}>{u.department}</span>
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--ink-mute)",
                    }}
                  >
                    {ROLE_LABEL[u.role]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
