# 北京外国语大学创客俱乐部系统

Next.js 16、PostgreSQL 14+、Bun。生产模式使用服务端认证与数据库；演示数据由独立的服务端开关控制。

## 本地演示

```bash
bun install
DEMO_MODE=1 bun run dev
```

打开 <http://localhost:3100/login?presentation=1> 后会显示五个演示角色；普通 `/login` 不展示演示入口。演示数据的修改在服务重启后复原。

## 生产配置

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

发布前验证：

```bash
bun run lint
bun run typecheck
bun run build
bun audit
```

部署后用 `/api/health` 检查数据库连接；返回 `status: ok` 才可接入流量。上传目录必须使用持久卷并纳入备份。
