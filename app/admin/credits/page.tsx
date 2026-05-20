"use client";

import { USERS } from "@/lib/mock/users";

// Mock credits per user
const CREDITS = USERS.map((u, i) => ({
  user: u,
  total: 28 - i * 2,
  semester: 8 + (i % 4),
}));

export default function AdminCreditsPage() {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="display text-2xl">
          学时管理 <span className="meta ml-2">本学期</span>
        </h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-sm border rule hover:border-ink">+ 录入学时</button>
          <button className="px-3 py-2 text-sm border rule hover:border-ink">↓ 导出 CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rule p-4 bg-card">
          <div className="meta">人均学时</div>
          <div className="display text-3xl mt-2">18.4 h</div>
        </div>
        <div className="border rule p-4 bg-card">
          <div className="meta">达标人数</div>
          <div className="display text-3xl mt-2">{CREDITS.filter((c) => c.total >= 20).length} / {CREDITS.length}</div>
        </div>
        <div className="border rule p-4 bg-card">
          <div className="meta">本月新增</div>
          <div className="display text-3xl mt-2">+ 42 h</div>
        </div>
      </div>

      <div className="border-t rule">
        <div className="grid grid-cols-[140px_100px_120px_100px_100px_1fr] gap-4 py-3 border-b rule">
          {["工号", "姓名", "部门", "累计", "本学期", "操作"].map((h) => (
            <span key={h} className="meta">{h}</span>
          ))}
        </div>
        {CREDITS.map(({ user, total, semester }) => (
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
            <span className="font-mono text-ink-soft">{semester} h</span>
            <span className="flex gap-3 text-xs">
              <button className="border-b rule hover:border-ink">明细</button>
              <button className="border-b rule hover:border-ink">+ 录入</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
