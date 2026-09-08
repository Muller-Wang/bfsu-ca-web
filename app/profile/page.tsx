"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useCurrentUser } from "@/lib/auth";
import { runAction, useClubData, type CreditSummary } from "@/lib/club-data";
import { ROLE_LABEL, TASK_STATUS_LABEL, type CalendarEvent, type Task, type Template } from "@/lib/types";
import { EmptyState, PageError, PageLoading, SectionError } from "@/components/ui/PageState";

type Tab = "tasks" | "events" | "credits" | "files";

export default function ProfilePage() {
  const { user, setUser } = useCurrentUser();
  const { data, loading, error, refresh } = useClubData();
  const [tab, setTab] = useState<Tab>("tasks");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  if (loading && !data) return <PageLoading label="正在加载个人中心" />;
  if (error && !data) return <PageError message={error} onRetry={() => void refresh()} />;
  if (!user || !data) return null;

  return (
    <div className="page-shell max-w-5xl">
      {/* Identity card */}
      <section className="rise rise-1 grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-4 sm:gap-8 items-start mb-8 sm:mb-10">
        <AvatarEditor
          user={user}
          onUploaded={(avatarUrl) => setUser({ ...user, avatarUrl })}
        />
        <div>
          <div className="meta">PROFILE · 个人中心</div>
          <h1 className="display text-2xl sm:text-4xl mt-1">
            {user.name} <span className="italic text-ink-soft font-serif text-lg sm:text-2xl">/ {user.nameEn}</span>
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
        <div className="col-span-2 flex items-start justify-between text-left sm:col-span-1 sm:block sm:text-right">
          <div>
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
          <button onClick={() => { setShowPassword((value) => !value); setPasswordMessage(""); }} className="mt-4 text-xs border-b rule hover:border-accent hover:text-accent">
            修改密码
          </button>
        </div>
      </section>

      {showPassword && (
        <form
          className="rise rise-2 mb-8 border rule bg-card p-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setPasswordBusy(true);
            setPasswordMessage("");
            try {
              const result = await runAction<{ message?: string }>("changePassword", {
                currentPassword: String(form.get("currentPassword") || ""),
                newPassword: String(form.get("newPassword") || ""),
              });
              setPasswordMessage(result.message || "密码已更新");
              event.currentTarget.reset();
            } catch (error) {
              setPasswordMessage(error instanceof Error ? error.message : "修改失败");
            } finally {
              setPasswordBusy(false);
            }
          }}
        >
          <label className="text-sm">
            <span className="meta block mb-2">当前密码</span>
            <input name="currentPassword" type="password" autoComplete="current-password" required className="w-full border rule bg-transparent px-3 py-2 outline-none focus:border-accent" />
          </label>
          <label className="text-sm">
            <span className="meta block mb-2">新密码（至少 8 位）</span>
            <input name="newPassword" type="password" autoComplete="new-password" minLength={8} required className="w-full border rule bg-transparent px-3 py-2 outline-none focus:border-accent" />
          </label>
          <button disabled={passwordBusy} className="border rule px-4 py-2 hover:border-accent hover:text-accent disabled:opacity-50">
            {passwordBusy ? "提交中…" : "确认修改"}
          </button>
          {passwordMessage && <p className="sm:col-span-3 text-sm text-ink-soft">{passwordMessage}</p>}
        </form>
      )}

      {/* Tabs */}
      <div className="rise rise-2 flex items-center gap-5 overflow-x-auto border-b rule">
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
              "pb-3 flex shrink-0 items-baseline gap-2 -mb-px border-b-2",
              tab === t.key ? "border-accent text-ink" : "border-transparent text-ink-soft hover:text-ink"
            )}
          >
            <span className="text-base">{t.label}</span>
            <span className="meta">{t.en}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 rise rise-3">
        {tab === "tasks" && <MyTasks tasks={data.tasks.filter((task) => task.assignee === user.id)} refresh={refresh} />}
        {tab === "events" && <MyEvents events={data.events.filter((event) => event.owner === user.id)} />}
        {tab === "credits" && <MyCredits summary={data.credits.find((item) => item.user.id === user.id)} />}
        {tab === "files" && <MyFiles templates={data.templates} />}
      </div>
    </div>
  );
}

