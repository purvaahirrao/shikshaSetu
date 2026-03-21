-- =============================================================================
-- ShikshaSetu — PostgreSQL schema (same DDL for local Postgres OR Supabase)
-- =============================================================================
--
-- WHY NOT "SUPABASE-ONLY"?
--   These CREATE TABLE statements define your app's data model. Postgres is
--   Postgres: Supabase *is* hosted Postgres. You run this file once per project
--   where the database lives (local dev machine, Supabase project, etc.).
--
-- SUPABASE (recommended for deploy)
--   • Skip database/00_create_database.sql — Supabase already created the DB + user.
--   • Dashboard → SQL Editor → New query → paste this whole file → Run.
--   • If "extension pgcrypto" fails: Dashboard → Database → Extensions →
--     enable "pgcrypto", then re-run from CREATE TABLE (or drop objects first).
--   • Copy DATABASE_URL: Project Settings → Database → Connection string
--     (URI). Use it in your API (and .env), not the local shiksha_app URL.
--
-- LOCAL POSTGRES (optional dev)
--   • Run database/00_create_database.sql once, then:
--     psql -U shiksha_app -d shikshasetu -f database/01_schema.sql
--
-- ERROR: relation "users" already exists
--   • Schema is already applied — you do not need to run this file again.
--   • To align an EXISTING DB with the current schema (no data wipe), run in order:
--       1. database/03_migrate_users_onboarding.sql  (columns + constraints + indexes)
--       2. database/04_app_quiz_anchor.sql           (optional: in-app quiz row for quiz_attempts)
--   • To wipe and recreate (dev only): database/99_reset_schema.sql, then this file.
--
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Users — pages/index.jsx (login + register + Google)
--
-- Flow: (1) Login — email + password (UI min 4 chars; store bcrypt in DB via API).
--       (2) Create account — role grid, then form: email, password, name, phone,
--           school, role-specific fields. (3) Google — firebase_uid + email.
--
-- Client JSON → columns:  name→full_name, school→school_name, language→language_pref,
--   class→class_grade, goal (student)→learning_goal, goal (parent)→parent_goal,
--   subject→subject_expertise, experience→experience_band, teachClasses→teach_classes,
--   childName→child_name, childClass→child_class, uid (manual_*)→client_uid.
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uid          VARCHAR(64),

  email               VARCHAR(255) NOT NULL UNIQUE,
  password_hash       TEXT,
  firebase_uid        VARCHAR(128),
  auth_provider       VARCHAR(20)  NOT NULL DEFAULT 'email'
                        CHECK (auth_provider IN ('email', 'google')),

  phone               VARCHAR(20),
  full_name           VARCHAR(200) NOT NULL,
  role                VARCHAR(20)  NOT NULL
                        CHECK (role IN ('student', 'parent', 'teacher')),
  school_name         VARCHAR(300),
  language_pref       VARCHAR(20)  NOT NULL DEFAULT 'english',

  class_grade         VARCHAR(10),
  board               VARCHAR(50),
  learning_goal       VARCHAR(120),

  subject_expertise   VARCHAR(120),
  experience_band     VARCHAR(40),
  teach_classes       TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],

  child_name          VARCHAR(200),
  child_class         VARCHAR(10),
  parent_goal         VARCHAR(120),

  avatar_url          VARCHAR(600),

  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_client_uid ON users (client_uid) WHERE client_uid IS NOT NULL;
CREATE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL AND btrim(phone) <> '';
CREATE UNIQUE INDEX idx_users_firebase_uid ON users (firebase_uid)
  WHERE firebase_uid IS NOT NULL AND btrim(firebase_uid) <> '';

COMMENT ON TABLE users IS
  'index.jsx: login/register email+password; Google; profile fields map from name/school/language/class/goal/teachClasses/child*';

-- ---------------------------------------------------------------------------
-- Parent ↔ student (guardian can view linked children)
-- ---------------------------------------------------------------------------
CREATE TABLE parent_student (
  parent_user_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  relationship    VARCHAR(50) NOT NULL DEFAULT 'guardian',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_user_id, student_user_id),
  CHECK (parent_user_id <> student_user_id)
);

CREATE INDEX idx_parent_student_student ON parent_student (student_user_id);

COMMENT ON TABLE parent_student IS 'Links parent users to student users';

-- ---------------------------------------------------------------------------
-- Teacher classes + roster (teacher sees students in their classes)
-- ---------------------------------------------------------------------------
CREATE TABLE classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  grade_level     VARCHAR(10),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_teacher ON classes (teacher_user_id);

CREATE TABLE class_students (
  class_id        UUID NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, student_user_id)
);

CREATE INDEX idx_class_students_student ON class_students (student_user_id);

COMMENT ON TABLE classes IS 'A group taught by one teacher';
COMMENT ON TABLE class_students IS 'Students enrolled in a class';

-- ---------------------------------------------------------------------------
-- Curriculum: subject → chapter (for chapter-based quizzes later)
-- ---------------------------------------------------------------------------
CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(50) UNIQUE,
  name        VARCHAR(200) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chapters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id  UUID NOT NULL REFERENCES subjects (id) ON DELETE CASCADE,
  title       VARCHAR(300) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapters_subject ON chapters (subject_id);

-- ---------------------------------------------------------------------------
-- Quizzes generated per chapter (metadata flexible via JSONB)
-- ---------------------------------------------------------------------------
CREATE TABLE quizzes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id      UUID NOT NULL REFERENCES chapters (id) ON DELETE CASCADE,
  title           VARCHAR(300) NOT NULL,
  created_by      UUID REFERENCES users (id) ON DELETE SET NULL,
  question_count  INT,
  meta            JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_chapter ON quizzes (chapter_id);

CREATE TABLE quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  score_percent   NUMERIC(5,2),
  total_questions INT,
  correct_count   INT,
  answers         JSONB NOT NULL DEFAULT '{}',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_quiz_attempts_student ON quiz_attempts (student_user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts (quiz_id);

COMMENT ON TABLE quiz_attempts IS 'Stored quiz results per student';

-- ---------------------------------------------------------------------------
-- Generic student activity (scans, solves, chat) for progress / graphs
-- ---------------------------------------------------------------------------
CREATE TABLE student_activity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  activity_type   VARCHAR(40) NOT NULL
                    CHECK (activity_type IN (
                      'scan_solve', 'chat', 'quiz', 'manual_solve', 'login'
                    )),
  subject_hint    VARCHAR(50),
  summary         TEXT,
  payload         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_activity_student_time
  ON student_activity (student_user_id, created_at DESC);

CREATE INDEX idx_student_activity_type ON student_activity (activity_type);

COMMENT ON TABLE student_activity IS 'Append-only events for streaks, accuracy, charts';

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER tr_classes_updated
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ---------------------------------------------------------------------------
-- Grants (if objects owned by superuser, re-run as owner or adjust)
-- ---------------------------------------------------------------------------
-- When connected as shiksha_app, you typically own these objects already.
-- If you ran 01_schema.sql as postgres, grant to app user:
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shiksha_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO shiksha_app;
-- GRANT EXECUTE ON FUNCTION set_updated_at() TO shiksha_app;
