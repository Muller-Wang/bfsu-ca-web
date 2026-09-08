"use client";

import { useState } from "react";
import { EVENT_TAG_META, type CalendarEvent, type Department, type EventTag, type User } from "@/lib/types";
import { runAction, useClubData } from "@/lib/club-data";
import { EmptyState, SectionError, SectionLoading } from "@/components/ui/PageState";

export default function AdminEventsPage() {
  const [confirmTarget, setConfirmTarget] = useState<CalendarEvent | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [actionError, setActionError] = useState("");
  const { data, loading, error, refresh } = useClubData();
  if (loading && !data) return <SectionLoading label="正在加载活动" />;
  if (error && !data) return <SectionError message={error} onRetry={() => void refresh()} />;
  if (!data) return null;
  const { events, users } = data;

  const handleDelete = async (target: CalendarEvent) => {
    setActionError("");
    try {
      await runAction("deleteEvent", { id: target.id });
      await refresh();
      setConfirmTarget(null);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "删除失败"); }
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-baseline mb-5">
        <h2 className="display text-2xl">
          活动管理 <span className="meta ml-2">{events.length} 项</span>
        </h2>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 text-sm btn-outline">
          + 新建活动
        </button>
      </div>
      {actionError && <div className="mb-4"><SectionError message={actionError} /></div>}

      <div className="table-scroll border-t rule">
        <div className="min-w-[820px]">
        <div className="grid grid-cols-[90px_1fr_120px_90px_90px_90px_120px] gap-4 py-3 border-b rule">
          {["编号", "活动", "日期", "类型", "部门", "负责人", "操作"].map((h) => (
            <span key={h} className="meta">{h}</span>
          ))}
        </div>
        {events.map((e) => {
          const tag = EVENT_TAG_META[e.tag];
          const owner = e.owner ? users.find((user) => user.id === e.owner) : null;
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
      </div>

      {events.length === 0 && (
        <EmptyState title="暂无活动" detail="创建活动后会同步进入管理列表和日历。" />
      )}

      {/* Confirm dialog */}
      {confirmTarget && (
        <div
          className="modal-backdrop fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50"
          onClick={() => setConfirmTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-panel bg-card border rule rounded-sm max-w-md w-full shadow-2xl"
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
                onClick={() => void handleDelete(confirmTarget)}
                className="text-sm px-4 py-2 btn-outline-danger"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
      {showNew && <EventForm users={users} onCancel={() => setShowNew(false)} onSaved={async () => { setShowNew(false); await refresh(); }} />}
    </div>
  );
}

function EventForm({ users, onCancel, onSaved }: { users: User[]; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: "", tag: "self" as EventTag, date: new Date().toISOString().slice(0, 10), start: "", end: "", location: "", department: "项目部" as Department, owner: users[0]?.id || "", description: "" });
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => { event.preventDefault(); try { await runAction("createEvent", form); onSaved(); } catch (cause) { setError(cause instanceof Error ? cause.message : "创建失败"); } };
  return (
    <div className="modal-backdrop fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50" onClick={onCancel}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="modal-panel bg-card border rule rounded-xl max-w-lg w-full p-5 sm:p-7 space-y-4">
        <h2 className="display text-2xl">新建活动</h2>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="活动名称" className="w-full bg-transparent border-b rule py-2 outline-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-transparent border-b rule py-2" /><select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value as EventTag })} className="bg-transparent border-b rule py-2">{Object.entries(EVENT_TAG_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="bg-transparent border-b rule py-2" /><input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="bg-transparent border-b rule py-2" /></div>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="地点" className="w-full bg-transparent border-b rule py-2" />
        <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full bg-transparent border-b rule py-2">{users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.department}</option>)}</select>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="活动说明" className="w-full bg-transparent border rule p-3" />
        {error && <p className="text-danger text-sm">{error}</p>}
        <div className="flex justify-end gap-3"><button type="button" onClick={onCancel}>取消</button><button type="submit" className="btn-outline px-4 py-2">创建</button></div>
      </form>
    </div>
  );
}
