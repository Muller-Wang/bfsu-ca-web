"use client";

const PERMISSIONS = [
  { module: "公告管理",   desc: "发布主页置顶公告",       roles: { president: true,  vice_president: true,  secretary: true,  head: false, member: false, probation: false } },
  { module: "活动管理",   desc: "新建 / 编辑活动，绑定负责人", roles: { president: true,  vice_president: true,  secretary: true,  head: true,  member: false, probation: false } },
  { module: "活动删除",   desc: "撤销误建活动",            roles: { president: true,  vice_president: true,  secretary: true,  head: false, member: false, probation: false } },
  { module: "任务分配",   desc: "向部门成员派发任务",       roles: { president: true,  vice_president: true,  secretary: true,  head: true,  member: false, probation: false } },
  { module: "学时录入",   desc: "录入和导出学时",          roles: { president: true,  vice_president: true,  secretary: true,  head: false, member: false, probation: false } },
  { module: "成员添加",   desc: "新增成员、修改职务",       roles: { president: true,  vice_president: true,  secretary: true,  head: false, member: false, probation: false } },
  { module: "成员除名",   desc: "移除成员（不可撤销）",     roles: { president: true,  vice_president: false, secretary: false, head: false, member: false, probation: false } },
  { module: "模板管理",   desc: "上传 / 更新模板",         roles: { president: true,  vice_president: true,  secretary: true,  head: false, member: false, probation: false } },
  { module: "活动归档",   desc: "归档已完成活动",          roles: { president: true,  vice_president: true,  secretary: true,  head: true,  member: false, probation: false } },
  { module: "权限修改",   desc: "修改本表（仅社长）",       roles: { president: true,  vice_president: false, secretary: false, head: false, member: false, probation: false } },
  { module: "查看任务",   desc: "查看分配给自己的任务",     roles: { president: true,  vice_president: true,  secretary: true,  head: true,  member: true,  probation: true } },
];

const ROLES: { key: keyof typeof PERMISSIONS[0]["roles"]; label: string }[] = [
  { key: "president", label: "社长" },
  { key: "vice_president", label: "副社长" },
  { key: "secretary", label: "办公室" },
  { key: "head", label: "部长" },
  { key: "member", label: "正式" },
  { key: "probation", label: "预备" },
];

export default function AdminPermissionsPage() {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="display text-2xl">权限设置</h2>
      </div>
      <p className="meta mb-6">当前权限策略由服务端强制执行。需要调整时应通过受审计的配置变更发布。</p>

      <div className="table-scroll border-t rule">
        <div className="min-w-[760px]">
        <div className="grid grid-cols-[1fr_1.2fr_repeat(6,56px)] gap-2 py-3 border-b rule">
          <span className="meta">模块</span>
          <span className="meta">说明</span>
          {ROLES.map((r) => (
            <span key={r.key} className="meta text-center">{r.label}</span>
          ))}
        </div>

        {PERMISSIONS.map((p) => (
          <div
            key={p.module}
            className="grid grid-cols-[1fr_1.2fr_repeat(6,56px)] gap-2 py-3 border-b rule items-center text-sm"
          >
            <span>{p.module}</span>
            <span className="text-ink-soft text-xs">{p.desc}</span>
            {ROLES.map((r) => (
              <span key={r.key} className="text-center">
                <span aria-label={p.roles[r.key] ? "允许" : "不允许"}>{p.roles[r.key] ? "✓" : "—"}</span>
              </span>
            ))}
          </div>
        ))}
        </div>
      </div>

      <div className="mt-6 px-4 py-3 border-l-2 border-rule bg-card/50 text-sm text-ink-soft">
        <span className="meta mr-2">ⓘ 角色说明</span>
        <span className="text-accent">社长 / 副社长</span> 拥有几乎全部权限；
        <span className="text-ink">「成员除名」与「权限修改」</span>仅限社长。
      </div>
    </div>
  );
}
