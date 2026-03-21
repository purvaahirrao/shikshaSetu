// Per-user learning stats in localStorage, synced to Postgres `student_activity` when user has a DB UUID.

import { postStudentActivity, fetchUserProgress } from './authApi';

const PREFIX = 'ss_progress_v1_';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function storageKey(uid) {
  if (!uid) return null;
  return `${PREFIX}${uid}`;
}

/** localStorage key for this user's progress (for cross-tab sync listeners). */
export function getProgressStorageKey(uid) {
  return storageKey(uid);
}

/** Storage key: prefer Postgres user id for linked Google accounts. */
export function getProgressUserId(user) {
  if (!user) return null;
  const pid = user.postgresUserId;
  if (pid && UUID_RE.test(String(pid))) return String(pid);
  const u = user.uid;
  if (u && UUID_RE.test(String(u))) return String(u);
  if (u != null && String(u).trim() !== '') return String(u);
  if (user.email) return String(user.email);
  return null;
}

function postgresActivityUserId(progressUid, user) {
  if (user) {
    const s = user.postgresUserId || (user.source === 'postgres' ? user.uid : null);
    if (s && UUID_RE.test(String(s))) return String(s);
  }
  if (progressUid && UUID_RE.test(String(progressUid))) return String(progressUid);
  return null;
}

/**
 * Replace local progress from `GET /users/:id/progress` (Postgres aggregates).
 * @param apiUserId — UUID the API expects (Postgres user id)
 * @param storageUserId — key segment for localStorage (often same; use when session uses email but API uses UUID)
 */
export async function pullProgressFromPostgres(apiUserId, storageUserId = null) {
  if (typeof window === 'undefined' || !apiUserId || !UUID_RE.test(String(apiUserId))) return;
  const storeId = storageUserId && String(storageUserId).trim() ? String(storageUserId) : String(apiUserId);
  try {
    const remote = await fetchUserProgress(apiUserId);
    if (remote) saveProgress(storeId, { ...defaultProgress(), ...remote });
  } catch {
    /* offline / DB off */
  }
}

export function defaultProgress() {
  return {
    questionsSolved: 0,
    xp: 0,
    streak: 0,
    lastActiveDay: null,
    quizSessions: 0,
    quizQuestionsTotal: 0,
    quizCorrectTotal: 0,
    perfectQuizzes: 0,
    scansCompleted: 0,
    chatTurns: 0,
    subjectCounts: {
      Mathematics: 0,
      Science: 0,
      English: 0,
      'Social Science': 0,
      General: 0,
    },
    weekId: null,
    weekBars: [0, 0, 0, 0, 0, 0, 0],
    weeklyActions: 0,
    maxActionsOneDay: 0,
    recentActivity: [],
  };
}

