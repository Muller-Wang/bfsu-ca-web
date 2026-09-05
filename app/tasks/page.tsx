"use client";

import { useState } from "react";
import { TASK_CADENCE_LABEL, TASK_STATUS_LABEL, type Task, type TaskCadence, type TaskStatus, type User } from "@/lib/types";
import { PillGroup } from "@/components/ui/PillGroup";
import { parseLocalDate } from "@/lib/date";
import { runAction, useClubData } from "@/lib/club-data";
import { useCurrentUser } from "@/lib/auth";
import { EmptyState, PageError, PageLoading } from "@/components/ui/PageState";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo",   label: "待办" },
  { key: "doing",  label: "进行中" },
  { key: "review", label: "待审核" },
  { key: "done",   label: "已完成" },
];

const CADENCE_FILTERS = [
  { key: "all",       label: "全部" },
  { key: "once",      label: "单次" },
  { key: "weekly",    label: "每周" },
  { key: "biweekly",  label: "双周" },
  { key: "monthly",   label: "每月" },
] as const;

function isUrgent(ddl: string) {
  const d = parseLocalDate(ddl).getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  return d - today < 24 * 3600 * 1000 * 2 && d >= today;
}

export default function TasksPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [dept, setDept] = useState<string>("all");
  const [owner, setOwner] = useState<string>("all");
  const [cadence, setCadence] = useState<TaskCadence | "all">("all");
  const [showNew, setShowNew] = useState(false);
  const { user: currentUser } = useCurrentUser();
  const { data, loading, error, refresh } = useClubData();
  if (loading && !data) return <PageLoading label="正在加载任务" />;
  if (error && !data) return <PageError message={error} onRetry={() => void refresh()} />;
  if (!data) return null;
  const { tasks, users } = data;

  const filtered = tasks
    .filter((t) => dept === "all" || t.department === dept)
    .filter((t) => owner === "all" || t.assignee === owner)
    .filter((t) => cadence === "all" || t.cadence === cadence);

  const departments = Array.from(new Set(tasks.map((t) => t.department)));
  const owners = Array.from(new Set(tasks.map((t) => t.assignee)));

  return (
    <div className="page-shell max-w-[1400px]">
      {/* Header */}
      <div className="rise rise-1 flex items-end justify-between gap-4 mb-3">
        <div>
          <div className="meta">TASKS · 任务看板</div>
          <h1 className="display text-4xl mt-2">任务</h1>
        </div>
        {currentUser && ["president", "vice_president", "secretary", "head"].includes(currentUser.role) && <button onClick={() => setShowNew(true)} className="btn-outline px-4 h-8 text-sm">+ 新建任务</button>}
      </div>

      {/* Toolbar */}
      <div className="rise rise-2 flex items-center gap-4 mt-6 mb-8 flex-wrap">
        <PillGroup
          options={[{ key: "board", label: "看板" }, { key: "list", label: "列表" }]}
          value={view}
          onChange={setView}
        />

        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="bg-transparent border-b rule pb-1 text-sm focus:border-ink outline-none"
          style={{ borderColor: "var(--line)", fontFamily: "var(--font-sans)" }}
        >
          <option value="all">部门 · 全部</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="bg-transparent border-b rule pb-1 text-sm focus:border-ink outline-none"
          style={{ borderColor: "var(--line)", fontFamily: "var(--font-sans)" }}
        >
          <option value="all">人员 · 全部</option>
          {owners.map((id) => {
            const u = users.find((user) => user.id === id);
            return <option key={id} value={id}>{u?.name}</option>;
          })}
        </select>

        <div className="w-full overflow-x-auto sm:ml-auto sm:w-auto">
          <PillGroup
            options={CADENCE_FILTERS as unknown as { key: TaskCadence | "all"; label: string }[]}
            value={cadence}
            onChange={setCadence}
          />
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState title="没有匹配的任务" detail="调整筛选条件，或创建一项新任务。" /> : view === "board" ? <BoardView tasks={filtered} users={users} /> : <ListView tasks={filtered} users={users} />}
      {showNew && <TaskForm users={users} onCancel={() => setShowNew(false)} onSaved={async () => { setShowNew(false); await refresh(); }} />}
    </div>
  );
}

