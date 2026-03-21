// Session in localStorage + role helpers (accounts live in PostgreSQL via API).

export const ROLE = {
  STUDENT: 'student',
  PARENT: 'parent',
  TEACHER: 'teacher',
};

const SESSION_KEY = 'ss_local_session';

export function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function homePathForRole(role) {
  if (role === ROLE.PARENT) return '/parent/home';
  if (role === ROLE.TEACHER) return '/teacher/home';
  return '/home';
}

/** Map API user JSON → client user shape */
export function mapApiUser(data) {
  if (!data) return null;
  return {
    uid: data.id,
    email: data.email,
    name: data.full_name,
    role: data.role,
    class: data.class_grade ?? '',
    language: data.language_pref || 'english',
    source: 'postgres',
  };
}
