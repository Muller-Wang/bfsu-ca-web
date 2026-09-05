"use client";

import { useState } from "react";
import { runAction, useClubData } from "@/lib/club-data";
import { EmptyState, SectionError, SectionLoading } from "@/components/ui/PageState";

export default function AdminCreditsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [hours, setHours] = useState("1");
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, loading, error, refresh } = useClubData();
  if (loading && !data) return <SectionLoading label="正在加载学时" />;
  if (error && !data) return <SectionError message={error} onRetry={() => void refresh()} />;
  if (!data) return null;
  const credits = data.credits;
  const avg = credits.length ? credits.reduce((s, c) => s + c.total, 0) / credits.length : 0;
  const semester = `${new Date().getFullYear()}-${new Date().getMonth() >= 7 ? "autumn" : "spring"}`;
  const exportCsv = () => {
    const rows = [["工号", "姓名", "部门", "累计学时", "本学期学时"], ...credits.map(({ user, total, semester: term }) => [user.workNo, user.name, user.department, String(total), String(term)])];
    const blob = new Blob(["\uFEFF" + rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `credits-${semester}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  const semesterTotal = credits.reduce((sum, item) => sum + item.semester, 0);
  const submit = async () => {
    setActionError("");
    try {
      await runAction("createCredit", { userId: selectedUser || credits[0]?.user.id, hours: Number(hours), semester, reason });
      setShowForm(false); setReason(""); await refresh();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "保存失败"); }
  };
  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-baseline mb-5">
        <h2 className="display text-2xl">
          学时管理 <span className="meta ml-2">本学期</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowForm(true)} className="px-3 py-2 text-sm border rule hover:border-ink">+ 录入学时</button>
          <button onClick={exportCsv} className="px-3 py-2 text-sm border rule hover:border-ink">↓ 导出 CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border rule p-4 bg-card">
          <div className="meta">人均学时</div>
          <div className="display text-3xl mt-2">{avg.toFixed(1)} h</div>
        </div>
        <div className="border rule p-4 bg-card">
          <div className="meta">达标人数</div>
          <div className="display text-3xl mt-2">{credits.filter((c) => c.total >= 20).length} / {credits.length}</div>
        </div>
        <div className="border rule p-4 bg-card">
          <div className="meta">本学期累计</div>
          <div className="display text-3xl mt-2">{semesterTotal} h</div>
        </div>
      </div>

      <div className="table-scroll border-t rule">
        <div className="min-w-[720px]">
        <div className="grid grid-cols-[140px_100px_120px_100px_100px_1fr] gap-4 py-3 border-b rule">
          {["工号", "姓名", "部门", "累计", "本学期", "操作"].map((h) => (
            <span key={h} className="meta">{h}</span>
          ))}
        </div>
        {credits.map(({ user, total, semester: term }) => (
          <div
            key={user.id}
            className="grid grid-cols-[140px_100px_120px_100px_100px_1fr] gap-4 py-3 border-b rule items-baseline text-sm hover:bg-card/60"
          >
            <span className="font-mono text-xs">{user.workNo}</span>
            <span>{user.name}</span>
            <span className="text-ink-soft">{user.department}</span>
            <span className="font-mono">
              {total} h
              {total < 20 && <span className="meta text-warn ml-1">⚠</span>}
            </span>
            <span className="font-mono text-ink-soft">{term} h</span>
            <span className="flex gap-3 text-xs">
              <button onClick={() => { setSelectedUser(user.id); setShowForm(true); }} className="border-b rule hover:border-ink">+ 录入</button>
            </span>
          </div>
        ))}
        </div>
      </div>
      {credits.length === 0 && <EmptyState title="暂无学时记录" detail="添加成员并录入学时后，会显示汇总。" />}
      {showForm && <div className="modal-backdrop fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50" onClick={() => setShowForm(false)}><div onClick={(e) => e.stopPropagation()} className="modal-panel bg-card border rule rounded-xl max-w-md w-full p-5 sm:p-7 space-y-4"><h2 className="display text-2xl">录入学时</h2><select value={selectedUser || credits[0]?.user.id || ""} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-transparent border-b rule py-2">{credits.map((item) => <option key={item.user.id} value={item.user.id}>{item.user.name} · {item.user.department}</option>)}</select><input type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full bg-transparent border-b rule py-2" placeholder="学时"/><input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-transparent border-b rule py-2" placeholder="录入说明"/>{actionError && <p className="text-sm text-danger" role="alert">{actionError}</p>}<div className="flex justify-end gap-3"><button onClick={() => setShowForm(false)}>取消</button><button disabled={!reason.trim() || Number(hours) < 0} onClick={() => void submit()} className="btn-outline px-4 py-2">保存</button></div></div></div>}
    </div>
  );
}
