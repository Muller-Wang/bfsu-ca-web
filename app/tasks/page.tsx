"use client";

import { useState } from "react";
import clsx from "clsx";
import { TASKS } from "@/lib/mock/data";
import { findUser } from "@/lib/mock/users";
import { TASK_STATUS_LABEL, type Task, type TaskStatus } from "@/lib/types";

const COLUMNS: { key: TaskStatus; tone: string }[] = [
  { key: "todo", tone: "text-ink-soft" },
  { key: "doing", tone: "text-accent" },
  { key: "review", tone: "text-warn" },
  { key: "done", tone: "text-success" },
];

function isUrgent(ddl: string) {
  const d = new Date(ddl).getTime();
  const today = new Date("2026-05-21").getTime();
  return d - today < 24 * 3600 * 1000 * 2 && d >= today;
}

export default function TasksPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [dept, setDept] = useState<string>("all");
  const [owner, setOwner] = useState<string>("all");

  const filtered = TASKS.filter((t) => (dept === "all" || t.department === dept))
    .filter((t) => owner === "all" || t.assignee === owner);

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
        <button className="px-4 py-2 text-sm bg-accent text-card hover:bg-accent-soft transition-colors">
          + 新建任务
        </button>
      </div>

      {/* Toolbar */}
      <div className="rise rise-2 flex items-center gap-3 mt-6 mb-8">
        <div className="flex items-center border rule">
          <button
            onClick={() => setView("board")}
            className={clsx("px-3 py-1.5 text-sm", view === "board" ? "bg-ink text-card" : "hover:bg-card")}
          >
            看板
          </button>
          <button
            onClick={() => setView("list")}
            className={clsx("px-3 py-1.5 text-sm", view === "list" ? "bg-ink text-card" : "hover:bg-card")}
          >
            列表
          </button>
        </div>

        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="bg-transparent border-b rule pb-1 text-sm focus:border-ink outline-none"
        >
          <option value="all">部门 · 全部</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="bg-transparent border-b rule pb-1 text-sm focus:border-ink outline-none"
        >
          <option value="all">人员 · 全部</option>
          {owners.map((id) => {
            const u = findUser(id);
            return <option key={id} value={id}>{u?.name}</option>;
          })}
        </select>
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
              <h3 className={clsx("display text-lg", col.tone)}>{TASK_STATUS_LABEL[col.key]}</h3>
              <span className="meta">{String(list.length).padStart(2, "0")}</span>
            </div>
            <div className="space-y-3">
              {list.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
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
  return (
    <article className="bg-card border rule rounded-sm p-3.5 hover:border-ink transition-colors group cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="meta">{task.id}</span>
        {urgent && <span className="meta text-danger">⚠ DDL</span>}
      </div>
      <h4 className="text-[15px] leading-snug mb-3">{task.title}</h4>
      <div className="meta mb-2">{task.department}</div>
      {task.status === "doing" && task.progress != null && (
        <div className="mb-3">
          <div className="flex-1 h-px bg-rule relative">
            <div
              className="absolute left-0 -top-px h-0.5 bg-accent"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <div className="meta mt-1.5">{task.progress}%</div>
        </div>
      )}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-ink-soft">DDL {task.ddl.slice(5)}</span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-accent/15 text-accent grid place-items-center text-[10px]">
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
      {sorted.map((t) => {
        const assignee = findUser(t.assignee);
        return (
          <div
            key={t.id}
            className="grid grid-cols-[100px_1fr_140px_120px_100px_80px] gap-4 items-center py-3 border-b rule text-sm hover:bg-card/60 px-2"
          >
            <span className="meta">{t.id}</span>
            <span>{t.title}</span>
            <span className="text-ink-soft">{t.department}</span>
            <span className="font-mono text-xs">{t.ddl}</span>
            <span className="meta">{assignee?.name}</span>
            <span className="meta text-accent">{TASK_STATUS_LABEL[t.status]}</span>
          </div>
        );
      })}
    </div>
  );
}
