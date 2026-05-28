import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Navigation bar */}
      <nav className="border-b rule">
        <div className="max-w-6xl mx-auto px-10 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="display text-xl text-accent">创协</span>
            <span className="meta text-xs">BFSU CREATIVE ASSOCIATION</span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 border rule hover:border-ink hover:text-accent transition-colors text-sm"
          >
            系统登录 →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-10 pt-28 pb-20">
        <div className="max-w-2xl">
          <div className="meta text-xs mb-4">EST. 2014 · BEIJING FOREIGN STUDIES UNIVERSITY</div>
          <h1 className="display text-[clamp(3rem,7vw,6rem)] leading-[0.95]">
            北外创协
            <br />
            <span className="text-accent italic font-serif">Creative</span>
            <br />
            Association
          </h1>
          <p className="mt-8 text-lg text-ink-soft max-w-lg leading-relaxed">
            北京外国语大学创意协会，成立于 2014 年。以跨文化交流为底色，以内容创意为驱动——策划活动、联结资源、推动创意落地。
          </p>
          <div className="flex items-center gap-4 mt-10">
            <Link
              href="/login"
              className="px-8 py-4 bg-accent text-card hover:bg-accent-soft transition-colors text-sm tracking-[0.2em]"
            >
              进入系统
            </Link>
            <span className="text-sm text-ink-soft">学号登录 · 仅内部成员</span>
          </div>
        </div>
      </section>

      <hr className="border-t rule max-w-6xl mx-10" />

      {/* What we do */}
      <section className="max-w-6xl mx-auto px-10 py-20">
        <div className="meta text-xs mb-6">WHAT WE DO · 我们的工作</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: "01",
              title: "活动策划",
              en: "Events",
              desc: "英语角、读书会、文化沙龙、节日庆典——每年 30+ 场跨语种活动，覆盖全校 5000+ 人次。",
            },
            {
              num: "02",
              title: "外联拓展",
              en: "Outreach",
              desc: "连接兄弟社团、企业赞助、基金会与政府单位，为创意寻找资源，让好想法落地。",
            },
            {
              num: "03",
              title: "内容创作",
              en: "Content",
              desc: "公众号运营、多语种内容创作、创意写作——以内容为媒介，传递跨文化视野。",
            },
          ].map((item) => (
            <div key={item.num} className="border-l rule pl-5">
              <div className="meta text-xs">{item.num}</div>
              <h3 className="display text-2xl mt-3">{item.title}</h3>
              <div className="meta italic font-serif text-sm normal-case tracking-normal mt-0.5">{item.en}</div>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-t rule max-w-6xl mx-10" />

      {/* Departments */}
      <section className="max-w-6xl mx-auto px-10 py-20">
        <div className="meta text-xs mb-6">DEPARTMENTS · 部门设置</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { dept: "秘书处", en: "Secretariat", desc: "学时管理、行政统筹、成员事务" },
            { dept: "外联部", en: "Outreach Dept.", desc: "企业赞助、校际合作、资源对接" },
            { dept: "学术部", en: "Academic Dept.", desc: "读书会、课程设计、学术内容" },
            { dept: "宣传部", en: "Media Dept.", desc: "公众号、视觉设计、品牌传播" },
          ].map((d) => (
            <div key={d.dept} className="border rule p-5 bg-card hover:border-ink/40 transition-colors">
              <h3 className="display text-xl">{d.dept}</h3>
              <div className="meta italic font-serif text-xs normal-case tracking-normal mt-0.5">{d.en}</div>
              <p className="mt-3 text-xs text-ink-soft leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
        <p className="meta mt-4 text-xs">
          另设有日语部 · 德语部，专注于日本与德语国家文化活动的策划与执行
        </p>
      </section>

      <hr className="border-t rule max-w-6xl mx-10" />

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-10 py-24 text-center">
        <div className="meta text-xs mb-4">JOIN THE SYSTEM · 内部入口</div>
        <h2 className="display text-4xl md:text-5xl mb-6">成员登录系统</h2>
        <p className="text-ink-soft max-w-md mx-auto leading-relaxed text-sm">
          使用学号与密码登录内网，查看任务、管理活动、下载模板、跟踪外联进度。
        </p>
        <Link
          href="/login"
          className="inline-block mt-8 px-10 py-4 bg-accent text-card hover:bg-accent-soft transition-colors text-sm tracking-[0.2em]"
        >
          登录系统
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t rule px-10 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="meta text-[10px] leading-relaxed">
            BFSU CREATIVE ASSOCIATION
            <br />
            EST. 2014 · BEIJING FOREIGN STUDIES UNIVERSITY
            <br />
            INTERNAL SYSTEM v0.1
          </div>
          <Link href="/login" className="text-sm border-b rule hover:border-ink transition-colors">
            系统登录
          </Link>
        </div>
      </footer>
    </div>
  );
}
