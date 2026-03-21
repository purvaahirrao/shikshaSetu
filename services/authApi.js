// PostgreSQL-backed auth & activity sync (FastAPI). Falls back silently when API/DB unavailable.

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function mapServerUserToClient(row) {
  if (!row) return null;
  return {
    uid: row.id,
    postgresUserId: row.id,
    email: row.email,
    name: row.full_name,
    phone: row.phone || '',
    school: row.school_name || '',
    role: row.role,
    language: row.language_pref || 'english',
    class: row.class_grade || '',
    board: row.board || '',
    goal: row.learning_goal || '',
    subject: row.subject_expertise || '',
    experience: row.experience_band || '',
    teachClasses: row.teach_classes || [],
    childName: row.child_name || '',
    childClass: row.child_class || '',
    parentGoal: row.parent_goal || '',
    photo: row.avatar_url || null,
    source: 'postgres',
  };
}

async function parseError(res) {
  const err = await res.json().catch(() => ({}));
  const d = err.detail;
  return typeof d === 'string' ? d : Array.isArray(d) ? d.map((x) => x.msg).join(', ') : `HTTP ${res.status}`;
}

/** @returns {Promise<{user: object}|null>} null if DB unavailable (503) */
export async function authRegister(body) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 503) return null;
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function authLogin(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 503) return null;
  if (res.status === 401) throw new Error('Invalid email or password');
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function authGoogle({ firebase_uid, email, full_name, avatar_url }) {
  const res = await fetch(`${BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firebase_uid,
      email,
      full_name: full_name || '',
      avatar_url: avatar_url || null,
    }),
  });
  if (res.status === 503) return null;
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function patchUserProfile(userId, patch) {
  const res = await fetch(`${BASE}/users/${encodeURIComponent(userId)}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function postStudentActivity({ userId, activityType, subjectHint, summary, payload }) {
  const res = await fetch(`${BASE}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      activity_type: activityType,
      subject_hint: subjectHint || null,
      summary: summary || null,
      payload: payload || {},
    }),
  });
  if (res.status === 503) return;
  if (!res.ok) throw new Error(await parseError(res));
}

export async function fetchUserProgress(userId) {
  const res = await fetch(`${BASE}/users/${encodeURIComponent(userId)}/progress`);
  if (res.status === 503) return null;
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export function buildRegisterPayloadFromForm({
  email,
  password,
  name,
  phone,
  school,
  role,
  lang,
  cls,
  board,
  goal,
  subject,
  experience,
  teachClasses,
  childName,
  childClass,
  parentGoal,
  clientUid,
}) {
  const base = {
    email: email.trim().toLowerCase(),
    password,
    full_name: name.trim(),
    role,
    language_pref: lang || 'english',
    phone: (phone || '').trim() || null,
    school_name: (school || '').trim() || null,
    client_uid: clientUid || null,
  };
  if (role === 'student') {
    return {
      ...base,
      class_grade: cls || null,
      board: (board || '').trim() || null,
      learning_goal: (goal || '').trim() || null,
    };
  }
  if (role === 'teacher') {
    return {
      ...base,
      class_grade: null,
      subject_expertise: subject || null,
      experience_band: experience || null,
      teach_classes: teachClasses || [],
    };
  }
  return {
    ...base,
    class_grade: null,
    child_name: (childName || '').trim() || null,
    child_class: childClass || null,
    parent_goal: (parentGoal || '').trim() || null,
  };
}