export function loadProgress(uid) {
  if (typeof window === 'undefined' || !uid) return defaultProgress();
  try {
    const raw = localStorage.getItem(storageKey(uid));
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(uid, data) {
  if (typeof window === 'undefined' || !uid) return;
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function mondayWeekId() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

/** Monday = 0 … Sunday = 6 */
function mondayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function bumpStreak(p) {
  const today = todayISO();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);
  if (p.lastActiveDay === today) return;
  if (p.lastActiveDay === yesterday) {
    p.streak = (p.streak || 0) + 1;
  } else {
    p.streak = 1;
  }
  p.lastActiveDay = today;
}

function bumpWeekBar(p, weight = 1) {
  const wid = mondayWeekId();
  if (p.weekId !== wid) {
    p.weekId = wid;
    p.weekBars = [0, 0, 0, 0, 0, 0, 0];
    p.weeklyActions = 0;
  }
  const idx = mondayIndex();
  p.weekBars[idx] = (p.weekBars[idx] || 0) + weight;
  p.weeklyActions = (p.weeklyActions || 0) + weight;
  const peak = Math.max(...p.weekBars);
  if (peak > (p.maxActionsOneDay || 0)) p.maxActionsOneDay = peak;
}

export function mapSubjectKey(key) {
  const k = String(key || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  const M = {
    math: 'Mathematics',
    mathematics: 'Mathematics',
    science: 'Science',
    english: 'English',
    social_science: 'Social Science',
    socialscience: 'Social Science',
  };
  return M[k] || 'General';
}

function pushRecent(p, subjectLabel, questionSnippet) {
  const snip = (questionSnippet || '').trim().slice(0, 100);
  const next = [
    { subject: subjectLabel, q: snip || 'Question', time: Date.now() },
    ...(p.recentActivity || []),
  ].slice(0, 10);
  p.recentActivity = next;
}

/** Successful solve (scan or typed). Pass `user` when available so Postgres sync can resolve linked Google ids. */
export function recordQuestionSolved(uid, { subject, questionText, fromScan } = {}, user = null) {
  if (!uid) return;
  const p = loadProgress(uid);
  bumpStreak(p);
  bumpWeekBar(p, 1);
  p.questionsSolved += 1;
  p.xp += 15;
  if (fromScan) p.scansCompleted += 1;
  const label = mapSubjectKey(subject);
  p.subjectCounts[label] = (p.subjectCounts[label] || 0) + 1;
  pushRecent(p, label, questionText);
  saveProgress(uid, p);

  const pid = postgresActivityUserId(uid, user);
  if (pid) {
    const hint = String(subject || 'general')
      .toLowerCase()
      .replace(/\s+/g, '_');
    void postStudentActivity({
      userId: pid,
      activityType: fromScan ? 'scan_solve' : 'manual_solve',
      subjectHint: hint,
      summary: (questionText || '').slice(0, 400),
      payload: {
        subject,
        subject_label: label,
        question_snippet: (questionText || '').slice(0, 200),
        fromScan: !!fromScan,
      },
    }).catch(() => {});
  }
}

/** Finished a quiz run */
export function recordQuizSession(uid, { correct, total, subject } = {}, user = null) {
  if (!uid || !total) return;
  const p = loadProgress(uid);
  bumpStreak(p);
  bumpWeekBar(p, 1);
  p.quizSessions += 1;
  p.quizQuestionsTotal += total;
  p.quizCorrectTotal += correct;
  if (correct === total) p.perfectQuizzes += 1;
  p.xp += correct * 8 + (correct === total ? 40 : 0);
  const label = mapSubjectKey(subject);
  p.subjectCounts[label] = (p.subjectCounts[label] || 0) + correct;
  saveProgress(uid, p);

  const pid = postgresActivityUserId(uid, user);
  if (pid) {
    void postStudentActivity({
      userId: pid,
      activityType: 'quiz',
      subjectHint: String(subject || '').toLowerCase().replace(/\s+/g, '_') || null,
      summary: `Quiz ${correct}/${total}`,
      payload: { correct, total, subject },
    }).catch(() => {});
  }
}

export function recordChatTurn(uid, user = null) {
  if (!uid) return;
  const p = loadProgress(uid);
  bumpStreak(p);
  bumpWeekBar(p, 1);
  p.chatTurns += 1;
  p.xp += 3;
  saveProgress(uid, p);

  const pid = postgresActivityUserId(uid, user);
  if (pid) {
    void postStudentActivity({
      userId: pid,
      activityType: 'chat',
      payload: {},
    }).catch(() => {});
  }
}

export function formatRelativeTime(ts) {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 172800) return '1d ago';
  return `${Math.floor(sec / 86400)}d ago`;
}

export function accuracyPercent(p) {
  if (!p.quizQuestionsTotal) return null;
  return Math.round((100 * p.quizCorrectTotal) / p.quizQuestionsTotal);
}

/** Weekly goal: distinct active days this week */
export function activeDaysThisWeek(p) {
  return (p.weekBars || []).filter((n) => n > 0).length;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function weekChartData(p) {
  const bars = p.weekBars || [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(1, ...bars);
  return WEEK_LABELS.map((day, i) => ({
    day,
    dayIndex: i,
    count: bars[i] || 0,
    heightPct: Math.round(((bars[i] || 0) / max) * 100) || (bars[i] > 0 ? 8 : 12),
    done: (bars[i] || 0) > 0,
  }));
}

export function subjectRowsFromProgress(p) {
  const order = ['Mathematics', 'Science', 'English', 'Social Science', 'General'];
  const counts = p.subjectCounts || {};
  const total = Math.max(1, p.questionsSolved + (p.quizCorrectTotal || 0));
  return order.map((name) => {
    const n = counts[name] || 0;
    return {
      name,
      questions: n,
      pct: Math.min(100, Math.round((100 * n) / total)),
    };
  });
}

export function badgesFromProgress(p) {
  const acc = accuracyPercent(p);
  return [
    {
      id: 'first',
      titleKey: 'badge_first_title',
      descKey: 'badge_first_desc',
      earned: p.questionsSolved >= 1,
    },
    {
      id: 'streak7',
      titleKey: 'badge_streak7_title',
      descKey: 'badge_streak7_desc',
      earned: (p.streak || 0) >= 7,
    },
    {
      id: 'math',
      titleKey: 'badge_math_title',
      descKey: 'badge_math_desc',
      earned: (p.subjectCounts?.Mathematics || 0) >= 10,
    },
    {
      id: 'speed',
      titleKey: 'badge_speed_title',
      descKey: 'badge_speed_desc',
      earned: (p.maxActionsOneDay || 0) >= 5,
    },
    {
      id: 'perfect',
      titleKey: 'badge_perfect_title',
      descKey: 'badge_perfect_desc',
      earned: (p.perfectQuizzes || 0) >= 1,
    },
    {
      id: 'sharp',
      titleKey: 'badge_sharp_title',
      descKey: 'badge_sharp_desc',
      earned: p.quizQuestionsTotal >= 10 && acc != null && acc >= 80,
    },
  ];
}
