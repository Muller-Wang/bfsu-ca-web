"use client";

import Link from "next/link";
import Image from "next/image";
import { ParticleCanvas } from "@/components/ui/ParticleCanvas";

const STATS = [
  { num: "30+", label: "场跨语种活动 / 年" },
  { num: "5,000+", label: "覆盖全校人次" },
  { num: "6", label: "职能部门" },
  { num: "2014", label: "成立年份" },
];

const BENTO_SMALL = [
  {
    zh: "外联拓展",
    body: "兄弟社团、企业赞助、基金会与政府单位——为创意寻找资源，让好想法落地。",
  },
  {
    zh: "内容创作",
    body: "公众号、多语种内容、创意写作——以内容传递跨文化视野。",
  },
];

const DEPTS = ["秘书处", "外联部", "学术部", "宣传部", "日语部", "德语部"];

/* Bento card shell */
function Card({ dark = false, children, style }: { dark?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        borderRadius: 28,
        padding: "42px 44px",
        height: "100%",
        boxSizing: "border-box",
        background: dark ? "var(--ink)" : "var(--surface)",
        color: dark ? "var(--on-dark)" : "var(--ink)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-xs)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Nav ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "color-mix(in srgb, var(--surface) 75%, transparent)",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          borderBottom: "1px solid var(--line-faint)",
        }}
      >
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 22px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#top" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)", textDecoration: "none" }}>
            创协
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {[["工作", "#work"], ["部门", "#depts"], ["加入", "#join"]].map(([zh, href]) => (
              <a
                key={href}
                href={href}
                style={{ fontSize: 13, color: "var(--ink-soft)", textDecoration: "none", transition: "color 120ms var(--ease-out)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-soft)")}
              >
                {zh}
              </a>
            ))}
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
                transition: "opacity 120ms",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              登录
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        id="top"
        style={{ position: "relative", textAlign: "center", padding: "132px 24px 122px", background: "var(--paper)" }}
      >
        <ParticleCanvas />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-soft)", marginBottom: 20 }}>
            北京外国语大学创意协会 · Est. 2014
          </div>
          <h1
            style={{
              fontSize: "clamp(56px, 9vw, 90px)",
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.04,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            创意，在北外。
          </h1>
          <p
            style={{
              fontSize: "clamp(17px, 2vw, 24px)",
              lineHeight: 1.5,
              letterSpacing: "-0.01em",
              color: "var(--ink-soft)",
              maxWidth: 600,
              margin: "26px auto 0",
            }}
          >
            以跨文化交流为底色，以内容创意为驱动。
            <br />
            策划活动、联结资源、推动创意落地。
          </p>
          <div style={{ marginTop: 42, display: "flex", justifyContent: "center", alignItems: "center", gap: 24 }}>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "2.8rem",
                padding: "0 1.8rem",
                fontSize: 17,
                fontWeight: 500,
                color: "#fff",
                background: "var(--ink)",
                borderRadius: 999,
                textDecoration: "none",
                transition: "opacity 150ms",
              }}
            >
              进入系统
            </Link>
            <a
              href="#work"
              style={{ fontSize: 17, color: "var(--ink-soft)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              了解更多 ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: "var(--surface)", padding: "92px 24px" }}>
        <div
          style={{
            maxWidth: 1024,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            textAlign: "center",
          }}
        >
          {STATS.map(({ num, label }, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  color: "var(--ink)",
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {num}
              </div>
              <div style={{ marginTop: 12, fontSize: 14, color: "var(--ink-soft)" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bento ── */}
      <section id="work" style={{ background: "var(--paper)", padding: "112px 24px" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              我们的工作。
            </h2>
            <p style={{ fontSize: 19, color: "var(--ink-soft)", margin: "16px auto 0", maxWidth: 520 }}>
              每年 30+ 场活动背后，是三件持续在做的事。
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18 }}>
            {/* Large card — 活动策划 */}
            <div style={{ gridColumn: "span 4" }}>
              <Card style={{ minHeight: 250 }}>
                <h3 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 12px", color: "var(--ink)" }}>
                  活动策划
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0, maxWidth: 380 }}>
                  英语角、读书会、文化沙龙、节日庆典——每年 30+ 场跨语种活动，覆盖全校 5000+ 人次。
                </p>
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: 18,
                    bottom: -34,
                    fontSize: 168,
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                    color: "var(--paper-sunken)",
                    userSelect: "none",
                  }}
                >
                  30+
                </div>
              </Card>
            </div>

            {/* Small cards */}
            {BENTO_SMALL.map((item, i) => (
              <div key={i} style={{ gridColumn: i === 0 ? "span 2" : "span 2" }}>
                <Card style={{ minHeight: 250 }}>
                  <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 10px", color: "var(--ink)" }}>
                    {item.zh}
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0 }}>{item.body}</p>
                </Card>
              </div>
            ))}

            {/* Dark card — departments */}
            <div id="depts" style={{ gridColumn: "span 4" }}>
              <Card dark style={{ minHeight: 230, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, color: "var(--on-dark)" }}>
                  六个部门，一种语言：创意。
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
                  {DEPTS.map((d) => (
                    <span
                      key={d}
                      style={{
                        fontSize: 14,
                        color: "var(--on-dark-soft)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 999,
                        padding: "8px 18px",
                        transition: "color 120ms, border-color 120ms",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#fff";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.5)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--on-dark-soft)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="join" style={{ background: "var(--surface)", padding: "118px 24px", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "clamp(36px, 5vw, 52px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            margin: 0,
          }}
        >
          成员登录系统。
        </h2>
        <p style={{ fontSize: 19, color: "var(--ink-soft)", margin: "16px auto 0", maxWidth: 460 }}>
          任务、活动、资料库与学时——一处管理创协所有内部事务。
        </p>
        <div style={{ marginTop: 38 }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "2.8rem",
              padding: "0 1.9rem",
              fontSize: 17,
              fontWeight: 500,
              color: "#fff",
              background: "var(--ink)",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            登录系统
          </Link>
        </div>
        <div style={{ marginTop: 18, fontSize: 13, color: "var(--ink-mute)" }}>学号登录 · 仅内部成员</div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--paper)", borderTop: "1px solid var(--line-faint)" }}>
        <div
          style={{
            maxWidth: 1024,
            margin: "0 auto",
            padding: "28px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image
              src="/bfsu-badge.png"
              alt="BFSU"
              width={32}
              height={32}
              style={{ objectFit: "contain", opacity: 0.5 }}
            />
            <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>
              北外创协 · BFSU Creative Association · Est. 2014
            </span>
          </div>
          <a href="#top" style={{ fontSize: 12, color: "var(--ink-soft)", textDecoration: "none" }}>
            返回顶部
          </a>
        </div>
      </footer>
    </div>
  );
}
