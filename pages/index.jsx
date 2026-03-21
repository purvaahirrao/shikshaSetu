// pages/index.jsx  — Login / onboarding screen
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { signInWithGoogle } from '../services/firebase';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const CLASSES   = ['1','2','3','4','5','6','7','8','9','10'];
const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi',   label: 'हिंदी'   },
  { value: 'marathi', label: 'मराठी'   },
];

export default function LoginPage() {
  const { user, loading, setManualUser } = useAuth();
  const router = useRouter();

  const [tab,       setTab]       = useState('google');  // 'google' | 'manual'
  const [gLoading,  setGLoading]  = useState(false);
  const [gError,    setGError]    = useState('');
  const [name,      setName]      = useState('');
  const [cls,       setCls]       = useState('');
  const [lang,      setLang]      = useState('english');
  const [mError,    setMError]    = useState('');

  // If already logged in, go home
  useEffect(() => {
    if (!loading && user) router.replace('/home');
  }, [user, loading, router]);

  const handleGoogle = async () => {
    setGError(''); setGLoading(true);
    try {
      await signInWithGoogle();
      // onAuthChange in useAuth will pick up the user and redirect
    } catch (e) {
      setGError('Could not sign in with Google. Try manual login below.');
    } finally {
      setGLoading(false);
    }
  };

  const handleManual = () => {
    if (!name.trim()) { setMError('Please enter your name.'); return; }
    if (!cls)         { setMError('Please select your class.'); return; }
    setMError('');
    setManualUser({ uid: `manual_${Date.now()}`, name: name.trim(), class: cls, language: lang });
    router.push('/home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-5 py-12">
      {/* Hero */}
      <div className="text-center mb-10 animate-fade-up">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow mb-5">
          <span className="text-4xl">📚</span>
        </div>
        <h1 className="font-display font-900 text-3xl text-slate-900 tracking-tight">
          Shiksha<span className="text-brand-500">Setu</span>
        </h1>
        <p className="mt-2 text-slate-500 text-base">Your smart learning companion</p>
      </div>

      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '80ms' }}>
        {/* Tab toggle */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
          {['google', 'manual'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-700 transition-all duration-200 ${
                tab === t
                  ? 'bg-white text-slate-800 shadow-card'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'google' ? '🔑 Google Login' : '✏️ Manual'}
            </button>
          ))}
        </div>

        {tab === 'google' ? (
          <div className="space-y-4">
            <button
              onClick={handleGoogle}
              disabled={gLoading}
              className="btn-google w-full gap-3 text-[15px]"
            >
              {gLoading ? <Spinner size="sm" color="slate" /> : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {gLoading ? 'Signing in…' : 'Continue with Google'}
            </button>
            {gError && <p className="text-rose-500 text-sm text-center">{gError}</p>}
            <p className="text-slate-400 text-xs text-center leading-relaxed">
              We only store your name and email.<br/>No passwords, no spam.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-600 text-slate-600 mb-1.5">Your Name</label>
              <input
                className="input"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-600 text-slate-600 mb-2">Select Class</label>
              <div className="flex flex-wrap gap-2">
                {CLASSES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCls(c)}
                    className={`h-10 w-10 rounded-xl text-sm font-700 transition-all ${
                      cls === c
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-600 text-slate-600 mb-2">Language</label>
              <div className="flex gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLang(l.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-600 border transition-all ${
                      lang === l.value
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {mError && <p className="text-rose-500 text-sm">{mError}</p>}

            <Button variant="primary" className="w-full text-base" onClick={handleManual}>
              Start Learning →
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-10 text-slate-400 text-xs text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        Built for students across Bharat 🇮🇳
      </p>
    </div>
  );
}
