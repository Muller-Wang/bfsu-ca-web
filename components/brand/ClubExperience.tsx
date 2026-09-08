"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClubBrand, ClubLogo } from "./ClubBrand";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import s from "@/app/revised/revised.module.css";

type View = "cover" | "workspace" | "login";
type Language = "zh" | "en";
const viewLabels: Record<Language, { id: View; label: string }[]> = {
  zh: [{ id: "cover", label: "封面" }, { id: "workspace", label: "工作台" }, { id: "login", label: "登录" }],
  en: [{ id: "cover", label: "Cover" }, { id: "workspace", label: "Workspace" }, { id: "login", label: "Login" }],
};
const schedule = {
  zh: [
    { day: "07", week: "周一", title: "把新学期，变成新可能。", name: "新学期创意碰头会", time: "19:00 — 20:30", place: "创客空间 · 讨论区", type: "内部交流" },
    { day: "08", week: "周二", title: "从一句想法，到一次行动。", name: "活动策划工作坊", time: "18:30 — 20:00", place: "创客空间 · 工作区", type: "共创工作坊" },
    { day: "09", week: "周三", title: "让不同的语言，在这里相遇。", name: "多语种文化沙龙", time: "19:00 — 20:30", place: "校园公共空间", type: "文化交流" },
    { day: "10", week: "周四", title: "留一点空白，给下一个好点子。", name: "自由共创时间", time: "16:00 — 18:00", place: "创客空间 · 开放区", type: "开放共创" },
    { day: "11", week: "周五", title: "把这一周的灵感，好好留下。", name: "本周项目分享", time: "19:00 — 20:00", place: "创客空间 · 讨论区", type: "项目分享" },
  ],
  en: [
    { day: "07", week: "MON", title: "Turn a new semester into new possibilities.", name: "New Semester Ideas Meetup", time: "19:00 — 20:30", place: "Maker Space · Forum", type: "Community" },
    { day: "08", week: "TUE", title: "From one thought to one real action.", name: "Event Planning Workshop", time: "18:30 — 20:00", place: "Maker Space · Studio", type: "Workshop" },
    { day: "09", week: "WED", title: "Where different languages meet.", name: "Multilingual Culture Salon", time: "19:00 — 20:30", place: "Campus Commons", type: "Culture" },
    { day: "10", week: "THU", title: "Leave room for the next good idea.", name: "Open Making Hours", time: "16:00 — 18:00", place: "Maker Space · Open Area", type: "Open Studio" },
    { day: "11", week: "FRI", title: "Give this week’s inspiration a home.", name: "Weekly Project Showcase", time: "19:00 — 20:00", place: "Maker Space · Forum", type: "Showcase" },
  ],
};

function Mark({ small = false }: { small?: boolean }) {
  return <ClubLogo size={small ? 42 : 52} />;
}

export function Composition({ compact = false, language = "zh" }: { compact?: boolean; language?: Language }) {
  const [replay, setReplay] = useState(0);
  return <div className={`${s.art} ${compact ? s.compactArt : ""}`}>
    <div className={s.artCaption}><span>FORM FOLLOWS IDEAS</span><span>{language === "zh" ? "构成 · 01" : "COMPOSITION · 01"}</span></div>
    <div className={s.geometry} key={replay} aria-hidden="true">
      <div className={`${s.shapeSlot} ${s.redSlot}`}><div className={s.redDisc} /></div>
      <div className={`${s.shapeSlot} ${s.archSlot}`}><div className={s.arch} /></div>
      <div className={`${s.shapeSlot} ${s.stripesSlot}`}><div className={s.stripes} /></div>
      <div className={`${s.shapeSlot} ${s.quarterSlot}`}><div className={s.halfDisc} /></div>
      <div className={`${s.shapeSlot} ${s.pinSlot}`}><div className={s.pin} /></div>
      <span className={s.cross}>+</span><span className={s.axis}>B / F / S / U</span>
    </div>
    <div className={s.artFoot}><span>{language === "zh" ? "不同的形状，共同的方向。" : "Different forms. One direction."}</span><button onClick={() => setReplay((v) => v + 1)} aria-label={language === "zh" ? "重播几何动效" : "Replay geometric motion"}>{language === "zh" ? "重新构成" : "Replay"} ↻</button></div>
  </div>;
}

