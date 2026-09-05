"use client";

import { useState } from "react";
import { runAction, useClubData } from "@/lib/club-data";
import { EmptyState, SectionError, SectionLoading } from "@/components/ui/PageState";

export default function AdminAnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(true);
  const [error, setError] = useState("");
  const { data, loading, error: loadError, refresh } = useClubData();
  if (loading && !data) return <SectionLoading label="正在加载公告" />;
  if (loadError && !data) return <SectionError message={loadError} onRetry={() => void refresh()} />;
  if (!data) return null;
  const announcements = data.announcements;

  const publish = async () => {
    try { await runAction("createAnnouncement", { title, body, pinned }); setTitle(""); setBody(""); setShowForm(false); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "发布失败"); }
  };

  const mutate = async (action: "toggleAnnouncement" | "deleteAnnouncement", id: string) => {
    setError("");
    try { await runAction(action, { id }); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "操作失败"); }
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-baseline mb-5">
        <h2 className="display text-2xl">
          系统公告 <span className="meta ml-2">{announcements.length} 条</span>
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 text-sm btn-outline"
        >
          + 发布新公告
        </button>
      </div>

      {showForm && (
        <div className="border rule bg-card p-5 mb-6 space-y-4">
          <div>
            <label className="meta block mb-2">标题</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full bg-transparent border-b rule pb-2 outline-none focus:border-ink text-sm"
              placeholder="例：本周例会调整至晚 7 点"
            />
          </div>
          <div>
            <label className="meta block mb-2">正文</label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              className="w-full bg-transparent border rule p-3 outline-none focus:border-ink text-sm"
              placeholder="详细说明…"
            />
          </div>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} className="accent-accent" />
              置顶到主页
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm">取消</button>
              <button onClick={() => void publish()} disabled={!title.trim() || !body.trim()} className="px-4 py-1.5 text-sm btn-outline">发布</button>
            </div>
          </div>
        </div>
      )}

      <ul className="space-y-5">
        {error && <li className="text-danger text-sm">{error}</li>}
        {announcements.map((a) => (
          <li key={a.id} className="border rule bg-card p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline mb-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="meta">#{a.id}</span>
                {a.pinned && <span className="meta text-ink">◆ PINNED</span>}
              </div>
              <div className="flex gap-2 text-xs">
                <button onClick={() => void mutate("toggleAnnouncement", a.id)} className="border-b rule hover:border-ink">{a.pinned ? "取消置顶" : "置顶"}</button>
                <button onClick={() => void mutate("deleteAnnouncement", a.id)} className="border-b rule text-danger hover:border-danger">删除</button>
              </div>
            </div>
            <h4 className="text-base mb-1">{a.title}</h4>
            <p className="text-sm text-ink-soft leading-relaxed">{a.body}</p>
            <div className="meta mt-3">
              {new Date(a.publishedAt).toLocaleString("zh-CN")} · {a.author}
            </div>
          </li>
        ))}
      </ul>
      {announcements.length === 0 && <EmptyState title="暂无公告" detail="发布后的公告会显示在这里；置顶公告同时出现在成员主页。" />}
    </div>
  );
}
