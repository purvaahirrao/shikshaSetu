-- =============================================================================
-- ShikshaSetu — optional seed data (subjects / sample chapters)
-- =============================================================================
--   psql -U shiksha_app -d shikshasetu -f database/02_seed.sql
-- Safe to re-run only if you truncate first; uses ON CONFLICT where applicable.
-- =============================================================================

INSERT INTO subjects (code, name, sort_order) VALUES
  ('MATH',  'Mathematics',     1),
  ('SCI',   'Science',         2),
  ('ENG',   'English',         3),
  ('SOC',   'Social Science',  4)
ON CONFLICT (code) DO NOTHING;

INSERT INTO chapters (subject_id, title, sort_order)
SELECT s.id, c.title, c.ord
FROM subjects s
JOIN (VALUES
  ('MATH', 'Numbers and place value', 1),
  ('MATH', 'Fractions',               2),
  ('MATH', 'Decimals',                3),
  ('SCI',  'Living things',           1),
  ('SCI',  'Matter and energy',       2),
  ('ENG',  'Reading comprehension',   1),
  ('SOC',  'India and its neighbours',1)
) AS c(subj_code, title, ord) ON s.code = c.subj_code
WHERE NOT EXISTS (
  SELECT 1 FROM chapters ch
  WHERE ch.subject_id = s.id AND ch.title = c.title
);
