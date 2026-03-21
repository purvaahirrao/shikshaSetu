-- =============================================================================
-- ShikshaSetu — migrate EXISTING `users` to match database/01_schema.sql
-- =============================================================================
-- Use when `users` already exists (e.g. older Supabase run) and you must not use
-- 99_reset. Safe to re-run: ADD COLUMN / idempotent constraint drops.
-- After this, optionally run database/04_app_quiz_anchor.sql.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users ADD COLUMN IF NOT EXISTS client_uid VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_name VARCHAR(300);

ALTER TABLE users ADD COLUMN IF NOT EXISTS board VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_goal VARCHAR(120);

ALTER TABLE users ADD COLUMN IF NOT EXISTS subject_expertise VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_band VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS teach_classes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE users ADD COLUMN IF NOT EXISTS child_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS child_class VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_goal VARCHAR(120);

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(600);

ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email';

UPDATE users SET teach_classes = ARRAY[]::TEXT[] WHERE teach_classes IS NULL;

UPDATE users SET auth_provider = 'google' WHERE firebase_uid IS NOT NULL AND btrim(firebase_uid) <> '';

UPDATE users SET auth_provider = 'email' WHERE auth_provider IS NULL;

ALTER TABLE users ALTER COLUMN auth_provider SET DEFAULT 'email';

ALTER TABLE users ALTER COLUMN auth_provider SET NOT NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_provider_check;
ALTER TABLE users ADD CONSTRAINT users_auth_provider_check
  CHECK (auth_provider IN ('email', 'google'));

-- Email required by current UI: backfill then enforce (skip if already NOT NULL)
UPDATE users
SET email = 'user_' || replace(id::text, '-', '') || '@migrated.shikshasetu.local'
WHERE email IS NULL OR btrim(email) = '';

ALTER TABLE users ALTER COLUMN email SET NOT NULL;

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Role / profile columns must match 01_schema.sql CHECK + NOT NULL rules
UPDATE users
SET role = 'student'
WHERE role IS NULL OR btrim(role) = '' OR lower(role) NOT IN ('student', 'parent', 'teacher');

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('student', 'parent', 'teacher'));

UPDATE users
SET full_name = COALESCE(NULLIF(btrim(full_name), ''), NULLIF(split_part(email, '@', 1), ''), 'User')
WHERE full_name IS NULL OR btrim(full_name) = '';

ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

UPDATE users
SET language_pref = 'english'
WHERE language_pref IS NULL OR btrim(language_pref) = '';

ALTER TABLE users ALTER COLUMN language_pref SET DEFAULT 'english';

ALTER TABLE users ALTER COLUMN language_pref SET NOT NULL;

DROP INDEX IF EXISTS idx_users_client_uid;
CREATE INDEX idx_users_client_uid ON users (client_uid) WHERE client_uid IS NOT NULL;

DROP INDEX IF EXISTS idx_users_phone;
CREATE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL AND btrim(phone) <> '';

DROP INDEX IF EXISTS idx_users_firebase_uid;
CREATE UNIQUE INDEX idx_users_firebase_uid ON users (firebase_uid)
  WHERE firebase_uid IS NOT NULL AND btrim(firebase_uid) <> '';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_has_contact;

COMMENT ON TABLE users IS
  'Auth + onboarding: email/password or Google; profile maps full_name, school_name, language_pref, class_grade, board, goals, teach_classes, child_*, client_uid';
