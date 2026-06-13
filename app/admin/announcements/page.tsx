"use client";

import { useState } from "react";
import { ANNOUNCEMENTS } from "@/lib/mock/data";

export default function AdminAnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="display text-2xl">
          系统公告 <span className="meta ml-2">{ANNOUNCEMENTS.length} 条</span>
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 text-sm bg-accent text-card hover:bg-accent-soft transition-colors rounded-full"
        >
          + 发布新公告
        </button>
      </div>

      {showForm && (
        <div className="border rule bg-card p-5 mb-6 space-y-4">
          <div>
            <label className="meta block mb-2">标题</label>
            <input
              className="w-full bg-transparent border-b rule pb-2 outline-none focus:border-ink text-sm"
              placeholder="例：本周例会调整至晚 7 点"
            />
          </div>
          <div>
            <label className="meta block mb-2">正文</label>
            <textarea
              rows={4}
              className="w-full bg-transparent border rule p-3 outline-none focus:border-ink text-sm"
              placeholder="详细说明…"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="accent-accent" />
              置顶到主页
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm">取消</button>
              <button className="px-4 py-1.5 text-sm bg-ink text-card rounded-full">发布</button>
            </div>
          </div>
        </div>
      )}

      <ul className="space-y-5">
        {ANNOUNCEMENTS.map((a) => (
          <li key={a.id} className="border rule bg-card p-5">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-3">
                <span className="meta">#{a.id}</span>
                {a.pinned && <span className="meta text-ink">◆ PINNED</span>}
              </div>
              <div className="flex gap-2 text-xs">
                <button className="border-b rule hover:border-ink">编辑</button>
                <button className="border-b rule hover:border-ink">取消置顶</button>
                <button className="border-b rule text-danger hover:border-danger">删除</button>
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
    </div>
  );
}
