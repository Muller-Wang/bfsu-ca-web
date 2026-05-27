"use client";

import { useState } from "react";
import clsx from "clsx";
import { LIAISONS, TEMPLATES } from "@/lib/mock/data";
import {
  LIAISON_CATEGORY_LABEL,
  LIAISON_STATUS_COLOR,
  LIAISON_STATUS_LABEL,
  type LiaisonCategory,
  type LiaisonStatus,
} from "@/lib/types";

const EXT_BADGE: Record<string, string> = {
  docx: "DOC",
  pdf: "PDF",
  md: "MD ",
  xlsx: "XLS",
};

export default function WorkspacePage() {
  const [cat, setCat] = useState<LiaisonCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LiaisonStatus | "all">("all");

  const filtered = LIAISONS.filter((l) => {
    const matchCat = cat === "all" || l.category === cat;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchCat && matchStatus;
  });

  const letterTemplates = TEMPLATES.filter((t) => t.category === "letter");

  const activeCount = LIAISONS.filter((l) => l.status === "cooperating" || l.status === "negotiating").length;
  const completedCount = LIAISONS.filter((l) => l.status === "completed").length;
  const pendingCount = LIAISONS.filter((l) => l.status === "contacting").length;

  return (
    <div className="px-10 py-10 max-w-6xl">
      {/* Header */}
      <div className="rise rise-1 flex items-end justify-between mb-3">
        <div>
          <div className="meta">WORKSPACE · 外联工作区</div>
          <h1 className="display text-4xl mt-2">外联工作区</h1>
          <p className="meta mt-2">跟踪社团 / 企业 / 基金会 / 政府单位外联进度</p>
        </div>
      </div>

      <hr className="border-t rule my-8" />

      {/* KPI Cards */}
      <div className="rise rise-2 grid grid-cols-3 gap-5 mb-8">
        <div className="border rule bg-card p-5">
          <div className="meta mb-1">进行中</div>
          <div className="display text-4xl text-accent">{activeCount}</div>
          <div className="meta mt-1 text-xs">合作 + 洽谈</div>
        </div>
        <div className="border rule bg-card p-5">
          <div className="meta mb-1">已完成</div>
          <div className="display text-4xl text-success">{completedCount}</div>
          <div className="meta mt-1 text-xs">历史合作</div>
        </div>
        <div className="border rule bg-card p-5">
          <div className="meta mb-1">待跟进</div>
          <div className="display text-4xl text-warn">{pendingCount}</div>
          <div className="meta mt-1 text-xs">新接洽</div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-10">
        {/* Main: liaison list */}
        <section className="rise rise-3 min-w-0">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-xs">
              {(["all", "club", "enterprise", "foundation", "government"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={clsx(
                    "px-3 py-1.5 border rule transition-colors",
                    cat === c ? "bg-ink text-card border-ink" : "hover:border-ink"
                  )}
                >
                  {c === "all" ? "全部" : LIAISON_CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LiaisonStatus | "all")}
              className="bg-transparent border-b rule pb-1 focus:border-ink outline-none text-sm"
            >
              <option value="all">状态 · 全部</option>
              {Object.entries(LIAISON_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="border-t rule">
            <div className="grid grid-cols-[1.2fr_80px_80px_120px_1fr_120px] gap-3 py-3 border-b rule">
              {["单位名称", "类型", "状态", "联系人", "备注", "下一步"].map((h) => (
                <span key={h} className="meta">{h}</span>
              ))}
            </div>

            {filtered.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-[1.2fr_80px_80px_120px_1fr_120px] gap-3 py-3 border-b rule items-baseline text-sm hover:bg-card/60"
              >
                <span className="font-medium">
                  {l.name}
                  {l.since && <span className="meta ml-2 text-[10px]">since {l.since}</span>}
                </span>
                <span className="text-xs text-ink-soft">{LIAISON_CATEGORY_LABEL[l.category]}</span>
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="dot" style={{ color: LIAISON_STATUS_COLOR[l.status] }} />
                  {LIAISON_STATUS_LABEL[l.status]}
                </span>
                <span className="text-xs">
                  {l.contact}
                  {l.contactRole && <span className="text-ink-soft ml-1">({l.contactRole})</span>}
                </span>
                <span className="text-xs text-ink-soft leading-relaxed">{l.notes}</span>
                <span className="text-xs text-accent">
                  {l.nextStep || "—"}
                </span>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-ink-soft">无匹配的外联记录</div>
            )}
          </div>
        </section>

        {/* Sidebar: letter templates */}
        <aside className="rise rise-3">
          <div className="meta mb-4">书信模版 · 快速下载</div>
          <div className="border rule divide-y rule">
            {letterTemplates.map((tp) => (
              <div key={tp.id} className="px-4 py-3 hover:bg-card/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm truncate">{tp.name}</div>
                    <div className="meta italic font-serif text-xs normal-case tracking-normal">{tp.nameEn}</div>
                  </div>
                  <span className="font-mono text-[10px] border rule px-1.5 py-0.5 shrink-0">
                    {EXT_BADGE[tp.ext]}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="meta text-[10px]">{tp.version} · {tp.size}</span>
                  <button className="text-xs border-b border-rule hover:border-accent hover:text-accent transition-colors">
                    ↓ 下载
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 px-4 py-3 border-l-2 border-rule bg-card/50 text-xs text-ink-soft">
            <span className="meta mr-1">ⓘ</span>
            更多模版请前往
            <a href="/library" className="text-accent border-b border-rule hover:border-accent ml-1">
              资料库
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
