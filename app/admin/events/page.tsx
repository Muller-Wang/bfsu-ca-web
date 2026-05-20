"use client";

import { EVENTS } from "@/lib/mock/data";
import { EVENT_TAG_META } from "@/lib/types";
import { findUser } from "@/lib/mock/users";

export default function AdminEventsPage() {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="display text-2xl">
          活动管理 <span className="meta ml-2">{EVENTS.length} 项</span>
        </h2>
        <button className="px-4 py-2 text-sm bg-accent text-card hover:bg-accent-soft transition-colors">
          + 新建活动
        </button>
      </div>

      <div className="border-t rule">
        <div className="grid grid-cols-[100px_1fr_120px_100px_100px_120px] gap-4 py-3 border-b rule">
          {["编号", "活动", "日期", "类型", "部门", "负责人"].map((h) => (
            <span key={h} className="meta">{h}</span>
          ))}
        </div>
        {EVENTS.map((e) => {
          const tag = EVENT_TAG_META[e.tag];
          const owner = e.owner ? findUser(e.owner) : null;
          return (
            <div
              key={e.id}
              className="grid grid-cols-[100px_1fr_120px_100px_100px_120px] gap-4 py-3 border-b rule items-baseline text-sm hover:bg-card/60"
            >
              <span className="font-mono text-xs">{e.id}</span>
              <span>{e.title}</span>
              <span className="font-mono text-xs text-ink-soft">{e.date}{e.start && ` ${e.start}`}</span>
              <span className="flex items-center gap-1.5">
                <span className="dot" style={{ color: tag.color }} />
                <span className="text-ink-soft text-xs">{tag.label}</span>
              </span>
              <span className="text-ink-soft text-xs">{e.department ?? "—"}</span>
              <span className="text-ink-soft text-xs">{owner?.name ?? "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