export default function ClubExperience({ preview = false }: { preview?: boolean }) {
  const router = useRouter();
  const [view, setView] = useState<View>("cover");
  const [calm, setCalm] = useState(false);
  const [language, setLanguage] = useState<Language>("zh");
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);
  return <MotionConfig reducedMotion={calm ? "always" : "user"}>
    <div className={`${s.root} ${calm ? s.calm : ""}`} lang={language === "zh" ? "zh-CN" : "en"}>
      <a className={s.skip} href="#revision-content">{language === "zh" ? "跳到内容" : "Skip to content"}</a>
      {preview && <div className={s.previewBar}><span><i /> {language === "zh" ? "再版设计参考" : "REDESIGN STUDY"} <b>02</b></span><Link href="/">{language === "zh" ? "正式首页" : "Live homepage"} ↗</Link></div>}
      <header className={s.header}>
        <button className={s.brand} onClick={() => setView("cover")} aria-label={language === "zh" ? "返回封面" : "Return to cover"}><ClubBrand /></button>
        {preview ? <nav className={s.switcher} aria-label="参考页面">
          {viewLabels[language].map((item) => <button key={item.id} aria-pressed={view === item.id} onClick={() => setView(item.id)}>{view === item.id && <motion.span layoutId="view-indicator" className={s.tabIndicator} transition={{ type: "spring", stiffness: 420, damping: 36 }} />}<span>{item.label}</span></button>)}
        </nav> : <nav className="club-public-nav" aria-label={language === "zh" ? "主导航" : "Primary navigation"}><a href="#practice">{language === "zh" ? "我们在做什么" : "What we do"}</a><Link href="/dashboard">{language === "zh" ? "工作台" : "Workspace"} ↗</Link><Link href="/login">{language === "zh" ? "成员登录" : "Member login"}</Link></nav>}
        <div className={s.headerTools}>
          <button className={s.languageToggle} onClick={() => setLanguage((value) => value === "zh" ? "en" : "zh")} aria-label={language === "zh" ? "Switch to English" : "切换到中文"}>{language === "zh" ? "EN" : "中文"}</button>
          <button className={s.motionToggle} aria-pressed={calm} onClick={() => setCalm(!calm)}>{calm ? (language === "zh" ? "开启动效" : "Motion on") : (language === "zh" ? "静态浏览" : "Still mode")}<span aria-hidden="true">{calm ? "◯" : "◉"}</span></button>
        </div>
      </header>
      <main id="revision-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .24 }}>
            {view === "cover" ? <Cover language={language} onEnter={() => preview ? setView("workspace") : router.push("/dashboard")} /> : view === "workspace" ? <Workspace language={language} /> : <Login language={language} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className={s.footer}><span>{language === "zh" ? "北外创客俱乐部" : "BFSU Makers Club"}</span><span>{language === "zh" ? "一起，把想法变成作品。" : "Together, we turn ideas into things."}</span><span>{preview ? "DESIGN STUDY / 02" : "BFSU MAKERS CLUB"}</span></footer>
    </div>
  </MotionConfig>;
}

