"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { getStoredUser } from "@/lib/auth";
import { ARCHIVE, TASKS, TEMPLATES } from "@/lib/mock/data";
import { ROLE_LABEL, TASK_STATUS_LABEL, type User } from "@/lib/types";

type Tab = "tasks" | "events" | "credits" | "files";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("tasks");

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (!user) return null;

  return (
    <div className="px-10 py-10 max-w-5xl">
      {/* Identity card */}
      <section className="rise rise-1 grid grid-cols-[auto_1fr_auto] gap-8 items-start mb-10">
        <div className="w-24 h-24 border rule grid place-items-center font-serif text-4xl text-accent bg-card">
          {user.name.slice(-1)}
        </div>
        <div>
          <div className="meta">PROFILE · 个人中心</div>
          <h1 className="display text-4xl mt-1">
            {user.name} <span className="italic text-ink-soft font-serif text-2xl">/ {user.nameEn}</span>
          </h1>
          <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <span className="meta">DEPT</span>
            <span>{user.department} · {user.title}</span>
            <span className="meta">SINCE</span>
            <span className="font-mono">{user.joinDate}</span>
            <span className="meta">ID</span>
            <span className="font-mono">{user.workNo} · {user.id}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="meta">STATUS</div>
          <div className="mt-1 inline-block px-3 py-1 border rule">
            <span className={clsx(user.role === "probation" ? "text-warn" : "text-success")}>
              {ROLE_LABEL[user.role]}
            </span>
          </div>
          {user.probationLeftDays != null && (
            <div className="meta mt-2 text-warn">预备期剩余 {user.probationLeftDays} 天</div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="rise rise-2 flex items-center gap-6 border-b rule">
        {([
          { key: "tasks", label: "我的任务", en: "TASKS" },
          { key: "events", label: "我的活动", en: "EVENTS" },
          { key: "credits", label: "学时记录", en: "CREDITS" },
          { key: "files", label: "我上传的文件", en: "FILES" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "pb-3 flex items-baseline gap-2 -mb-px border-b-2",
              tab === t.key ? "border-accent text-ink" : "border-transparent text-ink-soft hover:text-ink"
            )}
          >
            <span className="text-base">{t.label}</span>
            <span className="meta">{t.en}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 rise rise-3">
        {tab === "tasks" && <MyTasks userId={user.id} />}
        {tab === "events" && <MyEvents />}
        {tab === "credits" && <MyCredits />}
        {tab === "files" && <MyFiles />}
      </div>
    </div>
  );
}

function MyTasks({ userId }: { userId: string }) {
  const mine = TASKS.filter((t) => t.assignee === userId);
  const doing = mine.filter((t) => t.status === "doing" || t.status === "todo");
  const done = mine.filter((t) => t.status === "done" || t.status === "review");

  return (
    <div className="space-y-10">
      <div>
        <h3 className="display text-xl mb-4">▸ 进行中 <span className="meta">({doing.length})</span></h3>
        <div className="space-y-3">
          {doing.map((t) => (
            <div key={t.id} className="border rule bg-card p-4">
              <div className="flex items-baseline justify-between">
                <h4 className="text-base">{t.title}</h4>
                <span className="meta text-accent">● {TASK_STATUS_LABEL[t.status]}</span>
              </div>
              <div className="meta mt-1">{t.id} · {t.department} · DDL {t.ddl}</div>
              {t.progress != null && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex-1 h-px bg-rule relative">
                    <div className="absolute left-0 -top-px h-0.5 bg-accent" style={{ width: `${t.progress}%` }} />
                  </div>
                  <span className="meta">{t.progress}%</span>
                  <button className="text-xs border-b rule hover:border-accent hover:text-accent">更新进度</button>
                  <button className="text-xs border-b rule hover:border-accent hover:text-accent">打开详情</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="display text-xl mb-4 text-ink-soft">▸ 已完成 <span className="meta">({done.length})</span></h3>
        <div className="space-y-2">
          {done.map((t) => (
            <div key={t.id} className="flex items-baseline gap-4 py-2 border-b rule">
              <span className="meta">{t.id}</span>
              <span className="text-sm flex-1">{t.title}</span>
              <span className="meta">{t.department}</span>
              <span className="meta text-success">✓ {TASK_STATUS_LABEL[t.status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyEvents() {
  const events = ARCHIVE.slice(0, 4);
  return (
    <div>
      <div className="flex justify-between items-baseline mb-5">
        <h3 className="display text-xl">参与活动历史</h3>
        <button className="text-sm border rule px-3 py-1.5 hover:border-ink hover:bg-card transition-colors">
          ↗ 导出 PDF（用于简历）
        </button>
      </div>
      <ul className="space-y-4">
        {events.map((a) => (
          <li key={a.id} className="grid grid-cols-[80px_1fr_120px] gap-5 items-baseline py-3 border-b rule">
            <span className="font-mono text-sm text-ink-soft">{a.date}</span>
            <div>
              <div className="text-base">{a.title}</div>
              <div className="meta mt-1">{a.department} · 参与人员</div>
            </div>
            <span className="meta text-right">已归档</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MyCredits() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="border rule p-5 bg-card">
          <div className="meta">累计学时</div>
          <div className="display text-5xl mt-2">24<span className="text-2xl text-ink-soft ml-1">h</span></div>
        </div>
        <div className="border rule p-5 bg-card">
          <div className="meta">学校要求</div>
          <div className="display text-5xl mt-2">20<span className="text-2xl text-ink-soft ml-1">h</span></div>
          <div className="text-success text-sm mt-1">✓ 已达标</div>
        </div>
        <div className="border rule p-5 bg-card">
          <div className="meta">本学期</div>
          <div className="display text-5xl mt-2">8<span className="text-2xl text-ink-soft ml-1">h</span></div>
        </div>
      </div>

      <h3 className="display text-xl mb-4">明细</h3>
      <ul className="space-y-3">
        {[
          { date: "2026-05-15", title: "关西俳句赏读会", hours: 3 },
          { date: "2026-05-08", title: "英语角 vol.11", hours: 2 },
          { date: "2026-04-28", title: "迎新晚会执行", hours: 5 },
          { date: "2026-04-15", title: "外联部周会", hours: 1 },
          { date: "2026-03-25", title: "学时归档整理", hours: 4 },
        ].map((r, i) => (
          <li key={i} className="grid grid-cols-[80px_1fr_60px] items-baseline py-2 border-b rule">
            <span className="font-mono text-sm text-ink-soft">{r.date}</span>
            <span className="text-sm">{r.title}</span>
            <span className="font-mono text-sm text-right">+ {r.hours} h</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MyFiles() {
  const mine = TEMPLATES.slice(0, 3);
  return (
    <div>
      <h3 className="display text-xl mb-4">我上传的文件 <span className="meta">({mine.length})</span></h3>
      <ul className="space-y-3">
        {mine.map((t) => (
          <li key={t.id} className="grid grid-cols-[60px_1fr_100px_100px] items-baseline py-3 border-b rule">
            <span className="meta">{t.ext.toUpperCase()}</span>
            <span className="text-sm">{t.name}</span>
            <span className="meta">{t.updatedAt}</span>
            <span className="meta text-right">{t.size}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
