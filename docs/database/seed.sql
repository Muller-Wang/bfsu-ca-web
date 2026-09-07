-- ============================================================
-- 种子数据 · 北京外国语大学创客俱乐部内部管理系统
-- 执行顺序：schema.sql 之后
-- 执行：psql "$DATABASE_URL" -f seed.sql
-- ============================================================

BEGIN;

-- 部门（顺序与侧栏/表单展示一致）
INSERT INTO departments (name, sort_order) VALUES
  ('社长办', 1),
  ('秘书处', 2),
  ('外联部', 3),
  ('学术部', 4),
  ('宣传部', 5);

-- 初始系统管理员账号（密码仅以 bcrypt cost 12 哈希保存）
INSERT INTO users (id, work_no, name, name_en, password_hash, department, role, title, join_date, status)
VALUES (
  '202420107031',
  'CA-2026-001',
  '王颢然',
  'Wang Haoran',
  '$2b$12$pkszrd2BfYVsfDv.aXfVh.TdUd30Ye77LqgsVzd1E2HdWxDVc3EFW',
  '社长办',
  'president',
  '社长',
  '2026-09-05',
  'active'
);

COMMIT;
