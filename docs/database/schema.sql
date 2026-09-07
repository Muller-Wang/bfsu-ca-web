-- ============================================================
-- 北京外国语大学创客俱乐部内部管理系统 · PostgreSQL Schema v1.0
-- 对应设计文档：docs/design/2026-07-24-database-schema.md
-- 要求：PostgreSQL 14+（推荐 16）
-- 执行：psql "$DATABASE_URL" -f schema.sql
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. 枚举类型（与 lib/types.ts 的字面量联合类型一一对应）
-- ------------------------------------------------------------

CREATE TYPE role_enum AS ENUM (
  'president',        -- 社长
  'vice_president',   -- 副社长
  'secretary',        -- 秘书处
  'head',             -- 部长
  'member',           -- 正式成员
  'probation'         -- 预备成员
);

CREATE TYPE user_status_enum AS ENUM ('active', 'removed');

CREATE TYPE event_tag_enum AS ENUM (
  'school',    -- 学校任务
  'internal',  -- 内部工作
  'self',      -- 自办活动
  'ddl'        -- DDL
);

CREATE TYPE task_status_enum AS ENUM ('todo', 'doing', 'review', 'done');

CREATE TYPE task_cadence_enum AS ENUM ('once', 'weekly', 'biweekly', 'monthly');

CREATE TYPE template_category_enum AS ENUM ('general', 'letter');

CREATE TYPE template_ext_enum AS ENUM ('docx', 'pdf', 'md', 'xlsx');

CREATE TYPE liaison_category_enum AS ENUM ('club', 'enterprise', 'foundation', 'government');

CREATE TYPE liaison_status_enum AS ENUM (
  'contacting',   -- 接洽中
  'negotiating',  -- 洽谈中
  'cooperating',  -- 合作中
  'completed',    -- 已完成
  'stalled'       -- 搁置
);

CREATE TYPE idea_category_enum AS ENUM ('activity', 'outreach', 'content', 'internal', 'other');

-- ------------------------------------------------------------
-- 2. 组织与账户
-- ------------------------------------------------------------

-- 部门（小表，name 直接作主键，与现有代码中的中文字符串一致）
CREATE TABLE departments (
  name        TEXT PRIMARY KEY,            -- 四个部门 + 社长办（管理归属，非职能部门）
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 成员（学号作主键；软删除保留历史引用）
CREATE TABLE users (
  id                TEXT PRIMARY KEY,                       -- 学号（登录账号）
  work_no           TEXT NOT NULL UNIQUE,                   -- 工号 CA-2026-001（应用层生成）
  name              TEXT NOT NULL,                          -- 中文姓名
  name_en           TEXT,                                   -- 拼音/英文名
  password_hash     TEXT NOT NULL,                          -- bcrypt(cost 12)，永不下发客户端
  department        TEXT NOT NULL REFERENCES departments(name),
  role              role_enum NOT NULL DEFAULT 'probation',
  title             TEXT,                                   -- 职务：部长 / 干事…
  join_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  status            user_status_enum NOT NULL DEFAULT 'active',
  probation_ends_at DATE,                                   -- 预备成员 = join_date + 60 天
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT users_id_format   CHECK (id ~ '^\d{11,12}$'),
  CONSTRAINT users_workno_fmt  CHECK (work_no ~ '^CA-\d{4}-\d{3}$'),
  CONSTRAINT users_probation_consistency
    CHECK (role = 'probation' OR probation_ends_at IS NULL)
);

COMMENT ON TABLE users IS '社团成员账号；除名走 status=removed 软删除';

-- 登录会话（token 存哈希，cookie 存原文）
CREATE TABLE sessions (
  token_hash  TEXT PRIMARY KEY,              -- sha256(session token)
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  ip          INET,
  user_agent  TEXT
);

CREATE INDEX idx_sessions_user    ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);   -- 定期清理过期会话

-- ------------------------------------------------------------
-- 3. 活动与日历
-- ------------------------------------------------------------

