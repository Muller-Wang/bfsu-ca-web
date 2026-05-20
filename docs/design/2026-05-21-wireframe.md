# 创协管理系统 · 线框图与设计语言

**日期：** 2026-05-21
**作者：** 墨乐 + Claude
**状态：** v0.1 高保真静态原型完成，等社团内部审阅

---

## 一、产品定位

北外创协内部管理系统。覆盖：公告、活动、任务、资料归档、个人学时、成员管理。

**核心用户 5 类：**

| 角色 | 权限 |
|------|------|
| 社长 / 副社长 | 全部权限 |
| 秘书处 | 行政模块全权限 |
| 部门部长 | 本部门数据 + 公共模块 |
| 正式成员 | 查看 + 个人模块 |
| 预备成员 | 只读 + 个人页 |

**登录：** 全部使用 **学号 + 密码** 登录（含 admin）。

---

## 二、设计语言

**风格定位：编辑部书桌（Editorial Stationery）**
不走 Linear 的"工程师极简"，也不走飞书的"企业感"。北外是人文气质的语言类高校，「创协」又是创作向社团，走编辑部 / 文学社的感觉：奶油底色、墨黑正文、酒红点缀、衬线大标题、瘦细分隔线。同时保留管理后台该有的高信息密度。

### 色板

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-paper` | `#f5f1e8` | 全局奶油纸背景 |
| `--color-card` | `#fcfaf4` | 卡片米白 |
| `--color-ink` | `#1a1614` | 正文墨黑 |
| `--color-ink-soft` | `#5c5651` | 次要文字铅灰 |
| `--color-rule` | `#e5dfd0` | 分隔线浅米 |
| `--color-accent` | `#7a1f2e` | 酒红强调（北外深红基调） |
| `--color-accent-soft` | `#a4394a` | 强调悬浮态 |
| `--color-success` | `#4a6b3a` | 橄榄绿 |
| `--color-warn` | `#b8731f` | 琥珀 |
| `--color-danger` | `#8c2a1f` | 砖红 |

### 字体

| 角色 | 字体 | 备注 |
|------|------|------|
| Display 大标题 | **Newsreader**（serif） | editorial 感，italic 用作装饰强调 |
| Body 正文 | **Geist Sans** | 干净不油，搭 PingFang SC 显示中文 |
| Mono 数据 / 标签 | **JetBrains Mono** | 学号、工号、日期、ID 一律 mono |

均通过 `next/font/google` 自托管，避开 Google Fonts 在国内的网络问题。

### 排版原则

- 大标题用 serif，metadata 用 mono small-caps，正文用 sans
- 段落 / 模块之间用 1px `--color-rule` 横线分隔，不用大色块卡片堆叠
- 列表、表格保持高密度、行高紧凑
- 中英双标随处可见（北外特色）：侧栏 `DASHBOARD / 主页`、tab `模板区 / TEMPLATES`
- 全局加 2.5% 不透明 SVG 纸面噪点，模拟纸张质感

---

## 三、信息架构 (IA)

```
登录页 /login
└─ 学号 + 密码（含 5 个角色快速切换 demo）

主壳 (TopBar + SideNav)
├── 主页 Dashboard          /
├── 日历  Calendar           /calendar
├── 任务  Tasks              /tasks
├── 资料库 Library          /library
├── 个人中心 Profile         /profile
└── ── (分隔线，仅秘书处/社长可见) ──
    管理后台 Admin           /admin
    ├── 成员管理              /admin
    ├── 活动管理              /admin/events
    ├── 学时管理              /admin/credits
    ├── 权限设置              /admin/permissions
    └── 系统公告              /admin/announcements
```

---

## 四、各页设计要点

### ① Dashboard（主页）
- Hero：欢迎语 + 当日待办计数（个性化叙事）
- 置顶公告（编号 #001 / #002，秘书处发布）
- 双栏：近期活动（左，日期大字+部门）/ 我的待办（右，含进度条）
- 社团动态 Activity Feed（轻量、可滚动）

### ② Calendar（日历）
- 月 / 周 / 列表视图切换
- 4 类彩色 dot 标签：学校任务 / 自办活动 / 内部工作 / DDL
- 日期格子保持纸面感（细横线分隔，不画格子线），事件用左侧 2px 色条
- 点击事件浮出详情卡片（含负责人、地点、附件）
- 仅秘书处可新建 / 编辑

### ③ Tasks（任务看板）
- 看板（4 列：待安排 / 进行中 / 待审核 / 已完成）/ 列表 双视图
- DDL 24h 内自动加 `⚠ DDL` 红色警示
- 卡片含进度条、负责人 avatar
- 部长看本部门 / 秘书处看全部门 / 成员只看分配给自己

### ④ Library（资料库）
- **模板区**：6 个模板卡片网格，下载按钮显眼
- **归档区**：按年 → 月时间线，编辑部叙事感
  - 数字年份 5xl 大字、米色（装饰用）
  - 月份用 mono small-caps
  - 每条归档左侧锚点 ◇，右侧 dot + 部门标签
- 顶部搜索（实时过滤）

### ⑤ Profile（个人中心）
- 身份卡：头像（衬线大字声调）+ 中英姓名 + 工号 / 学号 / 入会日期 + 状态标签
- 预备期人员展示「剩余天数」
- 4 个 tab：我的任务 / 我的活动 / 学时记录 / 我上传的文件
- **学时 tab** 含 3 个总览卡（累计/要求/本学期）+ 明细列表
- **活动 tab** 有显眼的「导出 PDF（用于简历）」按钮

### ⑥ Admin（管理后台）
- 左侧二级菜单（成员/活动/学时/权限/公告）
- 成员管理：表格 + 状态筛选，预备成员转正流程
- 学时管理：3 个 KPI 卡 + 表格 + 录入 / 导出
- 权限设置：模块 × 角色 矩阵，复选框 + 二次确认
- 系统公告：内嵌发布表单 + 列表（带置顶/编辑/删除）

---

## 五、技术决策

| 项 | 选择 | 理由 |
|----|------|------|
| 框架 | Next.js 16 + App Router | 与 ldreader-site 同栈，复用经验 |
| 样式 | Tailwind 4（`@theme` in CSS） | 现代，不需 config 文件 |
| 字体 | next/font/google | 自托管，避开国内 Google Fonts 慢 |
| 包管理器 | Bun | 用户偏好 |
| 状态 | localStorage mock auth | 原型阶段，未来切 Postgres + NextAuth |
| 数据库 | PostgreSQL（待接入） | 用户指定 |

---

## 六、已知 TODO（接入数据库前）

1. **Postgres schema**：users / departments / events / tasks / announcements / templates / archives / credits / sessions
2. **Auth**：学号 + 密码（bcrypt 哈希） + session cookie，或接 NextAuth Credentials Provider
3. **预备期转正**：默认 60 天 + 秘书处手动审批（PRD 决策待定，先按手动审批做）
4. **活动归档**：上传 zip 解压方案 vs 拖拽多文件方案，待社团内部讨论
5. **学时同步**：北外是否有官方学时系统，需要 sync 还是只我们这边记，待问
6. **通知系统**：内置 + 邮箱 + 飞书 webhook？

---

## 七、截图

见 `docs/screens/` 目录，包含登录 + 6 主页 + 3 admin 子页。
