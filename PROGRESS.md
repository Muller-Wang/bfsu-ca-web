# bfsu-ca · 进度

> 北京外国语大学创客俱乐部内部管理系统。封面标题：创意，在北外。

## 当前状态

**v0.3 P0 + P1 上线基础完成**（2026-09-05）

- Next.js 16 + PostgreSQL 数据层，页面不再直接读取 mock 数据
- 学号/密码登录、bcrypt 密码、HttpOnly 签名会话与服务端角色权限
- 成员、活动、任务、公告、学时、模板和点子关键操作已接真实 API
- 模板文件支持鉴权上传与下载；安全响应头、同源校验和登录限流已启用
- Demo 内容保留在 `lib/mock/`，但仅在服务端 `DEMO_MODE=1` 时启用
- 默认正式模式不返回 demo 账号，不开放 demo 登录接口
- 普通登录页不显示 Demo；仅 `/login?presentation=1` 可在演示环境调出角色切换
- 完成手机端导航、页面布局、日历/宽表滑动和移动端表单适配
- 补齐加载骨架、空状态、操作错误反馈、键盘焦点、404 与全局错误页
- 资料库归档筛选已真实生效，主页活动与公告统计来自实时数据

## 启动

正式模式需要 PostgreSQL：

```bash
cp .env.example .env.local
bun run db:schema
bun run db:seed
bun run dev
```

临时展示模式：

```bash
DEMO_MODE=1 bun run dev
```

两种模式均访问 `http://localhost:3100`。完整配置和上线步骤见 `README.md`。

## 验证

```bash
bun run lint
bun run typecheck
bun run build
bun audit
```

## 下一阶段（P2）

- 邮件/飞书通知与文件对象存储（取决于部署选择）
- PostgreSQL 环境的自动化集成测试与备份恢复演练
- 操作审计查询、会话管理和更细粒度的权限配置

## 待确认

- 北外官方学时系统是仅做记录，还是需要同步
- 通知渠道采用站内、邮箱还是飞书 webhook
- 部署采用自建 VPS、Vercel + Neon，还是学校机房
