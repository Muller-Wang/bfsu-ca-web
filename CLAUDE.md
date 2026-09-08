# bfsu-ca · CLAUDE.md

> 北外创协内部管理系统。给 AI 协作者的项目规范。继承 `~/.claude/CLAUDE.md` 全局规则，本文件只写**本项目特有**的约定。

---

## 一、新会话上手顺序

1. 读 `PROGRESS.md` — 当前进度、下一步、阻塞项
2. 读 `docs/design/2026-05-21-wireframe.md` — IA 与设计语言
3. 看 `docs/screens/` 截图 — 知道现在长什么样
4. 跑 `bun dev` 验证当前状态，再动手

---

## 二、技术栈（不可随意切换）

| 项 | 版本 | 备注 |
|----|------|------|
| Next.js | **16.x** App Router | `params` 是 Promise，`middleware.ts` 已改名 `proxy.ts` |
| React | 19.x | |
| Tailwind | **4.x** | 配置写在 `app/globals.css` 的 `@theme {}`，**不要**建 `tailwind.config.js` |
| TypeScript | 5.x，strict | |
| 包管理器 | **Bun**，不用 npm/yarn/pnpm | `bun install` / `bun dev` |
| 字体 | **`next/font/google`** 自托管 | 国内访问 Google Fonts 慢，**绝不**用 `<link>` 直连 fonts.googleapis.com |
| 数据库 | PostgreSQL（待接入） | server actions + `pg` 或 Drizzle，**不上 Prisma**（用户偏好） |
| 端口 | **3100**（dev / start） | 避开 3000，3000 留给 ldreader-site |

---

## 三、目录结构

```
bfsu-ca/
├── app/                    # 路由 + 页面（App Router）
│   ├── layout.tsx          # 注入 3 个 next/font + AppShell
│   ├── globals.css         # Tailwind 4 @theme + editorial 工具类
│   ├── page.tsx            # Dashboard
│   ├── login/page.tsx
│   ├── (calendar|tasks|library|profile)/page.tsx
│   └── admin/
│       ├── layout.tsx      # 左侧二级菜单 + 权限文案
│       └── (page|events|credits|permissions|announcements)/page.tsx
├── components/
│   ├── shell/              # 全局壳层（TopBar/SideNav/AppShell）
│   └── ui/                 # 复用组件，按需建
├── lib/
│   ├── types.ts            # 所有类型定义 + label 映射在这里
│   ├── auth.ts             # 当前是 localStorage mock，接 Postgres 后改为 server-side session
│   └── mock/
│       ├── users.ts
│       └── data.ts         # events / tasks / templates / archive / feed / announcements
└── docs/
    ├── design/             # 设计决策按日期命名 YYYY-MM-DD-xxx.md
    └── screens/            # 验证截图按 NN-name.png 命名
```

**约定：**
- 业务类型一律在 `lib/types.ts`，别散在各 page
- 角色 / 状态等枚举的中文 label 用 `*_LABEL` 字典（如 `ROLE_LABEL`），别在组件里到处写 if/switch
- 颜色 / 字号 / 间距用 Tailwind utility，**不**写 inline style，除非动态计算（如进度条宽度、tag dot 色值）

---

## 四、设计语言（编辑部书桌 / Editorial Stationery）

**核心原则：奶油纸底 + 墨黑正文 + 酒红点缀 + 衬线大标题 + 瘦细分隔线。不是工程师极简，也不是企业感。**

### 颜色（全部在 `globals.css` `@theme` 里）

```
paper      #f5f1e8   背景
card       #fcfaf4   卡片
ink        #1a1614   正文
ink-soft   #5c5651   次要
rule       #e5dfd0   分隔线
accent     #7a1f2e   酒红强调（北外深红）
success    #4a6b3a   橄榄绿
warn       #b8731f   琥珀
danger     #8c2a1f   砖红
```

**绝不用：纯白 `#ffffff`、纯黑 `#000000`、紫色渐变、霓虹色、Apple/Material 蓝。**

### 字体三件套（CSS 变量已配好）

| 用途 | font-family | 何时用 |
|------|-------------|-------|
| 大标题 / 强调 | `var(--font-serif)` Newsreader | 页面 h1/h2、装饰性 italic、数字大字 |
| 正文 / UI | `var(--font-sans)` Geist | 默认 body |
| 数据 / 标签 | `var(--font-mono)` JetBrains Mono | 学号、工号、日期、ID、ENGLISH METADATA |