function BoardView({ tasks, users }: { tasks: Task[]; users: User[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 rise rise-3">
      {COLUMNS.map((col) => {
        const list = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="min-w-0">
            <div className="flex items-baseline justify-between border-b rule pb-3 mb-4">
              <h3 className="text-base font-medium text-ink">{col.label}</h3>
              <span className="meta">{String(list.length).padStart(2, "0")}</span>
            </div>
            <div className="space-y-3">
              {list.map((t) => <TaskCard key={t.id} task={t} users={users} />)}
              {list.length === 0 && (
                <div className="meta text-center py-6 border border-dashed rule">空</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, users }: { task: Task; users: User[] }) {
  const assignee = users.find((user) => user.id === task.assignee);
  const urgent = isUrgent(task.ddl) && task.status !== "done";
  const isRecurring = task.cadence !== "once";
  return (
    <article className="bg-card border rule rounded-[10px] p-3.5 hover:border-ink transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="meta">{task.id}</span>
          {isRecurring && (
            <span
              style={{
                fontSize: 10,
                border: "1px solid var(--line)",
                padding: "1px 5px",
                borderRadius: 4,
                color: "var(--ink-soft)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.06em",
              }}
            >
              {TASK_CADENCE_LABEL[task.cadence]}
            </span>
          )}
        </div>
        {urgent && <span className="meta" style={{ color: "var(--color-danger)" }}>⚠ DDL</span>}
      </div>
      <h4 className="text-[15px] leading-snug mb-3">{task.title}</h4>
      <div className="meta mb-2">{task.department}</div>
      {task.status === "doing" && task.progress != null && (
        <div className="mb-3">
          <div className="flex-1 h-px bg-rule relative">
            <div
              className="absolute left-0 -top-px h-0.5"
              style={{ width: `${task.progress}%`, background: "var(--ink)" }}
            />
          </div>
          <div className="meta mt-1.5">{task.progress}%</div>
        </div>
      )}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-ink-soft">DDL {task.ddl.slice(5)}</span>
        <span className="flex items-center gap-1.5">
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              background: "var(--paper-sunken)",
              color: "var(--ink-soft)",
              display: "grid",
              placeItems: "center",
              fontSize: 10,
              fontFamily: "var(--font-sans)",
            }}
          >
            {assignee?.name.slice(-1)}
          </span>
          <span className="text-ink-soft">{assignee?.name}</span>
        </span>
      </div>
    </article>
  );
}

function ListView({ tasks, users }: { tasks: Task[]; users: User[] }) {
  const sorted = [...tasks].sort((a, b) => a.ddl.localeCompare(b.ddl));
  return (
    <div className="table-scroll rise rise-3 border-t rule">
      <div className="min-w-[820px]">
      <div className="grid grid-cols-[100px_1fr_120px_100px_80px_80px_70px] gap-4 items-center py-3 border-b rule px-2">
        {["ID", "任务", "部门", "DDL", "负责人", "状态", "周期"].map((h) => (
          <span key={h} className="meta">{h}</span>
        ))}
      </div>
      {sorted.map((t) => {
        const assignee = users.find((user) => user.id === t.assignee);
        return (
          <div
            key={t.id}
            className="grid grid-cols-[100px_1fr_120px_100px_80px_80px_70px] gap-4 items-center py-3 border-b rule text-sm hover:bg-card/60 px-2"
          >
            <span className="meta">{t.id}</span>
            <span className="flex items-center gap-1.5">
              {t.title}
              {t.cadence !== "once" && (
                <span style={{ fontSize: 10, border: "1px solid var(--line)", padding: "1px 5px", borderRadius: 4, color: "var(--ink-soft)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                  {TASK_CADENCE_LABEL[t.cadence]}
                </span>
              )}
            </span>
            <span className="text-ink-soft text-xs">{t.department}</span>
            <span className="font-mono text-xs">{t.ddl}</span>
            <span className="text-xs">{assignee?.name}</span>
            <span className="meta text-xs">{TASK_STATUS_LABEL[t.status]}</span>
            <span className="text-xs text-ink-soft">
              {t.cadence === "once" ? "—" : TASK_CADENCE_LABEL[t.cadence]}
            </span>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function TaskForm({ users, onCancel, onSaved }: { users: User[]; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: "", department: users[0]?.department || "秘书处", ddl: new Date().toISOString().slice(0, 10), assignee: users[0]?.id || "", cadence: "once" as TaskCadence });
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await runAction("createTask", { ...form, status: "todo", progress: 0 }); onSaved(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "创建失败"); }
  };
  return (
    <div className="modal-backdrop fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50" onClick={onCancel}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="modal-panel bg-card border rule rounded-xl max-w-lg w-full p-5 sm:p-7 space-y-4">
        <h2 className="display text-2xl">新建任务</h2>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="任务名称" className="w-full bg-transparent border-b rule py-2 outline-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as User["department"] })} className="bg-transparent border-b rule py-2">
            {[...new Set(users.map((user) => user.department))].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input type="date" required value={form.ddl} onChange={(e) => setForm({ ...form, ddl: e.target.value })} className="bg-transparent border-b rule py-2" />
        </div>
        <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="w-full bg-transparent border-b rule py-2">
          {users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.department}</option>)}
        </select>
        {error && <p className="text-danger text-sm">{error}</p>}
        <div className="flex justify-end gap-3"><button type="button" onClick={onCancel}>取消</button><button type="submit" className="btn-outline px-4 py-2">创建</button></div>
      </form>
    </div>
  );
}
