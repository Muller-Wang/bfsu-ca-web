"use client";

import { useState } from "react";
import { useClubData } from "@/lib/club-data";
import {
  LIAISON_CATEGORY_LABEL,
  LIAISON_STATUS_COLOR,
  LIAISON_STATUS_LABEL,
  type LiaisonCategory,
  type LiaisonStatus,
} from "@/lib/types";
import { PillGroup } from "@/components/ui/PillGroup";
import { EmptyState, PageError, PageLoading } from "@/components/ui/PageState";

const EXT_BADGE: Record<string, string> = {
  docx: "DOC",
  pdf: "PDF",
  md: "MD ",
  xlsx: "XLS",
};

const CAT_OPTIONS = [
  { key: "all" as const,          label: "全部" },
  { key: "club" as const,         label: "社团" },
  { key: "enterprise" as const,   label: "企业" },
  { key: "foundation" as const,   label: "基金会" },
  { key: "government" as const,   label: "政府" },
];

export default function WorkspacePage() {
  const [cat, setCat] = useState<LiaisonCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LiaisonStatus | "all">("all");
  const { data, loading, error, refresh } = useClubData();
  if (loading && !data) return <PageLoading label="正在加载外联工作区" />;
  if (error && !data) return <PageError message={error} onRetry={() => void refresh()} />;
  if (!data) return null;
  const { liaisons, templates } = data;

  const filtered = liaisons.filter((l) => {
    const matchCat = cat === "all" || l.category === cat;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchCat && matchStatus;
  });

  const letterTemplates = templates.filter((t) => t.category === "letter");

  const activeCount    = liaisons.filter((l) => l.status === "cooperating" || l.status === "negotiating").length;
  const completedCount = liaisons.filter((l) => l.status === "completed").length;
  const pendingCount   = liaisons.filter((l) => l.status === "contacting").length;

  return (
    <div className="page-shell max-w-6xl">
      {/* Header */}
      <div className="rise rise-1 mb-3">
        <div className="meta">WORKSPACE · 外联工作区</div>
        <h1 className="display text-4xl mt-2">外联工作区</h1>
        <p className="meta mt-2">跟踪社团 / 企业 / 基金会 / 政府单位外联进度</p>
      </div>

      <hr className="border-t rule my-8" />

      {/* KPI Cards */}
      <div className="rise rise-2 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-8">
        {[
          { label: "进行中", count: activeCount,    sub: "合作 + 洽谈" },
          { label: "已完成", count: completedCount, sub: "历史合作" },
          { label: "待跟进", count: pendingCount,   sub: "新接洽" },
        ].map(({ label, count, sub }) => (
          <div
            key={label}
            style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: "20px 24px" }}
          >
            <div className="meta mb-1">{label}</div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 44,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: "var(--ink)",
                fontFeatureSettings: '"tnum"',
              }}
            >
              {count}
            </div>
            <div className="meta mt-1 text-xs">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-10">
        {/* Main: liaison list */}
        <section className="rise rise-3 min-w-0">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <PillGroup
              options={CAT_OPTIONS as { key: LiaisonCategory | "all"; label: string }[]}
              value={cat}
              onChange={setCat}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LiaisonStatus | "all")}
              className="bg-transparent border-b rule pb-1 focus:border-ink outline-none text-sm"
              style={{ borderColor: "var(--line)", fontFamily: "var(--font-sans)" }}
            >
              <option value="all">状态 · 全部</option>
              {Object.entries(LIAISON_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="table-scroll border-t rule">
            <div className="min-w-[760px]">
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
                <span className="text-xs text-ink-soft">{l.nextStep || "—"}</span>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-ink-soft">无匹配的外联记录</div>
            )}
            </div>
          </div>
        </section>

        {/* Sidebar: letter templates */}
        <aside className="rise rise-3">
          <div className="meta mb-4">书信模版 · 快速下载</div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
            {letterTemplates.map((tp, i) => (
              <div
                key={tp.id}
                className="px-4 py-3 transition-colors hover:bg-card/60"
                style={{ borderTop: i > 0 ? "1px solid var(--line-faint)" : "none" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm truncate">{tp.name}</div>
                    <div className="meta text-xs normal-case tracking-normal">{tp.nameEn}</div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      border: "1px solid var(--line)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      flexShrink: 0,
                      color: "var(--ink-mute)",
                    }}
                  >
                    {EXT_BADGE[tp.ext]}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="meta text-[10px]">{tp.version} · {tp.size}</span>
                  {tp.downloadUrl ? <a
                    href={tp.downloadUrl}
                    style={{ fontSize: 12, color: "var(--ink-soft)", background: "none", border: "none", borderBottom: "1px solid var(--line)", cursor: "pointer", padding: "1px 0", transition: "color 120ms, border-color 120ms" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink-soft)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
                  >
                    ↓ 下载
                  </a> : <span className="text-xs text-ink-mute">尚未上传</span>}
                </div>
              </div>
            ))}
            {letterTemplates.length === 0 && <div className="p-4"><EmptyState title="暂无书信模板" detail="模板上传后会显示在这里。" /></div>}
          </div>
          <div
            className="mt-4 px-4 py-3 text-xs text-ink-soft"
            style={{ borderLeft: "2px solid var(--line)", background: "var(--paper-sunken)", borderRadius: "0 6px 6px 0" }}
          >
            <span className="meta mr-1">ⓘ</span>
            更多模版请前往
            <a
              href="/library"
              style={{ color: "var(--ink)", borderBottom: "1px solid var(--line)", marginLeft: 4, textDecoration: "none", transition: "border-color 120ms" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--line)")}
            >
              资料库
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
