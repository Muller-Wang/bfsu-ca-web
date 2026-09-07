# ECS deployment

## Mainland network

- Runtime assets, including fonts, are served by this application. Do not reintroduce Google font build downloads or external runtime CDNs.
- Dependency retry: `bun install --frozen-lockfile --registry https://registry.npmmirror.com`. Preserve lockfile integrity checks; do not bypass failed checksums.
- GitHub is a source backup, not a runtime dependency. Deployments may require retries on direct mainland connections.
- Test HTTPS from the server without proxy environment variables. A successful request from a developer computer using a proxy is not evidence of mainland user reachability.
- Current ECS public bandwidth is 1 Mbps. Large uploads and concurrent initial page loads need realistic speed checks before broader rollout.

## Service layout

- Application: `/opt/bfsu-makers/app`; service: `bfsu-makers.service`; loopback port 3100.
- Runtime: `/opt/bfsu-makers/runtime/node`; Bun: `/opt/bfsu-makers/tooling/node_modules/.bin/bun`.
- Private environment: `/etc/bfsu-makers.env` (root-only); uploads: `/var/lib/bfsu-makers/uploads`.
- PostgreSQL 16: database `bfsu_makers`, role `bfsu`; no public database port is required.
- Nginx provides HTTP redirect and HTTPS at `39.105.122.95`.
- Certificate renewal: `bfsu-certificate.timer`, twice daily with randomized delay.
- Keep the pre-existing `laiwu-web.service` on port 3000 and MySQL unchanged.

`bootstrap.mjs` is a guarded one-time initializer, not an upgrade script. The database persists independently of builds. Its initial seed includes organizational affiliations and the president account, but no business/demo records. Database and uploads currently reside on the ECS disk; this is not an off-site backup.