function Cover({ onEnter, language }: { onEnter: () => void; language: Language }) {
  const practices = language === "zh" ? [
    { number: "01", shape: "circle", title: "一起策划", en: "Gather", text: "文化沙龙、读书会、校园活动，让相遇真正发生。" },
    { number: "02", shape: "square", title: "一起创造", en: "Make", text: "把文字、影像与多语种表达，变成有温度的作品。" },
    { number: "03", shape: "triangle", title: "一起联结", en: "Connect", text: "走向社团与更大的世界，为好想法找到同行的人。" },
  ] : [
    { number: "01", shape: "circle", title: "Gather", en: "Together", text: "Salons, reading groups and campus events that turn meetings into real connections." },
    { number: "02", shape: "square", title: "Make", en: "Together", text: "Shape words, images and multilingual expression into work with warmth." },
    { number: "03", shape: "triangle", title: "Connect", en: "Together", text: "Reach across campus and beyond, finding collaborators for ideas worth making." },
  ];
  return <>
    <section className={s.hero}>
      <div className={s.heroCopy}>
        <p className={s.eyebrow}><span className={s.redLine} /> {language === "zh" ? "北京外国语大学 · 创客俱乐部" : "BEIJING FOREIGN STUDIES UNIVERSITY · MAKERS CLUB"}</p>
        <h1>{language === "zh" ? <>创意，<br />在北外</> : <>Ideas,<br />made at BFSU</>}<span className={s.redText}>.</span></h1>
        <p className={s.heroDescription}>{language === "zh" ? <>让不同的语言与想法相遇。<br />一起策划、创造，把好奇变成行动。</> : <>Where languages and ideas meet.<br />We gather, make, and turn curiosity into action.</>}</p>
        <div className={s.heroActions}><button className={s.primary} onClick={onEnter}>{language === "zh" ? "探索工作台" : "Explore workspace"} <span>↗</span></button><a href="#practice" className={s.textLink}>{language === "zh" ? "认识我们" : "Meet the club"} <span>↓</span></a></div>
        <div className={s.heroFoot}><span>THINK. MAKE. CONNECT.</span><span>{language === "zh" ? "从一个点子开始。" : "It starts with an idea."}</span></div>
      </div>
      <Composition language={language} />
    </section>
    <section className={s.practice} id="practice">
      <div className={s.sectionIntro}><p className={s.eyebrow}>01 / {language === "zh" ? "我们在做什么" : "WHAT WE DO"}</p><h2>{language === "zh" ? "创造，有很多种形状。" : "Making takes many forms."}</h2><p>{language === "zh" ? <>从一次对话，到一个项目。<br />每一种热爱，都能在这里找到位置。</> : <>From a conversation to a working project.<br />Every curiosity can find its place here.</>}</p></div>
      <div className={s.practiceList}>
        {practices.map((item) => <motion.article key={item.number} className={s.practiceRow} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .5 }}><span className={s.rowNumber}>{item.number}</span><i className={s[item.shape]} /><div><h3>{item.title}<span>{item.en}</span></h3><p>{item.text}</p></div><span className={s.rowArrow} aria-hidden="true">↗</span></motion.article>)}
      </div>
    </section>
    <section className={s.departments}><p className={s.eyebrow}>02 / {language === "zh" ? "在一起，才完整" : "WHOLE, TOGETHER"}</p><div><h2>{language === "zh" ? <>三个部门。<br />一种共同的创造力。</> : <>Three departments.<br />One shared creative force.</>}</h2><p>{language === "zh" ? <>项目部 / 宣传部 / 办公室</> : <>Projects / Communications / Office</>}</p></div><button className={s.textLink} onClick={onEnter}>{language === "zh" ? "打开我们的工作台" : "Open our workspace"} <span>↗</span></button></section>
  </>;
}

