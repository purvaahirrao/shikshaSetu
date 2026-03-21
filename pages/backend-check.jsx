// Dev helper: open this page while `npm run dev` + API are running.
import { useEffect, useState } from 'react';

export default function BackendCheckPage() {
  const [body, setBody] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetch('/shiksha-api/')
      .then((r) => r.json().then((j) => ({ ok: r.ok, status: r.status, j })))
      .then(setBody)
      .catch((e) => setErr(String(e.message || e)));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-lg mx-auto font-sans text-slate-800">
      <h1 className="font-display font-800 text-xl mb-2">Backend check</h1>
      <p className="text-sm text-slate-600 mb-4">
        Use this URL in the address bar (with Next dev running). It loads the API through the app so the browser does not treat it as a search.
      </p>
      <p className="text-xs text-slate-500 mb-2 break-all">
        <strong>Proxy:</strong> <code className="bg-slate-200 px-1 rounded">/shiksha-api/</code>
      </p>
      <p className="text-xs text-slate-500 mb-4 break-all">
        <strong>Direct (must type http://):</strong>{' '}
        <code className="bg-slate-200 px-1 rounded">http://127.0.0.1:8000/</code>
      </p>
      <div className="card p-4 text-sm">
        <p className="font-700 text-slate-700 mb-2">GET /shiksha-api/</p>
        {err && <p className="text-rose-600 text-xs">{err}</p>}
        {body && (
          <pre className="text-xs overflow-auto bg-slate-100 p-3 rounded-lg">
            {JSON.stringify(body, null, 2)}
          </pre>
        )}
        {!body && !err && <p className="text-slate-400 text-xs">Loading…</p>}
      </div>
    </div>
  );
}