CREATE TABLE events (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  tag         event_tag_enum NOT NULL,
  event_date  DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  location    TEXT,
  department  TEXT REFERENCES departments(name),
  owner_id    TEXT REFERENCES users(id) ON DELETE SET NULL,   -- 负责人
  description TEXT,
  created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT events_time_order CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_events_date       ON events(event_date);
CREATE INDEX idx_events_department ON events(department);

-- 活动附件（文件本体在对象存储，此处仅存元数据）
CREATE TABLE event_attachments (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id     BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  file_name    TEXT NOT NULL,
  ext          TEXT NOT NULL,
  file_key     TEXT NOT NULL,                  -- 对象存储 key
  size_bytes   BIGINT,
  uploaded_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_attachments_event ON event_attachments(event_id);

-- ------------------------------------------------------------
-- 4. 任务
-- ------------------------------------------------------------

CREATE TABLE tasks (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,             -- 展示编号 T-031（应用层 MAX+1 生成）
  title       TEXT NOT NULL,
  department  TEXT NOT NULL REFERENCES departments(name),
  status      task_status_enum NOT NULL DEFAULT 'todo',
  due_date    DATE NOT NULL,
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  progress    SMALLINT NOT NULL DEFAULT 0,
  description TEXT,
  cadence     task_cadence_enum NOT NULL DEFAULT 'once',
  created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT tasks_progress_range CHECK (progress BETWEEN 0 AND 100),
  CONSTRAINT tasks_code_format    CHECK (code ~ '^T-\d{3}$')
);

CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);   -- 「我的待办」
CREATE INDEX idx_tasks_due_date        ON tasks(due_date);              -- 紧急任务筛选
CREATE INDEX idx_tasks_department      ON tasks(department);

-- ------------------------------------------------------------
-- 5. 公告
-- ------------------------------------------------------------

CREATE TABLE announcements (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL DEFAULT '',
  author_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_pinned ON announcements(pinned, published_at DESC);

-- ------------------------------------------------------------
-- 6. 资料库：模板 + 归档
-- ------------------------------------------------------------

CREATE TABLE templates (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,             -- TP-01
  name        TEXT NOT NULL,
  name_en     TEXT NOT NULL DEFAULT '',
  ext         template_ext_enum NOT NULL,
  version     TEXT NOT NULL DEFAULT 'v1',
  category    template_category_enum NOT NULL DEFAULT 'general',
  file_key    TEXT,                             -- 对象存储 key（上传后回填）
  size_bytes  BIGINT,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT templates_code_format CHECK (code ~ '^TP-\d{2}$')
);

-- 活动归档（一个归档 = 一场活动的一组文件）
CREATE TABLE archives (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id     BIGINT REFERENCES events(id) ON DELETE SET NULL,  -- 来源活动（可空）
  title        TEXT NOT NULL,
  archive_date DATE NOT NULL,
  department   TEXT REFERENCES departments(name),
  tag          event_tag_enum,
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_archives_date ON archives(archive_date DESC);

CREATE TABLE archive_files (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  archive_id  BIGINT NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,                   -- 照片 / 推送 / 策划案 / 总结…
  file_name   TEXT NOT NULL,
  file_key    TEXT NOT NULL,
  size_bytes  BIGINT,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_archive_files_archive ON archive_files(archive_id);

-- ------------------------------------------------------------
-- 7. 外联
-- ------------------------------------------------------------

CREATE TABLE liaisons (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         TEXT NOT NULL,                  -- 对接方名称
  category     liaison_category_enum NOT NULL,
  status       liaison_status_enum NOT NULL DEFAULT 'contacting',
  contact_name TEXT NOT NULL DEFAULT '',       -- 对接人
  contact_role TEXT,                           -- 对接人职务
  notes        TEXT NOT NULL DEFAULT '',
  next_step    TEXT,
  since        DATE,                           -- 开始接洽日期
  owner_id     TEXT REFERENCES users(id) ON DELETE SET NULL,   -- 我方负责人
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_liaisons_status   ON liaisons(status);
CREATE INDEX idx_liaisons_category ON liaisons(category);

-- ------------------------------------------------------------
-- 8. 学时
-- ------------------------------------------------------------

CREATE TABLE credit_records (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id    BIGINT REFERENCES events(id) ON DELETE SET NULL,  -- 关联活动（可空）
  hours       NUMERIC(4,1) NOT NULL,
  semester    TEXT NOT NULL,                   -- 2026-spring / 2026-autumn
  reason      TEXT NOT NULL DEFAULT '',        -- 录入说明
  recorded_by TEXT REFERENCES users(id) ON DELETE SET NULL,     -- 录入人（秘书处）
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT credit_hours_positive CHECK (hours >= 0),
  CONSTRAINT credit_semester_format CHECK (semester ~ '^\d{4}-(spring|autumn)$')
);

CREATE INDEX idx_credit_user_semester ON credit_records(user_id, semester);

-- 学时汇总视图：管理后台「人均学时 / 达标人数」与个人中心共用
CREATE VIEW v_credit_totals AS
SELECT
  u.id                                    AS user_id,
  u.name,
  u.department,
  COALESCE(SUM(cr.hours), 0)              AS total_hours,
  COALESCE(SUM(cr.hours) FILTER (
    WHERE cr.semester = to_char(now(), 'YYYY') ||
      CASE WHEN EXTRACT(MONTH FROM now()) BETWEEN 2 AND 7 THEN '-spring' ELSE '-autumn' END
  ), 0)                                   AS semester_hours
FROM users u
LEFT JOIN credit_records cr ON cr.user_id = u.id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.department;

-- ------------------------------------------------------------
-- 9. 创意点子库
-- ------------------------------------------------------------

CREATE TABLE ideas (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,             -- I-001
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  author_id  TEXT REFERENCES users(id) ON DELETE SET NULL,  -- 匿名时仍记录，前端不展示
  anonymous  BOOLEAN NOT NULL DEFAULT FALSE,
  category   idea_category_enum NOT NULL DEFAULT 'other',
  upvotes    INT NOT NULL DEFAULT 0,           -- 冗余计数（应用层与 idea_upvotes 同事务维护）
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ideas_code_format CHECK (code ~ '^I-\d{3}$')
);

CREATE TABLE idea_upvotes (
  idea_id    BIGINT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (idea_id, user_id)               -- 防重复点赞
);

CREATE TABLE idea_comments (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idea_id    BIGINT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  author_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  anonymous  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_idea_comments_idea ON idea_comments(idea_id);

-- ------------------------------------------------------------
-- 10. 动态 / 审计流（Dashboard FEED + 操作留痕）
-- ------------------------------------------------------------

CREATE TABLE activity_feed (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,                   -- 创建任务 / 上传归档 / 转正审批…
  entity_type TEXT,                            -- task / event / archive / user…
  entity_id   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);

COMMIT;
