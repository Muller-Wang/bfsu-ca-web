# 北京外国语大学创客俱乐部系统

Next.js 16、PostgreSQL 14+、Bun。生产模式使用服务端认证与数据库；演示数据由独立的服务端开关控制。

## 本地演示

```bash
bun install
DEMO_MODE=1 bun run dev
```

打开 <http://localhost:3100/login?presentation=1> 后会显示五个演示角色；普通 `/login` 不展示演示入口。演示数据的修改在服务重启后复原。

## 生产配置

正式模式不会加载演示业务数据，`/revised` 自动回到正式首页，旧演示会话失效。
展示代码与 mock 数据保留；仅在独立演示实例设置 `DEMO_MODE=1` 时启用。
GitHub 展示快照：`backup/bauhaus-four-departments-20260907`（`9d41f94`）。
当前本地关闭演示后，须配置数据库才可登录；不使用内存数据冒充持久化数据。

复制 `.env.example` 中的字段到部署平台的环境变量：

- `DATABASE_URL`：PostgreSQL 连接串；
- `SESSION_SECRET`：至少 32 字符的随机值，可用 `openssl rand -base64 48` 生成；
- `DEMO_MODE=0`：生产环境保持关闭；
- `UPLOAD_DIR`：模板文件的持久化挂载目录。

初始化数据库：

```bash
bun run db:schema
bun run db:seed
```

种子管理员账号定义在 `docs/database/seed.sql`。首次登录后应立即通过受控流程更换初始密码。

`seed.sql` 仅初始化项目部、宣传部、办公室和王颢然的管理员账号；
活动、任务、公告、资料、外联、创意与学时表初始为空。不导入 `lib/mock`。
初始化脚本用于全新的空库，不应直接在已有业务数据库重复执行。

发布前验证：

```bash
bun run lint
bun run typecheck
bun run build
bun audit
```

部署后用 `/api/health` 检查数据库连接；返回 `status: ok` 才可接入流量。上传目录必须使用持久卷并纳入备份。
