import Link from "next/link";
import Image from "next/image";

function BauhausMark({ size = 320 }: { size?: number }) {
  const u = size / 4;
  return (
    <div style={{ position: "relative", width: size, height: size }} aria-hidden>
      <div style={{ position: "absolute", left: 0, top: u, width: u * 2, height: u * 2, background: "#282270" }} />
      <div style={{ position: "absolute", left: u * 1.5, top: 0, width: u * 2, height: u * 2, borderRadius: 999, background: "#F4B81E" }} />
      <div style={{ position: "absolute", right: 0, bottom: u * 0.5, width: u * 2, height: u * 2, background: "#C0392B", borderTopLeftRadius: u * 2 }} />
      <div style={{ position: "absolute", left: u * 0.5, bottom: u * 0.25, width: u * 3, height: 2, background: "#1B1A18" }} />
      <div style={{ position: "absolute", right: u * 0.4, top: u * 0.2, width: u * 0.9, height: u * 0.9, borderRadius: 999, border: "2px solid #1B1A18" }} />
    </div>
  );
}

const STATS = [
  { num: "30+", label: "场跨语种活动 / 年" },
  { num: "5000+", label: "覆盖全校人次" },
  { num: "6", label: "职能部门" },
  { num: "2014", label: "成立年份" },
];

const WORK_ITEMS = [
  {
    no: "01",
    zh: "活动策划",
    en: "Events",
    desc: "英语角、读书会、文化沙龙、节日庆典——每年 30+ 场跨语种活动，覆盖全校 5000+ 人次。",
  },
  {
    no: "02",
    zh: "外联拓展",
    en: "Outreach",
    desc: "连接兄弟社团、企业赞助、基金会与政府单位，为创意寻找资源，让好想法落地。",
  },
  {
    no: "03",
    zh: "内容创作",
    en: "Content",
    desc: "公众号运营、多语种内容创作、创意写作——以内容为媒介，传递跨文化视野。",
  },
];