function AvatarEditor({ user, onUploaded }: { user: NonNullable<ReturnType<typeof useCurrentUser>["user"]>; onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setMessage("");
    if (file.size > 200 * 1024 * 1024) {
      setMessage("头像不能超过 200 MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("请选择 JPG、PNG 或 WebP 图片");
      return;
    }

    try {
      setBusy(true);
      const bitmap = await createImageBitmap(file);
      const side = Math.min(bitmap.width, bitmap.height);
      const sx = (bitmap.width - side) / 2;
      const sy = (bitmap.height - side) / 2;
      const cropped = await createImageBitmap(bitmap, sx, sy, side, side);
      bitmap.close();

      const canvas = new OffscreenCanvas(side, side);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("画布初始化失败");
      ctx.drawImage(cropped, 0, 0);
      cropped.close();

      const blob = await canvas.convertToBlob({ type: "image/png" });
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: blob,
      });
      const result = await response.json().catch(() => ({})) as { avatarUrl?: string; error?: string };
      if (!response.ok || !result.avatarUrl) throw new Error(result.error || "上传失败");
      onUploaded(result.avatarUrl);
      setMessage("头像已更新");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "头像上传失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-24 sm:w-28">
      <div className="relative w-16 h-16 sm:w-24 sm:h-24 overflow-hidden border rule grid place-items-center font-serif text-3xl sm:text-4xl text-accent bg-card">
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={`${user.name}的头像`} fill sizes="96px" className="object-cover" unoptimized />
        ) : user.name.slice(-1)}
      </div>
      <label className="mt-2 inline-flex cursor-pointer border-b rule text-xs hover:border-accent hover:text-accent">
        {busy ? "上传中…" : user.avatarUrl ? "更换头像" : "上传头像"}
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(event) => void upload(event.currentTarget.files?.[0])}
        />
      </label>
      <p className="mt-1 text-[10px] leading-4 text-ink-soft">非正方形图片会自动居中裁切，200 MB 内</p>
      {message && <p className="mt-1 text-[10px] leading-4 text-ink-soft" role="status">{message}</p>}
    </div>
  );
}

function MyTasks({ tasks: mine, refresh }: { tasks: Task[]; refresh: () => Promise<void> }) {
  const doing = mine.filter((t) => t.status === "doing" || t.status === "todo");
  const done = mine.filter((t) => t.status === "done" || t.status === "review");
  const [error, setError] = useState("");

  const advance = async (task: Task) => {
    setError("");
    try { await runAction("updateTaskProgress", { id: task.id, progress: Math.min(100, (task.progress || 0) + 10) }); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "进度更新失败"); }
  };

  return (
    <div className="space-y-10">
      {error && <SectionError message={error} />}
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
                  <button onClick={() => void advance(t)} className="text-xs border-b rule hover:border-accent hover:text-accent">进度 +10%</button>
                  <Link href="/tasks" className="text-xs border-b rule hover:border-accent hover:text-accent">打开详情</Link>
                </div>
              )}
            </div>
          ))}
          {doing.length === 0 && <EmptyState title="没有进行中的任务" detail="新的个人任务会显示在这里。" />}
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
          {done.length === 0 && <EmptyState title="暂无已完成任务" detail="完成或提交审核的任务会保留在这里。" />}
        </div>
      </div>
    </div>
  );
}

function MyEvents({ events }: { events: CalendarEvent[] }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-5">
        <h3 className="display text-xl">参与活动历史</h3>
        <button onClick={() => window.print()} className="text-sm border rule px-3 py-1.5 hover:border-ink hover:bg-card transition-colors">
          ↗ 导出 PDF（用于简历）
        </button>
      </div>
      <ul className="space-y-4">
        {events.map((a) => (
          <li key={a.id} className="grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr_120px] gap-3 sm:gap-5 items-baseline py-3 border-b rule">
            <span className="font-mono text-sm text-ink-soft">{a.date}</span>
            <div>
              <div className="text-base">{a.title}</div>
              <div className="meta mt-1">{a.department} · 参与人员</div>
            </div>
            <span className="meta col-start-2 text-left sm:col-start-auto sm:text-right">{a.tag}</span>
          </li>
        ))}
      </ul>
      {events.length === 0 && <EmptyState title="暂无活动记录" detail="负责或参与的活动会逐步沉淀在这里。" />}
    </div>
  );
}

function MyCredits({ summary }: { summary?: CreditSummary }) {
  const total = summary?.total || 0;
  const semester = summary?.semester || 0;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <div className="border rule p-5 bg-card">
          <div className="meta">累计学时</div>
          <div className="display text-5xl mt-2">{total}<span className="text-2xl text-ink-soft ml-1">h</span></div>
        </div>
        <div className="border rule p-5 bg-card">
          <div className="meta">学校要求</div>
          <div className="display text-5xl mt-2">20<span className="text-2xl text-ink-soft ml-1">h</span></div>
          <div className={total >= 20 ? "text-success text-sm mt-1" : "text-warn text-sm mt-1"}>{total >= 20 ? "✓ 已达标" : "尚未达标"}</div>
        </div>
        <div className="border rule p-5 bg-card">
          <div className="meta">本学期</div>
          <div className="display text-5xl mt-2">{semester}<span className="text-2xl text-ink-soft ml-1">h</span></div>
        </div>
      </div>

      <p className="text-sm text-ink-soft">学时明细由管理员录入后计入以上汇总。</p>
    </div>
  );
}

function MyFiles({ templates: mine }: { templates: Template[] }) {
  return (
    <div>
      <h3 className="display text-xl mb-4">可用模板 <span className="meta">({mine.length})</span></h3>
      <ul className="space-y-3">
        {mine.map((t) => (
          <li key={t.id} className="grid grid-cols-[48px_1fr_auto] sm:grid-cols-[60px_1fr_100px_100px] gap-2 items-baseline py-3 border-b rule">
            <span className="meta">{t.ext.toUpperCase()}</span>
            <span className="text-sm">{t.name}</span>
            <span className="meta hidden sm:block">{t.updatedAt}</span>
            <span className="meta text-right">{t.size}</span>
          </li>
        ))}
      </ul>
      {mine.length === 0 && <EmptyState title="暂无可用模板" detail="管理员上传模板后会显示在这里。" />}
    </div>
  );
}
