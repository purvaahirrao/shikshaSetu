/**
 * Pass OCR text scan → result without URL query (avoids length limits & encoding bugs).
 */
const KEY = 'ss_ocr_to_result';

export function normalizeOcrText(s) {
  if (!s || typeof s !== 'string') return '';
  return s
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

export function storeOcrForResult(text) {
  try {
    const normalized = normalizeOcrText(text);
    if (!normalized) return false;
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ text: normalized, t: Date.now() }),
    );
    return true;
  } catch {
    return false;
  }
}

/** Read stored OCR text without removing (safe for React Strict Mode / re-renders). */
export function peekOcrForResult() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    return typeof o.text === 'string' ? normalizeOcrText(o.text) : null;
  } catch {
    return null;
  }
}

export function clearOcrPayload() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Read and remove in one step (legacy). Prefer peek + clearOcrPayload after solve. */
export function consumeOcrForResult() {
  const t = peekOcrForResult();
  clearOcrPayload();
  return t;
}
