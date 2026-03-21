/**
 * Localized subject labels for roster/progress (Mathematics, Science, …)
 * and teacher question-bank slugs (math, social science, …).
 */

const SLUG_TO_MSG = {
  math: 'opt_subj_math',
  mathematics: 'opt_subj_math',
  science: 'opt_subj_science',
  english: 'opt_subj_english',
  'social science': 'opt_subj_social',
  social_science: 'opt_subj_social',
  hindi: 'opt_subj_hindi',
  'computer science': 'opt_subj_cs',
  computer_science: 'opt_subj_cs',
};

/** Progress / analytics English names → pro_subj_* keys */
export function translateSubjectDisplayName(name, t) {
  const n = String(name || '').trim();
  if (!n) return '';
  const key = `pro_subj_${n.replace(/ /g, '_')}`;
  const s = t(key);
  return s !== key ? s : n;
}

/** Teacher bank subject slug → opt_subj_* / quiz keys */
export function translateTeacherSubjectSlug(slug, t) {
  const k = String(slug || '')
    .toLowerCase()
    .trim()
    .replace(/_/g, ' ');
  const msgKey = SLUG_TO_MSG[k];
  return msgKey ? t(msgKey) : String(slug || '');
}
