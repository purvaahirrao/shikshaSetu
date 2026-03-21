// Real stats from ss_registered_users + ss_progress_v1_* (same device). No mock names.

import {
  getProgressUserId,
  loadProgress,
  defaultProgress,
  accuracyPercent,
  subjectRowsFromProgress,
} from './userProgress';

export function getRegisteredUsersList() {
  if (typeof window === 'undefined') return [];
  try {
    const db = JSON.parse(localStorage.getItem('ss_registered_users') || '{}');
    return Object.entries(db).map(([email, u]) => ({ ...u, email: String(email).toLowerCase() }));
  } catch {
    return [];
  }
}

export function getRegisteredStudents() {
  return getRegisteredUsersList().filter((u) => u.role === 'student');
}

/** Match parent profile to a registered student on this device (name + class). */
export function findLinkedStudentForParent(parentUser) {
  if (!parentUser?.childName?.trim()) return null;
  const cn = parentUser.childName.trim().toLowerCase();
  const cc = String(parentUser.childClass || '').trim();
  return (
    getRegisteredStudents().find(
      (s) =>
        (s.name || '').trim().toLowerCase() === cn &&
        (!cc || String(s.class || '').trim() === cc),
    ) || null
  );
}

export function progressSnapshotForUserRecord(u) {
  if (!u) return defaultProgress();
  return loadProgress(getProgressUserId(u));
}

function baseStudentRow(u) {
  const pid = getProgressUserId(u);
  const p = loadProgress(pid);
  const acc = accuracyPercent(p);
  return {
    id: u.email || u.uid,
    uid: u.uid,
    email: u.email?.toLowerCase(),
    name: (u.name || u.email?.split('@')[0] || 'Student').trim(),
    cls: String(u.class || '?'),
    xp: Math.round(p.xp || 0),
    scorePct: acc,
    quizzes: p.quizSessions || 0,
    streak: p.streak || 0,
    questionsSolved: p.questionsSolved || 0,
    progress: p,
  };
}

/** Leaderboard: XP-ordered, includes current student session if not in register DB. */
export function buildLeaderboardRows(currentUser) {
  const students = getRegisteredStudents();
  const seen = new Set(students.map((s) => s.email?.toLowerCase()).filter(Boolean));

  const rows = students.map((u) => {
    const r = baseStudentRow(u);
    return {
      id: r.id,
      name: r.name,
      class: r.cls,
      score: r.xp,
      avatar: null,
      email: r.email,
    };
  });

  if (currentUser && (currentUser.role || 'student') === 'student') {
    const em = currentUser.email?.toLowerCase();
    if (em && !seen.has(em)) {
      const r = baseStudentRow({
        ...currentUser,
        email: currentUser.email,
        role: 'student',
        class: currentUser.class,
        name: currentUser.name,
        uid: currentUser.uid,
        postgresUserId: currentUser.postgresUserId,
      });
      rows.push({
        id: r.id,
        name: r.name || 'You',
        class: r.cls,
        score: r.xp,
        avatar: currentUser.photo || null,
        email: em,
      });
    }
  }

  rows.sort((a, b) => b.score - a.score);
  const myEmail = currentUser?.email?.toLowerCase();
  const myUid = currentUser?.uid;
  return rows.map((r, i) => ({
    ...r,
    rank: i + 1,
    isUser:
      !!currentUser &&
      ((myEmail && r.email === myEmail) || (myUid && r.id === myUid)),
  }));
}

export function getTeacherStudentSummaries() {
  return getRegisteredStudents().map((u) => {
    const r = baseStudentRow(u);
    const trend = r.streak >= 5 ? 'up' : r.streak === 0 ? 'down' : 'flat';
    return { ...r, trend };
  });
}

function mean(nums) {
  const a = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n));
  if (!a.length) return null;
  return Math.round(a.reduce((s, n) => s + n, 0) / a.length);
}

/** Class rows for teacher analytics from real roster. */
export function aggregateClassRows(summaries) {
  const by = {};
  for (const s of summaries) {
    const k = s.cls || '?';
    if (!by[k]) by[k] = [];
    by[k].push(s);
  }
  return Object.keys(by)
    .sort()
    .map((cls) => {
      const list = by[cls];
      const avgScores = list.map((x) => x.scorePct).filter((n) => n != null);
      return {
        cls,
        students: list.length,
        avg: mean(avgScores),
        active: list.filter((x) => x.streak > 0).length,
      };
    });
}

export function aggregateSubjectAverages(summaries) {
  const subjects = ['Mathematics', 'Science', 'English'];
  const colors = {
    Mathematics: 'bg-indigo-500',
    Science: 'bg-emerald-500',
    English: 'bg-purple-500',
  };
  return subjects.map((subject) => {
    const pcts = [];
    for (const s of summaries) {
      const rows = subjectRowsFromProgress(s.progress);
      const row = rows.find((r) => r.name === subject);
      if (row && row.questions > 0) pcts.push(row.pct);
    }
    return {
      subject,
      avg: mean(pcts) ?? 0,
      color: colors[subject],
    };
  });
}

export function topStudentsByXp(summaries, n = 5) {
  return [...summaries].sort((a, b) => b.xp - a.xp).slice(0, n);
}

/** Teacher overview: totals from roster + quiz accuracy where available. */
export function teacherOverviewStats(summaries) {
  const n = summaries.length;
  const accs = summaries.map((s) => s.scorePct).filter((v) => v != null);
  const avgAcc = mean(accs);
  const active = summaries.filter((s) => s.streak > 0).length;
  return {
    totalStudents: n,
    avgScorePct: avgAcc,
    active,
  };
}

/** Subjects with the least practice (by question count); guides “focus” chips. */
export function weakSubjectsFromProgress(p) {
  const total = (p.questionsSolved || 0) + (p.quizCorrectTotal || 0) + (p.quizSessions || 0);
  if (total === 0) return [];
  const rows = subjectRowsFromProgress(p).filter((r) => r.name !== 'General');
  if (!rows.length) return [];
  const sorted = [...rows].sort((a, b) => a.questions - b.questions);
  return sorted.slice(0, 2).map((r) => r.name);
}

export function formatActivityTime(ts) {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 172800) return 'Yesterday';
  return `${Math.floor(sec / 86400)}d ago`;
}
