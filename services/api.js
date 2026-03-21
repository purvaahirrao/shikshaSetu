// services/api.js
// All backend communication lives here

/** Same-origin proxy in dev/prod: Next rewrites `/backend-api/*` → FastAPI. */
export function getApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/backend-api`;
  }
  return 'http://127.0.0.1:8000';
}

const OCR_TIMEOUT_MS = 240000; // first EasyOCR load can take several minutes
const JSON_TIMEOUT_MS = 120000;

async function request(path, options = {}) {
  const BASE = getApiBase();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), JSON_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `API error ${res.status}`);
    }
    return res.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error(
        `No response from API (${BASE}). Is the server running? Try: source venv/bin/activate && python server_main.py`,
      );
    }
    if (e.message === 'Failed to fetch' || e.cause?.code === 'ECONNREFUSED') {
      throw new Error(
        `Cannot reach API at ${BASE}. Start the backend in another terminal (venv + python server_main.py).`,
      );
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

// POST /ocr  — multipart image upload
export async function ocrImage(file) {
  const BASE = getApiBase();
  const form = new FormData();
  form.append('image', file);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), OCR_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/ocr`, { method: 'POST', body: form, signal: ctrl.signal });
    if (!res.ok) throw new Error('OCR failed');
    return res.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error(
        'OCR timed out. The first scan loads EasyOCR models (can take a few minutes). Wait and try again, or check server logs.',
      );
    }
    if (e.message === 'Failed to fetch') {
      throw new Error(`Cannot reach API at ${BASE}. Start: python server_main.py (with venv activated).`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

// POST /solve — question + language → answer + steps
export async function solveQuestion(question, language = 'english') {
  return request('/solve', {
    method: 'POST',
    body: JSON.stringify({ question, language }),
  });
}

// POST /chat — message → reply
export async function sendChat(message, language = 'english') {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language }),
  });
}
