"use client";

import Link from "next/link";
import { useCurrentUser } from "@/lib/auth";
import { useClubData } from "@/lib/club-data";
import { parseLocalDate } from "@/lib/date";
import { EVENT_TAG_META, TASK_STATUS_LABEL } from "@/lib/types";
import { EmptyState, PageError, PageLoading } from "@/components/ui/PageState";

function formatEnDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();
}

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { data, loading, error, refresh } = useClubData();
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  if (loading && !data) return <PageLoading label="正在加载主页" />;
  if (error && !data) return <PageError message={error} onRetry={() => void refresh()} />;
  if (!data) return null;
  const { events, feed, tasks } = data;
  const announcements = data.announcements.filter((item) => item.pinned);

  const upcoming = events.filter((e) => e.date >= todayIso && e.tag !== "ddl").slice(0, 3);
  const myTasks = tasks.filter((t) => t.assignee === user?.id && t.status !== "done").slice(0, 3);
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
  const thisWeekCount = events.filter((event) => event.date >= todayIso && parseLocalDate(event.date) <= weekEnd && event.tag !== "ddl").length;

  return (
    <div className="page-shell max-w-6xl">
      {/* Hero strip */}
      <div className="rise rise-1">
        <div className="meta">{formatEnDate(today)}</div>
        <h1 className="display text-4xl md:text-5xl mt-3">
          早上好，<span className="italic font-serif">{user?.name || "墨乐"}</span>。
        </h1>
        <p className="text-ink-soft mt-2 text-base">
          今天有 <span className="text-ink font-mono">{myTasks.length}</span> 项待办，本周还有{" "}
          <span className="text-ink font-mono">{thisWeekCount}</span> 场活动。
        </p>
      </div>

      <hr className="border-t rule my-10" />

      {/* Announcements */}
      <section className="rise rise-2">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="display text-2xl">置顶公告</h2>
          <span className="meta">PINNED · {announcements.length}</span>
        </div>
        {announcements.length ? <ul className="space-y-5">
          {announcements.map((a) => (
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
        </ul> : <EmptyState title="暂无置顶公告" detail="管理员发布并置顶公告后，会显示在这里。" />}
      </section>

      <hr className="border-t rule my-10" />

      {/* Two-column: upcoming + tasks */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6 rise rise-3">
        <div>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="display text-2xl">近期活动</h2>
            <span className="meta">UPCOMING</span>
          </div>
          {upcoming.length ? <ul className="space-y-5">
            {upcoming.map((ev) => {
              const meta = EVENT_TAG_META[ev.tag];
              const d = parseLocalDate(ev.date);
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
          </ul> : <EmptyState title="近期没有活动" detail="新的活动安排会自动进入这一区域。" />}
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
          {myTasks.length ? <ul className="space-y-5">
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
          </ul> : <EmptyState title="当前没有待办" detail="分配给你的新任务会显示在这里。" />}
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
        {feed.length ? <ul className="space-y-2.5">
          {feed.map((f) => (
            <li key={f.id} className="grid grid-cols-[auto_auto_1fr] gap-x-4 items-baseline">
              <span className="meta">{f.at.slice(5)}</span>
              <span className="text-sm text-ink">{f.who}</span>
              <span className="text-sm text-ink-soft">{f.what}</span>
            </li>
          ))}
        </ul> : <EmptyState title="暂无动态" detail="创建任务、发布公告等操作会形成动态记录。" />}
      </section>

      <div className="h-20" />
    </div>
  );
}
