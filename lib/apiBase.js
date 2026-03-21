/**
 * API origin for fetch():
 * - Browser dev: same-origin `/shiksha-api` (Next.js rewrites to FastAPI — avoids confusing the address bar).
 * - Server (SSR): direct FastAPI URL.
 * - Override anytime: NEXT_PUBLIC_API_URL
 */
export function getApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  if (typeof window !== 'undefined') return '/shiksha-api';
  const ssr = process.env.API_SSR_ORIGIN || 'http://127.0.0.1:8000';
  return String(ssr).replace(/\/$/, '');
}
