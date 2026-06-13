"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { USERS } from "@/lib/mock/users";
import { ROLE_LABEL, type Role, type User } from "@/lib/types";
import { canRemoveMember, getStoredUser } from "@/lib/auth";

export default function AdminMembersPage() {
  const [status, setStatus] = useState<Role | "all">("all");
  const [dept, setDept] = useState<string>("all");
  const [members, setMembers] = useState<User[]>(USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const filtered = members.filter((u) => status === "all" || u.role === status)
    .filter((u) => dept === "all" || u.department === dept);

  const depts = Array.from(new Set(members.map((u) => u.department)));
  const allowRemove = canRemoveMember(currentUser);

  const handleRemove = (target: User) => {
    setMembers((prev) => prev.filter((u) => u.id !== target.id));
    setConfirmTarget(null);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="display text-2xl">
          成员名单 <span className="meta ml-2">{members.length} 人</span>
        </h2>
        <button className="px-4 py-2 text-sm btn-outline">
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
          <option value="vice_president">副社长</option>
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
            <span
              className={clsx(
                u.role === "probation"
                  ? "text-warn"
                  : u.role === "president" || u.role === "vice_president"
                  ? "text-accent"
                  : "text-success"
              )}
            >
              {ROLE_LABEL[u.role]}
            </span>
            <span className="font-mono text-xs text-ink-soft">{u.joinDate.slice(2, 7).replace("-", "/")}</span>
            <span className="flex items-center gap-2 text-xs">
              <button className="border-b rule hover:border-ink">查看</button>
              <button className="border-b rule hover:border-ink">编辑</button>
              {u.role === "probation" && (
                <button className="border-b rule text-accent hover:border-accent">转正</button>
              )}
              {allowRemove ? (
                <button
                  onClick={() => setConfirmTarget(u)}
                  className="border-b rule text-danger hover:border-danger"
                >
                  除名
                </button>
              ) : (
                <span
                  className="border-b border-transparent text-ink-soft/40 cursor-not-allowed"
                  title="仅社长可执行除名操作"
                >
                  除名
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Permission hint */}
      {!allowRemove && (
        <div className="mt-6 px-4 py-3 border-l-2 border-rule bg-card/50 text-sm text-ink-soft">
          <span className="meta mr-2">ⓘ 权限说明</span>
          「除名」仅社长可执行。副社长 / 秘书处可执行其他成员管理操作。
        </div>
      )}

      {/* Probation hint */}
      {filtered.some((u) => u.probationLeftDays) && (
        <div className="mt-3 px-4 py-3 border-l-2 border-warn bg-card/50 text-sm">
          <span className="meta text-warn mr-2">⓵ 提醒</span>
          预备期成员将在 60 天后自动提示秘书处审批转正
        </div>
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
              <div className="meta text-danger mb-2">⚠ DANGER · 不可撤销</div>
              <h3 className="display text-2xl">确认除名 {confirmTarget.name}？</h3>
            </div>
            <div className="px-7 py-5 text-sm text-ink-soft leading-relaxed">
              <p>
                被除名后，<span className="text-ink font-medium">{confirmTarget.name}</span>（{confirmTarget.workNo}）
                将立即失去系统访问权限。该操作不可恢复。
              </p>
              <p className="mt-3">
                ta 名下的 <span className="text-ink">在进行中任务</span> 将转给所在部门部长，<span className="text-ink">活动归档</span> 保留不变。
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
                onClick={() => handleRemove(confirmTarget)}
                className="text-sm px-4 py-2 btn-outline-danger"
              >
                确认除名
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
