-- =============================================================================
-- ShikshaSetu — create application role and database (safe to re-run in psql)
-- =============================================================================
-- USING SUPABASE? Skip this file. Use Supabase SQL Editor + database/01_schema.sql
-- only, and DATABASE_URL from Project Settings → Database.
-- =============================================================================
--   psql -d postgres -f database/00_create_database.sql
--
-- If you see only "already exists" from an OLD script, you are fine: run 01:
--   psql -U shiksha_app -d shikshasetu -f database/01_schema.sql
--
-- Fresh wipe (destructive): DROP DATABASE shikshasetu; DROP ROLE shiksha_app;
-- =============================================================================

-- Role (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shiksha_app') THEN
    CREATE ROLE shiksha_app WITH LOGIN PASSWORD 'changeme_secure_password';
  END IF;
END
$$;

-- Database: psql-only pattern — runs CREATE only when DB is missing
SELECT format(
  'CREATE DATABASE shikshasetu OWNER shiksha_app ENCODING %L LC_COLLATE %L LC_CTYPE %L TEMPLATE template0',
  'UTF8',
  'en_US.UTF-8',
  'en_US.UTF-8'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'shikshasetu');
\gexec

-- If locale errors on CREATE above, connect to postgres and run manually:
-- CREATE DATABASE shikshasetu OWNER shiksha_app ENCODING 'UTF8' TEMPLATE template0;

COMMENT ON DATABASE shikshasetu IS 'ShikshaSetu learning app';
