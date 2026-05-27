# bfsu-ca · 进度

> 北外创协内部管理系统。Next.js 16 + Tailwind 4 + Bun，未来接 PostgreSQL。

## 当前状态

**v0.1 高保真静态原型完成**（2026-05-27）
- 7 个主页面 + 1 登录页 + 6 个 admin 子页全部跑通
- 10 名 mock 用户、覆盖 6 种角色（含副社长）
- 编辑部书桌（Editorial Stationery）设计语言落地
- 无后端，localStorage mock auth

**截图：** `docs/screens/00-20-*.png`
**设计文档：** `docs/design/2026-05-21-wireframe.md`

## 启动

```bash
cd ~/projects/bfsu-ca
bun dev        # http://localhost:3100
```

快速切换角色：登录页底部有 5 个 demo 用户按钮（社长 / 副社长 / 秘书处 / 部长 / 学术部长）。
社长（张明 23110301001）、副社长（墨乐 23110301007）、秘书处（林思齐 23110301099）登录后侧栏多一个「管理后台」入口。

## 路由

| 路由 | 页面 | 权限 |
|------|------|------|
| `/login` | 登录（学号 + 密码） | 公开 |
| `/` | Dashboard 主页 | 全员 |
| `/calendar` | 日历 | 全员 |
| `/tasks` | 任务看板 | 全员（视图按角色过滤） |
| `/workspace` | 外联工作区（外联进度 + 书信模版下载） | 全员 |
| `/library` | 资料库（模板含二级分类 + 归档） | 全员 |
| `/profile` | 个人中心（任务/活动/学时/文件） | 全员 |
| `/admin` | 成员管理 | 仅社长/副社长/秘书处 |
| `/admin/events` | 活动管理 | 仅社长/副社长/秘书处 |
| `/admin/credits` | 学时管理 | 仅社长/副社长/秘书处 |
| `/admin/templates` | 模板管理（增删改查） | 仅社长/副社长/秘书处 |
| `/admin/permissions` | 权限设置 | 仅社长/副社长/秘书处 |
| `/admin/announcements` | 系统公告 | 仅社长/副社长/秘书处 |

## 下一步

按优先级：

1. **拿原型给社团内部审阅** — 截图发群，看 6 个页面是否符合各部门预期
2. **Postgres schema 设计** — 8 张表（users / departments / events / tasks / announcements / templates / archives / credits / sessions）
3. **Auth 接入** — 学号 + bcrypt 密码 + session cookie；先不上 NextAuth，自己写更可控
4. **数据接入** — 把 `lib/mock/data.ts` 换成 server actions + Postgres 查询
5. **预备期审批流** — 60 天到期由秘书处手动转正（默认方案）
6. **活动归档上传** — 多文件拖拽 + 自动按活动名分桶

## 待用户决策

- [ ] 北外有没有官方学时系统？我们这边只记录还是要同步？
- [ ] 通知怎么发：内站消息 / 邮箱 / 飞书 webhook？
- [ ] 部署在哪：自建 VPS / Vercel + Neon / 学校机房？

## 技术栈

| 项 | 版本 |
|----|------|
| Next.js | 16.2.6（Turbopack） |
| React | 19.2.4 |
| Tailwind | 4.3.0（`@theme` in CSS） |
| TypeScript | 5.9.3 |
| Bun | runtime + pm |
| 字体 | next/font/google（Newsreader / Geist / JetBrains Mono） |

## 目录结构

```
bfsu-ca/
├── app/
│   ├── layout.tsx          # 字体注入 + AppShell
│   ├── globals.css         # Tailwind 4 主题 + editorial 工具类
│   ├── page.tsx            # Dashboard
│   ├── login/page.tsx
│   ├── calendar/page.tsx
│   ├── tasks/page.tsx
│   ├── workspace/page.tsx  # 外联工作区（外联跟踪 + 书信模版）
│   ├── library/page.tsx    # 资料库（模板二级分类 + 归档）
│   ├── profile/page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx              # members
│       ├── events/page.tsx
│       ├── credits/page.tsx
│       ├── templates/page.tsx    # 模板 CRUD
│       ├── permissions/page.tsx
│       └── announcements/page.tsx
├── components/shell/
│   ├── AppShell.tsx       # 路由守卫 + 布局
│   ├── TopBar.tsx
│   └── SideNav.tsx
├── lib/
│   ├── types.ts           # 含 LiaisonEntry / TemplateCategory 等新增类型
│   ├── auth.ts            # localStorage mock auth
│   └── mock/
│       ├── users.ts
│       └── data.ts        # + LIAISONS (11条外联记录) + 6封书信模版
└── docs/
    ├── design/2026-05-21-wireframe.md
    └── screens/           # 21 张验证截图
```
