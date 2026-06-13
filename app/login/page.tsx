"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div style={{ minHeight: "100vh", display: "flex" }}>
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
            BFSU Creative Association
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
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
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
                placeholder="23110301001"
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
              <div style={{ fontSize: 14, color: "var(--color-danger)" }}>{error}</div>
            )}

            <button
              type="submit"
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
              登 录
            </button>
          </form>

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
              {USERS.slice(0, 5).map((u) => (
                <button
                  key={u.id}
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
        </div>
      </main>
    </div>
  );
}
