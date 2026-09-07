// Run once on the confirmed, dedicated /opt/bfsu-makers/app checkout as root.
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, chmodSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const app = '/opt/bfsu-makers/app';
if (process.getuid() !== 0 || process.cwd() !== app) throw new Error('Run as root in the dedicated deployment checkout');
if (existsSync('/etc/bfsu-makers.env')) throw new Error('Existing configuration found; refusing to replace credentials');
const pg = (sql, database = 'postgres') => execFileSync('runuser', ['-u', 'postgres', '--', '/usr/pgsql-16/bin/psql', '-X', '-v', 'ON_ERROR_STOP=1', '-d', database], { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
const existing = pg("SELECT datname FROM pg_database WHERE datname='bfsu_makers'; SELECT rolname FROM pg_roles WHERE rolname='bfsu';");
if (existing.includes('bfsu')) throw new Error('Database or role already exists; refusing to overwrite');
const password = randomBytes(36).toString('hex');
pg(`CREATE ROLE bfsu LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE; CREATE DATABASE bfsu_makers OWNER bfsu;`);
const schema = readFileSync(`${app}/docs/database/schema.sql`, 'utf8');
const seed = readFileSync(`${app}/docs/database/seed.sql`, 'utf8');
pg(`SET ROLE bfsu;\n${schema}\n${seed}`, 'bfsu_makers');
const hba = '/var/lib/pgsql/16/data/pg_hba.conf';
copyFileSync(hba, `${hba}.before-bfsu`);
writeFileSync(hba, `host bfsu_makers bfsu 127.0.0.1/32 scram-sha-256\nhost bfsu_makers bfsu ::1/128 scram-sha-256\n${readFileSync(hba, 'utf8')}`);
execFileSync('systemctl', ['reload', 'postgresql-16']);
mkdirSync('/var/lib/bfsu-makers/uploads', { recursive: true });
execFileSync('chown', ['-R', 'bfsu:bfsu', '/var/lib/bfsu-makers']);
writeFileSync('/etc/bfsu-makers.env', `NODE_ENV=production\nDEMO_MODE=0\nDATABASE_URL=postgres://bfsu:${password}@127.0.0.1:5432/bfsu_makers\nSESSION_SECRET=${randomBytes(48).toString('hex')}\nUPLOAD_DIR=/var/lib/bfsu-makers/uploads\n`, { mode: 0o600 });
chmodSync('/etc/bfsu-makers.env', 0o600);
copyFileSync(`${app}/docs/deploy/bfsu-makers.service`, '/etc/systemd/system/bfsu-makers.service');
console.log('Empty business database initialized; owner account seeded; private environment written. Service not started yet.');
