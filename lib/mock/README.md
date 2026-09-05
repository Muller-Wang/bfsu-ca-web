# Demo 数据隔离区

这里的数据只用于演示，不会在普通生产模式中返回给浏览器。

Demo 由服务端环境变量控制：

```bash
DEMO_MODE=1 bun run dev
```

未显式设置 `DEMO_MODE=1` 时：

- 登录页不显示快速角色入口；
- `/api/auth/demo` 返回 404；
- 所有受保护页面和操作使用 PostgreSQL；
- mock 文件只保留在服务端模块中，不进入客户端 bundle。

演示模式也使用 HttpOnly 签名会话和同一套 `/api/data`、`/api/actions` 接口。写操作仅保存在当前演示进程中，重启服务后自动复原，适合讲解和试操作。