### 工具类（必须用，别重写）

| class | 用途 |
|-------|------|
| `.display` | 衬线大标题，自动 `letter-spacing: -0.02em` |
| `.meta` | 小号 mono small-caps 元信息（页面常见的英文标签） |
| `.rule` | 取代 `border-gray-200`，分隔线统一色 |
| `.small-caps` | 大写小字符 + tracking |
| `.dot` | 8px 圆点（用 `style={{ color: x }}` 控色，tag 标识用） |
| `.rise / .rise-N` | 入场动画，页面顶层装饰 |

### 排版原则

- 模块之间用 `<hr className="border-t rule my-10" />` 分隔，**不**堆卡片
- 双语标题：中文衬线大字 + 英文 mono small-caps（如 `主页` + `DASHBOARD`）
- 数字、ID、日期一律 mono
- 表格 / 列表保持高密度，行高紧凑（`py-3` 起步）

---

## 五、权限模型

5 种角色，**所有角色一律学号 + 密码登录**（不要做手机号/邮箱/扫码登录）：

| Role | 中文 | 看 Admin？ |
|------|------|-----------|
| `president` | 社长 | ✓ |
| `secretary` | 办公室 | ✓ |
| `head` | 部长 | ✗ |
| `member` | 正式成员 | ✗ |
| `probation` | 预备成员 | ✗ |

`canSeeAdmin()` 在 `lib/auth.ts`。Admin 入口在侧栏按权限**动态隐藏**（不要灰显）。

接 Postgres 后：
- 密码用 bcrypt 哈希（cost ≥ 12）
- session 走 httpOnly cookie，不放 token 在 localStorage
- 预备期默认 60 天，到期由办公室**手动**审批转正

---

## 六、本项目开发约定

1. **改完跑 `bun dev`，浏览器打开 localhost:3100 真看一遍**，不要只看 TS 编译过了就 say done
2. **跑 Playwright 截图存到 `docs/screens/`** 留证据（特别是改了视觉的）
3. **每个独立功能一个 commit**，message 用英文动词开头（`add: ...` / `fix: ...` / `refactor: ...`）
4. **频繁提交**，不要把一周的活塞一个 PR
5. **mock 数据放 `lib/mock/data.ts`**，未来切真数据库时只换数据源、不动 UI 组件
6. **接 Postgres 时**：每张表先写 migration，再 server action，再前端，**TDD 顺序**
7. **遇到日期 / 时间**：永远用 `YYYY-MM-DD` 字符串，渲染时再 `toLocaleDateString`；**不要**把 Date 对象到处传

---

## 七、不要做的事

- ❌ 不要直接 `<link href="https://fonts.googleapis.com/...">` — 国内访问会超时
- ❌ 不要建 `tailwind.config.js` — Tailwind 4 配置走 CSS `@theme`
- ❌ 不要在组件里写 inline `style={{ backgroundColor: '#xxx' }}` 除非动态计算
- ❌ 不要用 Inter / Roboto / Arial / 紫色渐变这些通用 AI 美学
- ❌ 不要为「可能用到」抽象组件，**3 处相似才抽**
- ❌ 不要 `git push` 除非用户明说
- ❌ 不要把密码 / token / 学号 mapping 写进代码 — 接数据库后这些都是 db 配置
- ❌ 不要给 admin 入口做「灰显但不可点」的设计 — 直接隐藏，避免预备成员看到误以为有

---

## 八、未来路线（不要超前实现，仅供方向参考）

按优先级：

1. **Postgres schema** — users / departments / events / tasks / announcements / templates / archives / credits / sessions
2. **Auth 接入** — 学号 + bcrypt + cookie session（不上 NextAuth，自己写 60 行更可控）
3. **server actions** 替换所有 `lib/mock/data.ts` 调用
4. **预备期 60 天审批流**
5. **活动归档上传**（多文件拖拽 + 按活动名分桶）
6. **通知系统**（站内 + 邮箱 / 飞书 webhook 待定）

---

## 九、启动 / 命令

```bash
bun install              # 装依赖
bun dev                  # http://localhost:3100
bun run build            # 生产构建
bun start                # 跑构建产物
bun run lint             # ESLint
```

无 test 命令（原型阶段无测试，接 Postgres 时同步加 Vitest + integration tests）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
