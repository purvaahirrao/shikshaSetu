-- =============================================================================
-- ShikshaSetu — DROP all app tables (use before re-running 01_schema.sql)
-- =============================================================================
-- ONLY in dev / Supabase branch you can throw away. This deletes all data.
-- Run in SQL Editor, then run database/01_schema.sql again.
-- =============================================================================

DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS student_activity CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS parent_student CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
