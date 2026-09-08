-- 将既有组织结构收敛为三个部门，并为成员头像增加持久化字段。
-- 可重复执行；上线时先备份数据库，再以 ON_ERROR_STOP=1 运行。

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_key TEXT;

INSERT INTO departments (name, sort_order) VALUES
  ('项目部', 1),
  ('宣传部', 2),
  ('办公室', 3)
ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order;

UPDATE users
SET department = CASE
  WHEN department IN ('办公室', '社长办', '秘书处') THEN '办公室'
  WHEN department = '宣传部' THEN '宣传部'
  ELSE '项目部'
END
WHERE department NOT IN ('项目部', '宣传部', '办公室');

UPDATE events
SET department = CASE
  WHEN department IN ('办公室', '社长办', '秘书处') THEN '办公室'
  WHEN department = '宣传部' THEN '宣传部'
  ELSE '项目部'
END
WHERE department IS NOT NULL
  AND department NOT IN ('项目部', '宣传部', '办公室');

UPDATE tasks
SET department = CASE
  WHEN department IN ('办公室', '社长办', '秘书处') THEN '办公室'
  WHEN department = '宣传部' THEN '宣传部'
  ELSE '项目部'
END
WHERE department NOT IN ('项目部', '宣传部', '办公室');

UPDATE archives
SET department = CASE
  WHEN department IN ('办公室', '社长办', '秘书处') THEN '办公室'
  WHEN department = '宣传部' THEN '宣传部'
  ELSE '项目部'
END
WHERE department IS NOT NULL
  AND department NOT IN ('项目部', '宣传部', '办公室');

DELETE FROM departments
WHERE name NOT IN ('项目部', '宣传部', '办公室');

COMMIT;