const DEPTS = [
  { zh: "秘书处", en: "Secretariat", desc: "学时管理、行政统筹、成员事务", dot: "var(--color-cat-green)" },
  { zh: "外联部", en: "Outreach Dept.", desc: "企业赞助、校际合作、资源对接", dot: "var(--color-cat-blue)" },
  { zh: "学术部", en: "Academic Dept.", desc: "读书会、课程设计、学术内容", dot: "var(--color-cat-violet)" },
  { zh: "宣传部", en: "Media Dept.", desc: "公众号、视觉设计、品牌传播", dot: "var(--color-cat-red)" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <header
        className="sticky top-0 z-30 border-b rule"
        style={{ background: "color-mix(in srgb, var(--color-paper) 86%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } as React.CSSProperties}
      >
        <div className="max-w-6xl mx-auto px-8 h-[68px] flex items-center justify-between">
          <a href="#top" className="flex items-baseline gap-3">
            <span className="display text-2xl">
              <span style={{ color: "var(--color-accent)" }}>创</span>协
            </span>
            <span className="meta hidden sm:inline">BFSU · Creative Association</span>
          </a>
          <nav className="flex items-center gap-7">
            {[["工作", "#work"], ["部门", "#depts"], ["关于", "#about"]].map(([zh, href]) => (
              <a key={href} href={href} className="text-sm text-ink-soft hover:text-ink transition-colors hidden md:inline">
                {zh}
              </a>
            ))}
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm text-card transition-colors rounded-[10px]"
              style={{ background: "var(--color-accent)" }}
            >
              系统登录
              <span aria-hidden className="text-xs opacity-70">→</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="max-w-6xl mx-auto px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-12 items-center">
          <div className="rise rise-1">
            <div className="meta text-xs mb-6">Est. 2014 · Beijing Foreign Studies University</div>
            <h1 className="display text-[clamp(3.5rem,7vw,5rem)] leading-[1.0]">
              北外创协
              <br />
              <span className="italic" style={{ color: "var(--color-accent)" }}>Creative</span>
              <br />
              Association
            </h1>
            <p className="mt-7 text-[17px] leading-[1.75] text-ink-soft max-w-[460px]">
              北京外国语大学创意协会。以跨文化交流为底色，以内容创意为驱动——策划活动、联结资源、推动创意落地。
            </p>
            <div className="mt-9 flex items-center gap-5">
              <Link
                href="/login"
                className="flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-card rounded-[10px] transition-colors"
                style={{ background: "var(--color-gold)", color: "#1B1A18" }}
              >
                进入系统
                <span aria-hidden className="text-xs opacity-70">→</span>
              </Link>
              <span className="meta text-[11px]" style={{ color: "var(--color-ink-mute)" }}>
                学号登录 · 仅内部成员
              </span>
            </div>
          </div>
          <div className="rise rise-3 flex justify-center">
            <BauhausMark size={300} />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-surface border-y rule">
        <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.num} className={`px-6 ${i > 0 ? "border-l rule" : ""}`}>
              <div
                className="display text-[44px]"
                style={{ color: "var(--color-accent)" }}
              >
                {s.num}
              </div>
              <div className="mt-2 text-sm text-ink-soft">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What we do */}
      <section id="work" className="max-w-6xl mx-auto px-8 py-20">
        <div className="meta text-xs mb-2" style={{ color: "var(--color-ink-mute)" }}>What we do</div>
        <h2 className="display text-4xl text-ink mb-10">我们的工作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WORK_ITEMS.map((item) => (
            <div key={item.no} className="col-rule">
              <div
                className="font-mono text-[13px] mb-4"
                style={{ color: "var(--color-gold-deep)" }}
              >
                {item.no}
              </div>
              <h3 className="text-[22px] font-semibold tracking-tight text-ink mb-1">{item.zh}</h3>
              <div className="meta mb-3">{item.en}</div>
              <p className="text-[15px] leading-[1.7] text-ink-soft">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section id="depts" className="bg-surface border-y rule">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="meta text-xs mb-2" style={{ color: "var(--color-ink-mute)" }}>Departments · 部门设置</div>
          <h2 className="display text-4xl text-ink mb-10">六个部门，一种语言：创意</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPTS.map((d) => (
              <div
                key={d.en}
                className="bg-paper border rule rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-200"
              >
                <span
                  className="dot mb-5 block"
                  style={{ color: d.dot, width: 12, height: 12 }}
                />
                <h3 className="text-[18px] font-semibold text-ink mb-0.5">{d.zh}</h3>
                <div className="meta mb-3">{d.en}</div>
                <p className="text-[13px] leading-[1.65] text-ink-soft">{d.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-ink-soft" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
            另设有日语部、德语部，专注于日本与德语国家文化活动的策划与执行。
          </p>
        </div>
      </section>

      {/* CTA — full-bleed indigo */}
      <section id="about" style={{ background: "var(--color-accent)" }}>
        <div className="max-w-6xl mx-auto px-8 py-24 text-center">
          <div
            className="meta text-xs mb-4"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Join the system · 内部入口
          </div>
          <h2
            className="display text-[clamp(2.5rem,5vw,3.5rem)] max-w-xl mx-auto leading-[1.1]"
            style={{ color: "#fff" }}
          >
            成员登录系统
          </h2>
          <p
            className="mt-5 text-base leading-[1.75] max-w-[480px] mx-auto"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            使用学号与密码登录内网，查看任务、管理活动、下载模板、跟踪外联进度。
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 text-sm font-medium rounded-[10px] transition-opacity hover:opacity-90"
            style={{ background: "var(--color-gold)", color: "#1B1A18" }}
          >
            登录系统
            <span aria-hidden className="text-xs opacity-70">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-paper border-t rule">
        <div className="max-w-6xl mx-auto px-8 py-8 flex items-end justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <Image
              src="/bfsu-badge.png"
              alt="BFSU"
              width={48}
              height={48}
              className="object-contain"
            />
            <div
              className="font-mono leading-[1.8] tracking-wide uppercase"
              style={{ fontSize: 11, color: "var(--color-ink-mute)" }}
            >
              BFSU Creative Association
              <br />
              Est. 2014 · Beijing Foreign Studies University
              <br />
              Internal System v0.1
            </div>
          </div>
          <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">
            系统登录 →
          </Link>
        </div>
      </footer>
    </div>
  );
}
