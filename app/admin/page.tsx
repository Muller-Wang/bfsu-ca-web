"use client";

import { useState } from "react";
import clsx from "clsx";
import { ROLE_LABEL, type Department, type Role, type User } from "@/lib/types";
import { canRemoveMember, useCurrentUser } from "@/lib/auth";
import { runAction, useClubData } from "@/lib/club-data";
import { EmptyState, SectionError, SectionLoading } from "@/components/ui/PageState";

export default function AdminMembersPage() {
  const [status, setStatus] = useState<Role | "all">("all");
  const [dept, setDept] = useState<string>("all");
  const { user: currentUser } = useCurrentUser();
  const { data, loading, error, refresh } = useClubData();
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [actionError, setActionError] = useState("");

  if (loading && !data) return <SectionLoading label="正在加载成员" />;
  if (error && !data) return <SectionError message={error} onRetry={() => void refresh()} />;
  if (!data) return null;
  const members = data.users;

  const filtered = members.filter((u) => status === "all" || u.role === status)
    .filter((u) => dept === "all" || u.department === dept);

  const depts = Array.from(new Set(members.map((u) => u.department)));
  const allowRemove = canRemoveMember(currentUser);

  const handleRemove = async (target: User) => {
    setActionError("");
    try {
      await runAction("removeUser", { id: target.id });
      await refresh();
      setConfirmTarget(null);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "移除失败"); }
  };

  const promote = async (target: User) => {
    setActionError("");
    try {
      await runAction("updateUser", { id: target.id, role: "member" });
      await refresh();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "更新失败"); }
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-baseline mb-5">
        <h2 className="display text-2xl">
          成员名单 <span className="meta ml-2">{members.length} 人</span>
        </h2>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 text-sm btn-outline">
          + 添加成员
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
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
      {actionError && <div className="mb-4"><SectionError message={actionError} /></div>}

      <div className="table-scroll border-t rule">
        <div className="min-w-[860px]">
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
              {u.role === "probation" && (
                <button onClick={() => void promote(u)} className="border-b rule text-accent hover:border-accent">转正</button>
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
      </div>
      {filtered.length === 0 && <EmptyState title="没有匹配的成员" detail="调整状态或部门筛选条件。" />}

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

      {/* New member modal */}
      {showNew && (
        <MemberForm
          onCreated={() => {
            void refresh();
            setShowNew(false);
          }}
          onCancel={() => setShowNew(false)}
        />
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
                onClick={() => void handleRemove(confirmTarget)}
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

/* ── 添加成员表单 ── */

const DEPARTMENTS: Department[] = ["社长办", "秘书处", "外联部", "学术部", "宣传部"];

const ROLE_OPTIONS: Role[] = ["member", "probation", "head", "secretary", "vice_president", "president"];

function MemberForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    nameEn: "",
    department: "秘书处" as Department,
    role: "probation" as Role,
    title: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAction("createUser", {
      id: form.id, name: form.name, nameEn: form.nameEn || undefined,
      department: form.department, role: form.role, title: form.title || undefined, password: form.password,
    }).then(onCreated).catch((cause) => setError(cause instanceof Error ? cause.message : "创建失败"));
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel bg-card border rule rounded-sm max-w-lg w-full shadow-2xl"
      >
        <div className="px-7 py-6 border-b rule">
          <div className="meta mb-2">NEW MEMBER · 账号录入</div>
          <h3 className="display text-2xl">添加成员</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="meta text-xs block mb-1">学号（登录账号）*</label>
              <input
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm font-mono"
                placeholder="26110301001"
                required
              />
            </div>
            <div>
              <label className="meta text-xs block mb-1">初始密码 *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm font-mono"
                placeholder="至少 8 位"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="meta text-xs block mb-1">姓名 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
                required
              />
            </div>
            <div>
              <label className="meta text-xs block mb-1">拼音 / 英文名</label>
              <input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
                placeholder="Zhang San"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="meta text-xs block mb-1">部门 *</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value as Department })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="meta text-xs block mb-1">状态 *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="meta text-xs block mb-1">职务</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
                placeholder="干事"
              />
            </div>
          </div>

          <p className="meta text-[10px] leading-relaxed">
            工号自动生成 · 入会日期为今天 · 预备成员默认 60 天预备期
          </p>

          {error && <div className="text-sm text-danger">{error}</div>}

          <div className="flex justify-end gap-3 pt-4 border-t rule mt-4">
            <button type="button" onClick={onCancel} className="text-sm px-4 py-2 hover:text-ink">
              取消
            </button>
            <button type="submit" className="text-sm px-4 py-2 btn-outline">
              创建账号
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
