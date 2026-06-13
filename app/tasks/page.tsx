"use client";

import { useState } from "react";
import { TASKS } from "@/lib/mock/data";
import { findUser } from "@/lib/mock/users";
import { TASK_CADENCE_LABEL, TASK_STATUS_LABEL, type Task, type TaskCadence, type TaskStatus } from "@/lib/types";

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
  const d = new Date(ddl).getTime();
  const today = new Date("2026-05-21").getTime();
  return d - today < 24 * 3600 * 1000 * 2 && d >= today;
}

/* Reusable pill segmented control */
function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "inline-flex", gap: 2, padding: 3, background: "var(--paper-sunken)", borderRadius: 999, border: "1px solid var(--line-faint)" }}>
      {options.map(({ key, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: "4px 12px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-mute)",
              fontWeight: active ? 500 : 400,
              boxShadow: active ? "var(--shadow-xs)" : "none",
              transition: "background 120ms, color 120ms",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function TasksPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [dept, setDept] = useState<string>("all");
  const [owner, setOwner] = useState<string>("all");
  const [cadence, setCadence] = useState<TaskCadence | "all">("all");

  const filtered = TASKS
    .filter((t) => dept === "all" || t.department === dept)
    .filter((t) => owner === "all" || t.assignee === owner)
    .filter((t) => cadence === "all" || t.cadence === cadence);

  const departments = Array.from(new Set(TASKS.map((t) => t.department)));
  const owners = Array.from(new Set(TASKS.map((t) => t.assignee)));

  return (
    <div className="px-10 py-10 max-w-[1400px]">
      {/* Header */}
      <div className="rise rise-1 flex items-end justify-between mb-3">
        <div>
          <div className="meta">TASKS · 任务看板</div>
          <h1 className="display text-4xl mt-2">任务</h1>
        </div>
        <button
          style={{ display: "inline-flex", alignItems: "center", height: "2rem", padding: "0 1rem", fontSize: 13, fontWeight: 500, color: "#fff", background: "var(--ink)", border: "none", borderRadius: 999, cursor: "pointer" }}
        >
          + 新建任务
        </button>
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
            const u = findUser(id);
            return <option key={id} value={id}>{u?.name}</option>;
          })}
        </select>

        <div className="ml-auto">
          <PillGroup
            options={CADENCE_FILTERS as unknown as { key: TaskCadence | "all"; label: string }[]}
            value={cadence}
            onChange={setCadence}
          />
        </div>
      </div>

      {view === "board" ? <BoardView tasks={filtered} /> : <ListView tasks={filtered} />}
    </div>
  );
}

function BoardView({ tasks }: { tasks: Task[] }) {
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
              {list.map((t) => <TaskCard key={t.id} task={t} />)}
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

function TaskCard({ task }: { task: Task }) {
  const assignee = findUser(task.assignee);
  const urgent = isUrgent(task.ddl) && task.status !== "done";
  const isRecurring = task.cadence !== "once";
  return (
    <article className="bg-card border rule rounded-[10px] p-3.5 hover:border-ink transition-colors cursor-pointer">
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

function ListView({ tasks }: { tasks: Task[] }) {
  const sorted = [...tasks].sort((a, b) => a.ddl.localeCompare(b.ddl));
  return (
    <div className="rise rise-3 border-t rule">
      <div className="grid grid-cols-[100px_1fr_120px_100px_80px_80px_70px] gap-4 items-center py-3 border-b rule px-2">
        {["ID", "任务", "部门", "DDL", "负责人", "状态", "周期"].map((h) => (
          <span key={h} className="meta">{h}</span>
        ))}
      </div>
      {sorted.map((t) => {
        const assignee = findUser(t.assignee);
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
  );
}
