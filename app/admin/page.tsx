"use client";

import { useState } from "react";
import clsx from "clsx";
import { USERS } from "@/lib/mock/users";
import { ROLE_LABEL, type Role } from "@/lib/types";

export default function AdminMembersPage() {
  const [status, setStatus] = useState<Role | "all">("all");
  const [dept, setDept] = useState<string>("all");

  const filtered = USERS.filter((u) => status === "all" || u.role === status)
    .filter((u) => dept === "all" || u.department === dept);

  const depts = Array.from(new Set(USERS.map((u) => u.department)));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="display text-2xl">
          成员名单 <span className="meta ml-2">{USERS.length} 人</span>
        </h2>
        <button className="px-4 py-2 text-sm bg-accent text-card hover:bg-accent-soft transition-colors">
          + 添加成员
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6 text-sm">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Role | "all")}
          className="bg-transparent border-b rule pb-1 focus:border-ink outline-none"
        >
          <option value="all">状态 · 全部</option>
          <option value="president">社长</option>
          <option value="secretary">秘书处</option>
          <option value="head">部长</option>
          <option value="member">正式成员</option>
          <option value="probation">预备成员</option>
        </select>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="bg-transparent border-b rule pb-1 focus:border-ink outline-none"
        >
          <option value="all">部门 · 全部</option>
          {depts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="border-t rule">
        <div className="grid grid-cols-[140px_100px_100px_90px_100px_90px_160px] gap-4 py-3 border-b rule">
          {["工号", "姓名", "部门", "职务", "状态", "入会", "操作"].map((h) => (
            <span key={h} className="meta">{h}</span>
          ))}
        </div>

        {filtered.map((u) => (
          <div
            key={u.id}
            className="grid grid-cols-[140px_100px_100px_90px_100px_90px_160px] gap-4 py-3 border-b rule items-baseline text-sm hover:bg-card/60"
          >
            <span className="font-mono text-xs">{u.workNo}</span>
            <span>
              {u.name}
              <span className="meta ml-2 text-[10px]">{u.nameEn}</span>
            </span>
            <span className="text-ink-soft">{u.department}</span>
            <span className="text-ink-soft">{u.title}</span>
            <span className={clsx(u.role === "probation" ? "text-warn" : "text-success")}>
              {ROLE_LABEL[u.role]}
            </span>
            <span className="font-mono text-xs text-ink-soft">{u.joinDate.slice(2, 7).replace("-", "/")}</span>
            <span className="flex items-center gap-2 text-xs">
              <button className="border-b rule hover:border-ink">查看</button>
              <button className="border-b rule hover:border-ink">编辑</button>
              {u.role === "probation" && (
                <button className="border-b rule text-accent hover:border-accent">转正</button>
              )}
              <button className="border-b rule text-danger hover:border-danger">移除</button>
            </span>
          </div>
        ))}
      </div>

      {/* Probation hint */}
      {filtered.some((u) => u.probationLeftDays) && (
        <div className="mt-6 px-4 py-3 border-l-2 border-warn bg-card/50 text-sm">
          <span className="meta text-warn mr-2">⓵ 提醒</span>
          预备期成员将在 60 天后自动提示秘书处审批转正
        </div>
      )}
    </div>
  );
}
