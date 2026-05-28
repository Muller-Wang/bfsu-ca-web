"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth";
import { ANNOUNCEMENTS, EVENTS, FEED, TASKS } from "@/lib/mock/data";
import { EVENT_TAG_META, TASK_STATUS_LABEL, type User } from "@/lib/types";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function formatChineseDate(d: Date) {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${WEEKDAYS[d.getDay()]}`;
}

function formatEnDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const today = new Date("2026-05-21");

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const upcoming = EVENTS.filter((e) => e.date >= "2026-05-21" && e.tag !== "ddl").slice(0, 3);
  const myTasks = TASKS.filter((t) => t.assignee === (user?.id || "23110301007") && t.status !== "done").slice(0, 3);

  return (
    <div className="px-10 py-10 max-w-6xl">
      {/* Hero strip */}
      <div className="rise rise-1">
        <div className="meta">{formatEnDate(today)}</div>
        <h1 className="display text-4xl md:text-5xl mt-3">
          早上好，<span className="italic font-serif">{user?.name || "墨乐"}</span>。
        </h1>
        <p className="text-ink-soft mt-2 text-base">
          今天有 <span className="text-ink font-mono">{myTasks.length}</span> 项待办，本周还有{" "}
          <span className="text-ink font-mono">2</span> 场活动。
        </p>
      </div>

      <hr className="border-t rule my-10" />

      {/* Announcements */}
      <section className="rise rise-2">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="display text-2xl">置顶公告</h2>
          <span className="meta">PINNED · {ANNOUNCEMENTS.length}</span>
        </div>
        <ul className="space-y-5">
          {ANNOUNCEMENTS.map((a) => (
            <li key={a.id} className="grid grid-cols-[auto_1fr] gap-5">
              <span className="meta pt-1">#{a.id}</span>
              <div>
                <p className="text-base leading-relaxed">{a.title}</p>
                <p className="meta mt-1.5">
                  {new Date(a.publishedAt).toLocaleString("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <span className="mx-2 text-rule">·</span>
                  {a.author}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <hr className="border-t rule my-10" />

      {/* Two-column: upcoming + tasks */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6 rise rise-3">
        <div>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="display text-2xl">近期活动</h2>
            <span className="meta">UPCOMING</span>
          </div>
          <ul className="space-y-5">
            {upcoming.map((ev) => {
              const meta = EVENT_TAG_META[ev.tag];
              const d = new Date(ev.date);
              return (
                <li key={ev.id} className="grid grid-cols-[auto_1fr] gap-4">
                  <div className="text-right">
                    <div className="font-serif text-3xl leading-none">{d.getDate()}</div>
                    <div className="meta mt-1">
                      {d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                    </div>
                  </div>
                  <div className="border-l rule pl-4">
                    <div className="flex items-center gap-2">
                      <span className="dot" style={{ color: meta.color }} />
                      <span className="meta">{meta.label}</span>
                    </div>
                    <div className="text-base mt-1">{ev.title}</div>
                    <div className="meta mt-1.5">
                      {ev.start && `${ev.start} · `}
                      {ev.location && `${ev.location} · `}
                      {ev.department}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link
            href="/calendar"
            className="meta mt-6 inline-flex items-center gap-2 hover:text-accent"
          >
            完整日历 →
          </Link>
        </div>

        <div className="lg:border-l rule lg:pl-10">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="display text-2xl">我的待办</h2>
            <span className="meta">MY TASKS</span>
          </div>
          <ul className="space-y-5">
            {myTasks.map((t) => (
              <li key={t.id} className="border-b rule pb-4">
                <div className="flex items-baseline justify-between">
                  <div className="text-base">{t.title}</div>
                  <span className="meta">{t.id}</span>
                </div>
                <div className="meta mt-1">
                  {t.department} · DDL {t.ddl}
                </div>
                {t.status === "doing" && t.progress != null && (
                  <div className="mt-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-rule relative">
                        <div
                          className="absolute inset-y-0 left-0 bg-accent"
                          style={{
                            width: `${t.progress}%`,
                            height: "2px",
                            top: "-0.5px",
                          }}
                        />
                      </div>
                      <span className="meta">{t.progress}%</span>
                    </div>
                  </div>
                )}
                <div className="meta mt-1.5 text-accent">{TASK_STATUS_LABEL[t.status]}</div>
              </li>
            ))}
          </ul>
          <Link href="/tasks" className="meta mt-4 inline-flex items-center gap-2 hover:text-accent">
            查看全部 →
          </Link>
        </div>
      </section>

      <hr className="border-t rule my-10" />

      {/* Activity feed */}
      <section className="rise rise-4">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="display text-2xl">社团动态</h2>
          <span className="meta">ACTIVITY FEED</span>
        </div>
        <ul className="space-y-2.5">
          {FEED.map((f) => (
            <li key={f.id} className="grid grid-cols-[auto_auto_1fr] gap-x-4 items-baseline">
              <span className="meta">{f.at.slice(5)}</span>
              <span className="text-sm text-ink">{f.who}</span>
              <span className="text-sm text-ink-soft">{f.what}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="h-20" />
    </div>
  );
}
