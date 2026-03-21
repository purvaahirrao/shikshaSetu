// pages/result.jsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Volume2, Globe, RefreshCw, CheckCircle, ChevronRight, Bug, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { solveQuestion } from '../services/api';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import { getProgressUserId, recordQuestionSolved } from '../services/userProgress';

const LANG_PICKER = [
  { value: 'english', flag: '🇬🇧' },
  { value: 'hindi', flag: '🇮🇳' },
  { value: 'marathi', flag: '🇮🇳' },
];

function apiSubjectToMsgKey(s) {
  const x = String(s || 'general').toLowerCase();
  const map = {
    math: 'pro_subj_Mathematics',
    science: 'pro_subj_Science',
    english: 'pro_subj_English',
    social_science: 'pro_subj_Social_Science',
    general: 'pro_subj_General',
  };
  return map[x] || 'pro_subj_General';
}

function speak(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'hindi' ? 'hi-IN' : lang === 'marathi' ? 'mr-IN' : 'en-IN';
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export default function ResultPage() {
  const { user, loading, setManualUser } = useAuth();
  const { t, setGuestLocale, locale: uiLocale } = useI18n();
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('english');
  const [solving, setSolving] = useState(false);
  const [result, setResult] = useState(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [toast, setToast] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const fromScanRef = useRef(false);

  // --- Debug State ---
  const [logs, setLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(true); // Set to true to see logs by default

  const addLog = (msg, data = null) => {
    const logStr = `${new Date().toLocaleTimeString()} - ${msg} ${data ? JSON.stringify(data) : ''}`;
    console.log(`[RESULT] ${msg}`, data || '');
    setLogs(prev => [...prev, logStr]);
  };

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading]);

  useEffect(() => {
    const next =
      uiLocale === 'hindi' ? 'hindi' : uiLocale === 'marathi' ? 'marathi' : 'english';
    setLanguage(next);
  }, [uiLocale]);

  // Handle incoming OCR text and trigger auto-solve
  useEffect(() => {
    if (router.isReady) {
      addLog('URL Queries loaded:', router.query);

      if (router.query.text) {
        setQuestion(router.query.text);
        addLog('Question state set from URL parameter.');

        if (router.query.autoSolve === 'true') {
          fromScanRef.current = true;
        }

        // Auto-solve if it came directly from the scan page
        if (router.query.autoSolve === 'true') {
          addLog('autoSolve is true, triggering solve()...');
          const langForSolve =
            uiLocale === 'hindi' ? 'hindi' : uiLocale === 'marathi' ? 'marathi' : 'english';
          solve(router.query.text, langForSolve);
          // Clean up the URL so it doesn't auto-solve again if the user refreshes
          router.replace('/result', undefined, { shallow: true });
        }
      } else {
        addLog('No text found in URL parameters.');
      }
    }
  }, [router.isReady, router.query, uiLocale]);

  const solve = async (textToSolve = question, langToUse = language) => {
    if (!textToSolve.trim()) {
      setToast({ message: t('result_toastEmpty'), type: 'error' });
      return;
    }

    setSolving(true);
    setResult(null);
    addLog(`--- STARTING SOLVE API ---`);
    addLog(`Payload: Text="${textToSolve.substring(0, 30)}...", Lang="${langToUse}"`);

    try {
      const data = await solveQuestion(textToSolve, langToUse);
      addLog('✅ Solve API Response:', data);
      setResult(data);
      const pid = getProgressUserId(user);
      if (pid) {
        const fromScan = fromScanRef.current;
        fromScanRef.current = false;
        recordQuestionSolved(
          pid,
          {
            subject: data.subject || 'general',
            questionText: textToSolve,
            fromScan,
          },
          user,
        );
      }
    } catch (e) {
      addLog('❌ Solve API Catch Error:', e.message);
      setToast({ message: t('result_toastServer'), type: 'error' });
    } finally {
      setSolving(false);
    }
  };

  const handleListen = () => {
    if (!result) return;
    const text = `${result.answer}. ${result.steps?.join('. ')}`;
    speak(text, language);
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 4000);
    setToast({ message: t('result_toastRead'), type: 'info' });
  };

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setGuestLocale(lang);
    if (user?.source === 'manual' && user?.email) {
      const updated = { ...user, language: lang };
      setManualUser(updated);
      try {
        const db = JSON.parse(localStorage.getItem('ss_registered_users') || '{}');
        const key = user.email?.toLowerCase();
        if (key && db[key]) {
          db[key] = { ...db[key], ...updated };
          localStorage.setItem('ss_registered_users', JSON.stringify(db));
        }
      } catch {
        /* ignore */
      }
    }
    setShowLangPicker(false);
    if (result) {
      setResult(null);
      setToast({ message: t('result_toastLang'), type: 'info' });
    }
  };

  const subjectColors = { math: 'blue', science: 'green', english: 'indigo', social_science: 'amber', general: 'slate' };

  return (
    <AppShell
      title={t('page_answer')}
      back
      onBack={() => router.back()}
      right={
        <button
          onClick={() => setShowLangPicker(v => !v)}
          className="flex items-center gap-1.5 text-sm font-600 text-slate-500 hover:text-brand-500 transition-colors bg-slate-100 px-3 py-1.5 rounded-xl"
        >
          <Globe size={14} />
          {LANG_PICKER.find(l => l.value === language)?.flag}
        </button>
      }
    >
      <div className="px-5 pt-5 space-y-4 pb-20">

        {/* Language picker dropdown */}
        {showLangPicker && (
          <div className="card p-2 space-y-1 animate-fade-up border border-slate-100">
            {LANG_PICKER.map(l => (
              <button
                key={l.value}
                onClick={() => handleLangChange(l.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-600 transition-colors ${language === l.value ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <span className="text-lg">{l.flag}</span>
                {t(`lang_${l.value}`)}
                {language === l.value && <CheckCircle size={15} className="ml-auto text-brand-500" />}
              </button>
            ))}
          </div>
        )}

        {/* Question input */}
        <div className="animate-fade-up">
          <label className="block text-sm font-700 text-slate-600 mb-2">
            {t('result_qLabel')}
          </label>
          <textarea
            className="textarea min-h-[100px] text-base leading-relaxed"
            placeholder={t('result_qPlaceholder')}
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
        </div>

        {/* Solve button */}
        <Button
          variant="primary"
          className="w-full text-base py-4"
          loading={solving}
          onClick={() => solve()}
        >
          {!solving && '✨'} {solving ? t('result_solving') : t('result_getAnswer')}
        </Button>

        {/* Solving shimmer */}
        {solving && (
          <div className="space-y-3 animate-fade-in mt-4">
            {[80, 100, 60].map((w, i) => (
              <div key={i} className="skeleton h-5 rounded-xl bg-slate-200" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {/* ── Result ─────────────────────────────────────── */}
        {result && (
          <div className="space-y-4 animate-fade-up mt-4">

            {/* Subject badge */}
            {result.subject && (
              <Badge color={subjectColors[result.subject] || 'slate'}>
                📚 {t(apiSubjectToMsgKey(result.subject))}
                {result.cached && <span className="ml-1 opacity-60">{t('result_cached')}</span>}
              </Badge>
            )}

            {/* Answer card */}
            <div className="card border border-brand-100 bg-gradient-to-br from-white to-brand-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 bg-brand-500 rounded-lg flex items-center justify-center">
                  <CheckCircle size={14} className="text-white" />
                </div>
                <span className="text-sm font-700 text-brand-700">{result.labels?.answer_label || t('result_labelAnswer')}</span>
              </div>
              <p className="text-slate-800 text-base leading-relaxed font-500">{result.answer}</p>
            </div>

            {/* Steps card */}
            {result.steps?.length > 0 && (
              <div className="card">
                <p className="text-sm font-700 text-slate-600 mb-4">
                  🪜 {result.labels?.steps_label || t('result_labelSteps')}
                </p>
                <div className="space-y-3">
                  {result.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-500 text-white text-xs font-800 flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-slate-700 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tip card */}
            {result.tip && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-xs font-700 text-amber-700 mb-1">{result.labels?.tip_label || t('result_labelTip')}</p>
                  <p className="text-amber-800 text-sm leading-relaxed">{result.tip}</p>
                </div>
              </div>
            )}

            {/* Action row */}
            <div className="flex gap-3">
              <button
                onClick={handleListen}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-700 border transition-all
                  ${speaking
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 shadow-card'
                  }`}
              >
                <Volume2 size={16} className={speaking ? 'animate-pulse' : ''} />
                {speaking ? t('result_speaking') : t('result_listen')}
              </button>
              <button
                onClick={() => { setResult(null); setQuestion(''); router.push('/scan'); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-700 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 shadow-card transition-all"
              >
                <Camera size={15} /> {t('result_scanNew')}
              </button>
            </div>

            {/* Try chat */}
            <button
              onClick={() => router.push('/chat')}
              className="w-full flex items-center justify-between bg-slate-900 text-white rounded-2xl px-5 py-4 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">💬</span>
                <div className="text-left">
                  <p className="text-sm font-700">{t('result_doubtTitle')}</p>
                  <p className="text-xs text-slate-400">{t('result_doubtSub')}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        )}

        {/* --- LIVE DEBUG CONSOLE --- */}
        <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="w-full flex items-center justify-between p-3 bg-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2"><Bug size={16} /> {t('result_debugTitle')}</span>
            <span>{showDebug ? '▼' : '▲'}</span>
          </button>

          {showDebug && (
            <div className="p-3 max-h-48 overflow-y-auto text-xs font-mono text-slate-800 space-y-1">
              {logs.length === 0 ? <p className="text-slate-400 italic">{t('result_debugWait')}</p> : null}
              {logs.map((l, i) => (
                <div key={i} className="border-b border-slate-200 pb-1">{l}</div>
              ))}
            </div>
          )}
        </div>

      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}