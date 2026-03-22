// services/api.js
// All backend communication lives here

import { getApiBase } from '../lib/apiBase';

async function request(path, options = {}, timeoutMs = 120000) {
  const BASE = getApiBase();
  const url = `${BASE}${path}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
      signal: ctrl.signal,
    });
  } catch (e) {
    const msg =
      e?.name === 'AbortError'
        ? `Request timed out (${timeoutMs / 1000}s). The AI may be slow or the server cold-starting. ${API_HINT}`
        : e instanceof TypeError
          ? `Cannot reach API at ${url}. ${API_HINT} (${e.message})`
          : String(e?.message || e);
    throw new Error(msg);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    let detail = `HTTP ${res.status}`;
    try {
      const err = raw ? JSON.parse(raw) : null;
      const d = err?.detail;
      if (typeof d === 'string' && d.trim()) detail = d.trim();
      else if (Array.isArray(d)) {
        detail = d
          .map((x) => (x && typeof x === 'object' && x.msg) || String(x))
          .filter(Boolean)
          .join('; ');
      } else if (raw && raw.trim()) detail = `${detail}: ${raw.slice(0, 240)}`;
    } catch {
      if (raw && raw.trim()) detail = `${detail}: ${raw.slice(0, 240)}`;
    }
    throw new Error(`${detail} — ${url}`);
  }
  return res.json();
}

const API_HINT =
  'Set NEXT_PUBLIC_API_URL to your Python API (e.g. https://your-api.onrender.com), or set API_ORIGIN on the Next.js host so /shiksha-api rewrites work.';

// POST /ocr  — multipart image upload
export async function ocrImage(file) {
  const BASE = getApiBase();
  const url = `${BASE}/ocr`;
  const form = new FormData();
  form.append('image', file);

  const ctrl = new AbortController();
  const timeoutMs = 180000;
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, { method: 'POST', body: form, signal: ctrl.signal });
  } catch (e) {
    const msg =
      e?.name === 'AbortError'
        ? `OCR request timed out (${timeoutMs / 1000}s). Server may be cold-starting or EasyOCR too slow on your plan. ${API_HINT}`
        : e instanceof TypeError
          ? `Cannot reach OCR API at ${url}. ${API_HINT} (${e.message})`
          : String(e?.message || e);
    throw new Error(msg);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    let serverDetail = '';
    try {
      const err = raw ? JSON.parse(raw) : null;
      const d = err?.detail;
      if (typeof d === 'string' && d.trim()) serverDetail = d.trim();
      else if (Array.isArray(d)) {
        serverDetail = d
          .map((x) => (x && typeof x === 'object' && x.msg) || String(x))
          .filter(Boolean)
          .join('; ');
      } else if (d != null && typeof d === 'object') {
        serverDetail = JSON.stringify(d);
      }
    } catch {
      /* not JSON */
    }

    const statusLine = `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ''}`;
    const bodyHint =
      serverDetail ||
      (raw && raw.trim() ? raw.trim().slice(0, 280) : '(empty response body)');
    const parts = [`${statusLine} — ${url}`, bodyHint];
    if ([404, 502, 503, 504].includes(res.status)) {
      parts.push(API_HINT);
    }
    throw new Error(parts.filter(Boolean).join(' — '));
  }

  const okBody = await res.text().catch(() => '');
  try {
    return JSON.parse(okBody);
  } catch {
    throw new Error(
      `OCR returned non-JSON from ${url} (status ${res.status}): ${okBody.slice(0, 200)}`,
    );
  }
}

// POST /solve — question + language → answer + steps (longer timeout for LLM + OCR-sized prompts)
export async function solveQuestion(question, language = 'english', opts = {}) {
  const { fromOcr = false } = opts;
  return request(
    '/solve',
    {
      method: 'POST',
      body: JSON.stringify({
        question,
        language,
        from_ocr: Boolean(fromOcr),
      }),
    },
    180000,
  );
}

// POST /chat — message → reply
export async function sendChat(message, language = 'english') {
  return request(
    '/chat',
    {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    },
    120000,
  );
}
