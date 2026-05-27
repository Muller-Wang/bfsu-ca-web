"use client";

import { useState } from "react";
import clsx from "clsx";
import { ARCHIVE, TEMPLATES } from "@/lib/mock/data";
import { EVENT_TAG_META, TEMPLATE_CATEGORY_LABEL, type ArchiveItem, type TemplateCategory } from "@/lib/types";

type Tab = "templates" | "archive";

const EXT_BADGE: Record<string, string> = {
  docx: "DOC",
  pdf: "PDF",
  md: "MD ",
  xlsx: "XLS",
};

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("templates");
  const [query, setQuery] = useState("");

  return (
    <div className="px-10 py-10 max-w-6xl">
      {/* Header */}
      <div className="rise rise-1 flex items-end justify-between mb-3">
        <div>
          <div className="meta">LIBRARY · 资料库</div>
          <h1 className="display text-4xl mt-2">资料库</h1>
        </div>
        <div className="flex items-center gap-2 border-b rule">
          <span className="meta">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文件…"
            className="bg-transparent outline-none py-1 text-sm w-56"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="rise rise-2 flex items-center gap-6 mt-8 mb-8 border-b rule">
        {([
          { key: "templates", label: "模板区", en: "TEMPLATES" },
          { key: "archive", label: "归档区", en: "ARCHIVE" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "pb-3 flex items-baseline gap-3 -mb-px border-b-2",
              tab === t.key ? "border-accent text-ink" : "border-transparent text-ink-soft hover:text-ink"
            )}
          >
            <span className="display text-xl">{t.label}</span>
            <span className="meta">{t.en}</span>
          </button>
        ))}
      </div>

      {tab === "templates" ? <TemplateGrid query={query} /> : <ArchiveTimeline query={query} />}
    </div>
  );
}

function TemplateGrid({ query }: { query: string }) {
  const [cat, setCat] = useState<TemplateCategory | "all">("all");

  const list = TEMPLATES.filter((t) => {
    const matchQuery = t.name.toLowerCase().includes(query.toLowerCase()) || t.nameEn.toLowerCase().includes(query.toLowerCase());
    const matchCat = cat === "all" || t.category === cat;
    return matchQuery && matchCat;
  });

  return (
    <section className="rise rise-3">
      <div className="flex items-center justify-between mb-5">
        <div className="meta">TEMPLATES · {list.length}</div>
        <div className="flex items-center gap-1 text-xs">
          {(["all", "general", "letter"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={clsx(
                "px-3 py-1.5 border rule transition-colors",
                cat === c ? "bg-ink text-card border-ink" : "hover:border-ink"
              )}
            >
              {c === "all" ? "全部" : TEMPLATE_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((tp) => (
          <article
            key={tp.id}
            className="group bg-card border rule p-5 hover:border-ink transition-all duration-200 relative"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 border rule flex items-center justify-center font-mono text-xs font-medium">
                {EXT_BADGE[tp.ext]}
              </div>
              <div className="flex items-center gap-2">
                {tp.category === "letter" && (
                  <span className="text-[10px] border rule px-1.5 py-0.5 text-ink-soft">书信</span>
                )}
                <span className="meta">{tp.version}</span>
              </div>
            </div>
            <h3 className="text-base mb-0.5">{tp.name}</h3>
            <div className="meta italic font-serif text-sm normal-case tracking-normal">{tp.nameEn}</div>
            <hr className="border-t rule my-4" />
            <div className="flex items-center justify-between">
              <span className="meta">{tp.updatedAt} · {tp.size}</span>
              <button className="text-sm border-b border-rule hover:border-accent hover:text-accent transition-colors">
                ↓ 下载
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ArchiveTimeline({ query }: { query: string }) {
  const list = ARCHIVE.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));
  const grouped = list.reduce<Record<string, ArchiveItem[]>>((acc, a) => {
    const ym = a.date.slice(0, 7);
    (acc[ym] ||= []).push(a);
    return acc;
  }, {});
  const years = Array.from(new Set(Object.keys(grouped).map((ym) => ym.slice(0, 4)))).sort().reverse();

  return (
    <section className="rise rise-3">
      {/* Filters */}
      <div className="flex items-center gap-4 mb-8 text-sm">
        <span className="meta">FILTER</span>
        <select className="bg-transparent border-b rule pb-1 focus:border-ink outline-none">
          <option>年份 · 2026</option>
        </select>
        <select className="bg-transparent border-b rule pb-1 focus:border-ink outline-none">
          <option>部门 · 全部</option>
        </select>
        <select className="bg-transparent border-b rule pb-1 focus:border-ink outline-none">
          <option>类型 · 全部</option>
        </select>
      </div>

      {years.map((year) => (
        <div key={year} className="mb-12">
          <h2 className="display text-5xl text-rule mb-6">{year}</h2>
          {Object.entries(grouped)
            .filter(([ym]) => ym.startsWith(year))
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([ym, items]) => {
              const monthName = new Date(`${ym}-01`).toLocaleDateString("en-US", { month: "long" }).toUpperCase();
              return (
                <div key={ym} className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="meta">{ym.slice(-2)} · {monthName}</span>
                    <span className="flex-1 border-t rule" />
                  </div>
                  <ul className="space-y-5">
                    {items.map((a) => {
                      const tag = EVENT_TAG_META[a.tag];
                      return (
                        <li key={a.id} className="grid grid-cols-[80px_1fr] gap-5 items-baseline">
                          <span className="font-mono text-sm text-ink-soft">{a.date.slice(5)}</span>
                          <div className="border-l rule pl-5 -ml-1">
                            <div className="flex items-baseline justify-between gap-4">
                              <h3 className="text-base">
                                <span className="text-accent mr-2">◇</span>
                                {a.title}
                              </h3>
                              <span className="meta flex items-center gap-2">
                                <span className="dot" style={{ color: tag.color }} />
                                {a.department} · {tag.label}
                              </span>
                            </div>
                            <div className="meta mt-2 flex flex-wrap gap-2">
                              {a.files.map((f, i) => (
                                <span key={i} className="border rule px-2 py-0.5">
                                  {f.kind}{f.count != null && ` (${f.count})`}
                                </span>
                              ))}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
        </div>
      ))}
    </section>
  );
}
