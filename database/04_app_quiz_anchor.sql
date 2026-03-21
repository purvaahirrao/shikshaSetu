-- Optional: anchor row so in-app quiz results can also populate quiz_attempts.
-- Safe to run multiple times.

INSERT INTO subjects (code, name, sort_order)
VALUES ('__app__', 'In-app practice', 999)
ON CONFLICT (code) DO NOTHING;

INSERT INTO chapters (subject_id, title, sort_order)
SELECT s.id, 'Practice', 0
FROM subjects s
WHERE s.code = '__app__'
  AND NOT EXISTS (
    SELECT 1 FROM chapters c WHERE c.subject_id = s.id AND c.title = 'Practice'
  );

INSERT INTO quizzes (chapter_id, title, question_count, meta)
SELECT c.id, 'In-app quiz', NULL, '{"kind":"app"}'::jsonb
FROM chapters c
JOIN subjects s ON s.id = c.subject_id
WHERE s.code = '__app__' AND c.title = 'Practice'
  AND NOT EXISTS (
    SELECT 1 FROM quizzes q WHERE q.chapter_id = c.id AND q.title = 'In-app quiz'
  );