function Workspace({ language }: { language: Language }) {
  const en = language === "en";
  const [day, setDay] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("全部");
  const tasks = en
    ? [{ title: "Organize ideas for the new semester", dept: "Office", date: "09.07", type: "Planning" }, { title: "Confirm the first weekly meeting", dept: "Office", date: "09.08", type: "Teamwork" }, { title: "Review the recruitment copy", dept: "Communications", date: "09.11", type: "Content" }]
    : [{ title: "整理新学期活动想法", dept: "办公室", date: "09.07", type: "策划" }, { title: "确认第一次例会安排", dept: "办公室", date: "09.08", type: "协作" }, { title: "审阅社团招新文案", dept: "宣传部", date: "09.11", type: "内容" }];
  const week = schedule[language];
  const filters = en ? ["All", "Planning", "Teamwork", "Content"] : ["全部", "策划", "协作", "内容"];
  const activeFilter = filters.includes(filter) ? filter : filters[0];
  const selected = week[day];
  return <section className={s.workspace}>
    <div className={s.workspaceHeading}><div><p className={s.eyebrow}>{en ? "MY WORKSPACE" : "我的工作台"} <span className={s.sample}>{en ? "SAMPLE" : "示例内容"}</span></p><h1>{en ? "Make today count for good ideas." : "把今天，留给好想法。"}</h1><p>{en ? "Events, tasks and inspiration—organized in one place." : "活动、任务与灵感，在这里有序发生。"}</p></div><div className={s.dateBlock}><span>SEPTEMBER</span><strong>2026<span> / 09</span></strong></div></div>
    <div className={s.workspaceGrid}>
      <div>
        <section className={s.agenda} aria-label="日程预览">
          <div className={s.sectionTop}><h2>{en ? "This week" : "这一周"}</h2><span>09.07 — 09.11</span></div>
          <div className={s.week}>{week.map((item, index) => <button key={item.day} aria-pressed={day === index} onClick={() => setDay(index)} className={day === index ? s.selectedDay : ""}><span>{item.week}</span><strong>{item.day}</strong><i /></button>)}</div>
          <AnimatePresence mode="wait"><motion.div key={day} className={s.featureEvent} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}><div><span className={s.eventCategory}>{selected.type}</span><h3>{selected.title}</h3><p>{selected.name}</p><div className={s.eventDetails}><span>{selected.time}</span><span>{selected.place}</span></div></div><div className={s.miniGeometry} aria-hidden="true"><i /><i /></div></motion.div></AnimatePresence>
        </section>
        <section className={s.tasks}><div className={s.sectionTop}><h2>{en ? "To do" : "待办事项"} <span>{tasks.length - completed.length}</span></h2><div className={s.filters}>{filters.map((item) => <button key={item} onClick={() => setFilter(item)} aria-pressed={activeFilter === item}>{item}</button>)}</div></div>{tasks.map((task, index) => (activeFilter === filters[0] || activeFilter === task.type) && <div key={task.title} className={`${s.taskRow} ${completed.includes(index) ? s.done : ""}`}><button className={s.check} aria-label={`${completed.includes(index) ? (en ? "Restore" : "恢复") : (en ? "Complete" : "完成")}：${task.title}`} aria-pressed={completed.includes(index)} onClick={() => setCompleted((current) => current.includes(index) ? current.filter((n) => n !== index) : [...current, index])}>{completed.includes(index) ? "✓" : ""}</button><div><h3>{task.title}</h3><span>{task.dept} · {task.type}</span></div><time>{task.date}</time></div>)}</section>
      </div>
      <aside className={s.rightRail}>
        <section className={s.notice}><div className={s.sectionTop}><h2>{en ? "Club notice" : "社团公告"}</h2><span className={s.redText}>●</span></div><span className={s.eyebrow}>{en ? "NEW SEMESTER / NEW BEGINNINGS" : "新学期 / NEW BEGINNINGS"}</span><h3>{en ? <>A new semester<br />starts with meeting.</> : <>新的学期，<br />从一次见面开始。</>}</h3><p>{en ? "Bring an idea to our first creative meetup of the semester." : "带上你的想法，来参加新学期第一次创意碰头会。"}</p>{expanded && <p className={s.noticeMore}>{en ? "We will trade ideas for the semester and find collaborators. Bring a short, informal pitch in any format." : "我们会一起交流新学期想做的活动，寻找协作伙伴。欢迎准备一段简短的想法分享，形式不限。"}</p>}<button className={s.textLink} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? (en ? "Close notice" : "收起公告") : (en ? "Read notice" : "阅读公告")}<span>{expanded ? "−" : "↗"}</span></button></section>
        <section className={s.shortcut}><h2>{en ? "Shortcuts" : "常用入口"}</h2>{(en ? [{ title: "Task board", en: "Tasks", url: "/tasks" }, { title: "Files & templates", en: "Library", url: "/library" }, { title: "Idea bank", en: "Ideas", url: "/ideas" }] : [{ title: "任务看板", en: "Tasks", url: "/tasks" }, { title: "资料与模板", en: "Library", url: "/library" }, { title: "创意点子库", en: "Ideas", url: "/ideas" }]).map((item) => <Link key={item.url} href={item.url}><span>{item.title}<small>{item.en}</small></span><span>↗</span></Link>)}<p>{en ? "Sign-in is required for the live system" : "进入现有系统需登录"}</p></section>
      </aside>
    </div>
    <p className={s.previewNote}>{en ? "Schedules and tasks on this page are design samples. Interactions do not change club data." : "本页日程与任务用于设计演示；勾选、筛选与切换不会修改社团数据。"}</p>
  </section>;
}

function Login({ language }: { language: Language }) {
  const en = language === "en";
  return <section className={s.loginLayout}>
    <div className={s.loginArtwork}><Composition compact language={language} /><div className={s.loginMotto}><h2>{en ? <>Every good idea<br />starts here.</> : <>每一个好想法，<br />都从这里开始。</>}</h2><span>BFSU MAKERS CLUB</span></div></div>
    <div className={s.loginForm}><Mark small /><p className={s.eyebrow}>{en ? "MEMBER ACCESS" : "MEMBERS / 成员入口"}</p><h1>{en ? "Welcome back." : "欢迎回来。"}</h1><p>{en ? "Keep making at BFSU." : "继续你在北外的创造。"}</p><form onSubmit={(event) => event.preventDefault()} aria-label={en ? "Login design preview" : "登录样式预览"}><label>{en ? "Student ID" : "学号"}<input autoComplete="off" placeholder={en ? "Your student ID" : "你的学号"} inputMode="numeric" /></label><label>{en ? "Password" : "密码"}<input autoComplete="off" type="password" placeholder={en ? "Enter password" : "输入密码"} /></label><Link className={s.primary} href="/login">{en ? "Open live login" : "前往现版登录"} <span>↗</span></Link></form><p className={s.loginNote}>{en ? "Login interface study. Use your account on the live login page." : "登录界面设计参考。请前往现版登录页使用你的账号。"}</p></div>
  </section>;
}
