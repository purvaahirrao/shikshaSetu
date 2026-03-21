// services/api.js
// All backend communication lives here

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

// POST /ocr  — multipart image upload
export async function ocrImage(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${BASE}/ocr`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('OCR failed');
  return res.json(); // { text: string }
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
