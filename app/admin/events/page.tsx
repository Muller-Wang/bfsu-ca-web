"use client";

import { useState } from "react";
import { EVENTS } from "@/lib/mock/data";
import { EVENT_TAG_META, type CalendarEvent } from "@/lib/types";
import { findUser } from "@/lib/mock/users";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(EVENTS);
  const [confirmTarget, setConfirmTarget] = useState<CalendarEvent | null>(null);

  const handleDelete = (target: CalendarEvent) => {
    setEvents((prev) => prev.filter((e) => e.id !== target.id));
    setConfirmTarget(null);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="display text-2xl">
          活动管理 <span className="meta ml-2">{events.length} 项</span>
        </h2>
        <button className="px-4 py-2 text-sm bg-accent text-card hover:bg-accent-soft transition-colors rounded-full">
          + 新建活动
        </button>
      </div>

      <div className="border-t rule">
        <div className="grid grid-cols-[90px_1fr_120px_90px_90px_90px_120px] gap-4 py-3 border-b rule">
          {["编号", "活动", "日期", "类型", "部门", "负责人", "操作"].map((h) => (
            <span key={h} className="meta">{h}</span>
          ))}
        </div>
        {events.map((e) => {
          const tag = EVENT_TAG_META[e.tag];
          const owner = e.owner ? findUser(e.owner) : null;
          return (
            <div
              key={e.id}
              className="grid grid-cols-[90px_1fr_120px_90px_90px_90px_120px] gap-4 py-3 border-b rule items-baseline text-sm hover:bg-card/60"
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
              <span className="flex items-center gap-2 text-xs">
                <button className="border-b rule hover:border-ink">编辑</button>
                <button
                  onClick={() => setConfirmTarget(e)}
                  className="border-b rule text-danger hover:border-danger"
                >
                  删除
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="meta text-center py-12">暂无活动</div>
      )}

      {/* Confirm dialog */}
      {confirmTarget && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50 px-6"
          onClick={() => setConfirmTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border rule rounded-sm max-w-md w-full shadow-2xl"
          >
            <div className="px-7 py-6 border-b rule">
              <div className="meta text-danger mb-2">⚠ 删除活动</div>
              <h3 className="display text-2xl">确认删除「{confirmTarget.title}」？</h3>
            </div>
            <div className="px-7 py-5 text-sm text-ink-soft leading-relaxed">
              <p>
                活动 <span className="font-mono text-ink">{confirmTarget.id}</span> 将从日历和管理列表中移除。
              </p>
              <p className="mt-3">
                <span className="text-ink">建议：</span>如该活动已结束并完成归档，请改用「归档区」管理；删除主要用于撤销误建活动。
              </p>
            </div>
            <div className="px-7 py-4 border-t rule flex justify-end gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="text-sm px-4 py-2 hover:text-ink"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(confirmTarget)}
                className="text-sm px-4 py-2 bg-danger text-card hover:opacity-90 transition-colors rounded-full"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
