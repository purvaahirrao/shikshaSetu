// pages/index.jsx  — Multi-role onboarding with persistent login
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { signInWithGoogle } from '../services/firebase';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { GraduationCap, BookOpen, Users, ArrowLeft, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const CLASSES   = ['1','2','3','4','5','6','7','8','9','10'];
const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi',   label: 'हिंदी'   },
  { value: 'marathi', label: 'मराठी'   },
];

const ROLES = [
  { id: 'student', icon: GraduationCap, gradient: 'from-brand-400 to-brand-600' },
  { id: 'teacher', icon: BookOpen, gradient: 'from-indigo-400 to-indigo-600' },
  { id: 'parent', icon: Users, gradient: 'from-amber-400 to-amber-600' },
];

const BOARDS = [
  { value: 'CBSE', key: 'opt_board_cbse' },
  { value: 'ICSE', key: 'opt_board_icse' },
  { value: 'State Board', key: 'opt_board_state' },
  { value: 'Other', key: 'opt_board_other' },
];
const STUDENT_GOALS = [
  { value: 'Improve Marks', key: 'opt_goal_improveMarks' },
  { value: 'Clear Doubts', key: 'opt_goal_clearDoubts' },
  { value: 'Exam Preparation', key: 'opt_goal_examPrep' },
  { value: 'Concept Building', key: 'opt_goal_concept' },
];
const PARENT_GOALS = [
  { value: 'Improve Child Performance', key: 'opt_pg_improve' },
  { value: 'Track Progress', key: 'opt_pg_track' },
  { value: 'Homework Help', key: 'opt_pg_homework' },
];
const SUBJECTS = [
  { value: 'Mathematics', key: 'opt_subj_math' },
  { value: 'Science', key: 'opt_subj_science' },
  { value: 'English', key: 'opt_subj_english' },
  { value: 'Social Science', key: 'opt_subj_social' },
  { value: 'Hindi', key: 'opt_subj_hindi' },
  { value: 'Computer Science', key: 'opt_subj_cs' },
];
const EXPERIENCE = [
  { value: '0-1 years', key: 'opt_exp_01' },
  { value: '2-5 years', key: 'opt_exp_25' },
  { value: '5-10 years', key: 'opt_exp_510' },
  { value: '10+ years', key: 'opt_exp_10p' },
];

// ── localStorage user DB helpers ────────────────────────
const SS_USERS_KEY = 'ss_registered_users';

function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem(SS_USERS_KEY) || '{}'); } catch { return {}; }
}

function saveRegisteredUser(email, userData) {
  const users = getRegisteredUsers();
  users[email.toLowerCase()] = userData;
  localStorage.setItem(SS_USERS_KEY, JSON.stringify(users));
}

function findRegisteredUser(email, password) {
  const users = getRegisteredUsers();
  const user = users[email.toLowerCase()];
  if (!user) return { errorKey: 'err_noAccount' };
  if (user.password !== password) return { errorKey: 'err_wrongPassword' };
  return { user };
}

// ─────────────────────────────────────────────────────────

export default function LoginPage() {
  const { user, loading, setManualUser } = useAuth();
  const { t, locale, setGuestLocale } = useI18n();
  const router = useRouter();
  const firstInputRef = useRef(null);

  // Flow: 'login' | 'role' | 'form'
  const [step, setStep] = useState('login');
  const [role, setRole] = useState('student');

  // Google auth
  const [gLoading, setGLoading] = useState(false);
  const [gError,   setGError]   = useState('');

  // Email & password (shared)
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [mError,   setMError]   = useState('');

  // Shared fields
  const [name,   setName]   = useState('');
  const [phone,  setPhone]  = useState('');
  const [school, setSchool] = useState('');

  // Student fields
  const [cls,   setCls]   = useState('');
  const [lang,  setLang]  = useState('english');
  const [board, setBoard] = useState('');
  const [goal,  setGoal]  = useState('');

  // Teacher fields
  const [subject,      setSubject]      = useState('');
  const [experience,   setExperience]   = useState('');
  const [teachClasses, setTeachClasses] = useState([]);

  // Parent fields
  const [childName,  setChildName]  = useState('');
  const [childClass, setChildClass] = useState('');
  const [parentGoal, setParentGoal] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/home');
  }, [user, loading, router]);

  useEffect(() => {
    if (step === 'form') setLang(locale);
  }, [step, locale]);

  useEffect(() => {
    if (step === 'form' || step === 'login') {
      setTimeout(() => firstInputRef.current?.focus(), 200);
    }
  }, [step]);

  // ── Handlers ──────────────────────────────────────────

  const handleGoogle = async () => {
    setGError('');
    setGLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setGError(t('err_google'));
    } finally {
      setGLoading(false);
    }
  };

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p) => /^[0-9]{10}$/.test(p);

  // Log in with existing credentials
  const handleLogin = () => {
    if (!email.trim()) {
      setMError(t('err_enterEmail'));
      return;
    }
    if (!validateEmail(email)) {
      setMError(t('err_validEmail'));
      return;
    }
    if (!password) {
      setMError(t('err_enterPassword'));
      return;
    }
    if (password.length < 4) {
      setMError(t('err_pwLength'));
      return;
    }

    setMError('');
    const result = findRegisteredUser(email, password);
    if (result.errorKey) {
      setMError(t(result.errorKey));
      return;
    }

    // Restore user — omit the password from active session
    const { password: _pw, ...userData } = result.user;
    setManualUser(userData);
    router.push('/home');
  };

  // Register a new account
  const handleRegister = () => {
    if (!email.trim()) {
      setMError(t('err_enterEmail'));
      return;
    }
    if (!validateEmail(email)) {
      setMError(t('err_validEmail'));
      return;
    }
    if (!password) {
      setMError(t('err_createPw'));
      return;
    }
    if (password.length < 4) {
      setMError(t('err_pwLength'));
      return;
    }
    if (!name.trim()) {
      setMError(t('err_enterName'));
      return;
    }
    if (phone && !validatePhone(phone)) {
      setMError(t('err_phoneDigits'));
      return;
    }

    const existing = getRegisteredUsers();
    if (existing[email.toLowerCase()]) {
      setMError(t('err_emailExists'));
      return;
    }

    setMError('');

    const base = {
      uid: `manual_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      phone: phone.trim(),
      school: school.trim(),
      role,
      language: lang,
    };

    let userData;

    if (role === 'student') {
      if (!cls) {
        setMError(t('err_selectClass'));
        return;
      }
      userData = { ...base, class: cls, board, goal };
    } else if (role === 'teacher') {
      if (!subject) {
        setMError(t('err_selectSubject'));
        return;
      }
      userData = { ...base, subject, experience, teachClasses };
    } else {
      if (!childName.trim()) {
        setMError(t('err_childName'));
        return;
      }
      if (!childClass) {
        setMError(t('err_childClass'));
        return;
      }
      userData = { ...base, childName: childName.trim(), childClass, goal: parentGoal };
    }

    // Save to user DB with password
    saveRegisteredUser(email, { ...userData, password });

    // Set active session (without password)
    setManualUser(userData);
    router.push('/home');
  };

  const toggleTeachClass = (c) => {
    setTeachClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const submitLabel =
    role === 'student' ? t('auth_startLearning') : role === 'teacher' ? t('auth_continueTeacher') : t('auth_viewChildDash');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-slate-400">{t('auth_checkingSession')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-5 py-10">
      {/* Hero */}
      <div className="text-center mb-8 animate-fade-up">
        <div className="inline-flex items-center justify-center mb-4">
          <img 
            src="https://user5301.na.imgto.link/public/20260321/az0pmpqr3wttpr2cmzwy7w-az0pmpqrar-qd1us4ehj7a-1.avif" 
            alt="ShikshaSetu Logo" 
            className="h-20 w-20 object-contain drop-shadow-md rounded-2xl"
          />
        </div>
        <h1 className="font-display font-900 text-3xl text-slate-900 tracking-tight">
          Shiksha<span className="text-brand-500">Setu</span>
        </h1>
        <p className="mt-1.5 text-slate-500 text-sm">{t('auth_tagline')}</p>
      </div>

      <div className="w-full max-w-sm">

        {/* ══════════════════════════════════════════════════
            STEP: LOGIN (returning users)
           ══════════════════════════════════════════════════ */}
        {step === 'login' && (
          <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
            <p className="text-center text-sm font-700 text-slate-600 mb-5">{t('auth_welcomeBack')}</p>

            <div className="mb-5">
              <p className="text-xs font-600 text-slate-500 mb-1">{t('auth_uiLanguage')}</p>
              <p className="text-[10px] text-slate-400 mb-2">{t('auth_uiLanguageHint')}</p>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setGuestLocale(l.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-600 border transition-all ${
                      locale === l.value
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={firstInputRef}
                    className="input pl-10"
                    type="email"
                    placeholder={t('auth_placeholderEmail')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_password')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-10 pr-10"
                    type={showPw ? 'text' : 'password'}
                    placeholder={t('auth_placeholderPw')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mError && <p className="text-rose-500 text-sm">{mError}</p>}

              <Button variant="primary" className="w-full text-base" onClick={handleLogin}>
                {t('auth_logIn')} <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-600 text-slate-400 uppercase tracking-wider">{t('auth_or')}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                onClick={handleGoogle}
                disabled={gLoading}
                className="btn-google w-full gap-3 text-sm"
              >
                {gLoading ? <Spinner size="sm" color="slate" /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {gLoading ? t('auth_googleLoading') : t('auth_google')}
              </button>
              {gError && <p className="text-rose-500 text-sm text-center mt-2">{gError}</p>}
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              {t('auth_newHere')}{' '}
              <button onClick={() => { setMError(''); setStep('role'); }} className="text-brand-600 font-700 hover:underline">
                {t('auth_createAccount')}
              </button>
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP: ROLE SELECTION (new users)
           ══════════════════════════════════════════════════ */}
        {step === 'role' && (
          <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
            <button onClick={() => { setMError(''); setStep('login'); }} className="flex items-center gap-1 text-sm font-600 text-slate-500 hover:text-brand-600 mb-4 transition-colors">
              <ArrowLeft size={16} /> {t('auth_backLogin')}
            </button>

            <p className="text-center text-sm font-700 text-slate-600 mb-4">{t('auth_iAmA')}</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {ROLES.map(({ id, icon: Icon, gradient }) => (
                <button
                  key={id}
                  onClick={() => setRole(id)}
                  className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[.97] ${
                    role === id
                      ? 'border-transparent shadow-lg scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {role === id && (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-10`} />
                  )}
                  <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-2 ${
                    role === id ? `bg-gradient-to-br ${gradient} shadow-md` : 'bg-slate-100'
                  }`}>
                    <Icon size={22} className={role === id ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <p className={`relative font-800 text-sm ${role === id ? 'text-slate-900' : 'text-slate-600'}`}>{t(`role_${id}`)}</p>
                  <p className="relative text-[10px] font-500 text-slate-400 mt-0.5">{t(`role_${id}Desc`)}</p>
                  {role === id && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button variant="primary" className="w-full text-base" onClick={() => { setMError(''); setStep('form'); }}>
              {t('auth_continue')} <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP: REGISTRATION FORM
           ══════════════════════════════════════════════════ */}
        {step === 'form' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep('role')} className="flex items-center gap-1 text-sm font-600 text-slate-500 hover:text-brand-600 mb-5 transition-colors">
              <ArrowLeft size={16} /> {t('auth_changeRole')}
            </button>

            <div className="flex items-center gap-2 mb-5 px-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${ROLES.find(r => r.id === role).gradient}`}>
                {(() => { const R = ROLES.find(r => r.id === role).icon; return <R size={16} className="text-white" />; })()}
              </div>
              <div>
                <p className="text-xs font-600 text-slate-400 uppercase tracking-wider">
                  {t(`role_${role}`)} · {t('auth_registration')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* ── Email & Password ─── */}
              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={firstInputRef}
                    className="input pl-10"
                    type="email"
                    placeholder={t('auth_placeholderEmail')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_createPw')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-10 pr-10"
                    type={showPw ? 'text' : 'password'}
                    placeholder={t('auth_pwHint')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* ── Name ─── */}
              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_fullName')}</label>
                <input
                  className="input"
                  placeholder={role === 'parent' ? t('auth_parentNamePh') : t('auth_namePh')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* ── Phone ─── */}
              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_phone')}</label>
                <input
                  className="input"
                  placeholder={t('auth_phonePh')}
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm font-600 text-slate-600 mb-2">{t('auth_appLanguage')}</label>
                <p className="text-[11px] text-slate-400 mb-2">{t('auth_appLanguageHint')}</p>
                <div className="flex gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => {
                        setLang(l.value);
                        setGuestLocale(l.value);
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-600 border transition-all ${
                        lang === l.value
                          ? role === 'teacher'
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : role === 'parent'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ════════════ STUDENT FIELDS ════════════ */}
              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">{t('auth_selectClass')}</label>
                    <div className="flex flex-wrap gap-2">
                      {CLASSES.map(c => (
                        <button key={c} onClick={() => setCls(c)}
                          className={`h-10 w-10 rounded-xl text-sm font-700 transition-all ${
                            cls === c ? 'bg-brand-500 text-white shadow-glow' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
                          }`}>{c}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_school')}</label>
                    <input className="input" placeholder={t('auth_schoolPhStudent')} value={school} onChange={e => setSchool(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">{t('auth_board')}</label>
                    <div className="flex flex-wrap gap-2">
                      {BOARDS.map((b) => (
                        <button key={b.value} onClick={() => setBoard(b.value)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            board === b.value ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                          }`}>{t(b.key)}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">{t('auth_learningGoal')}</label>
                    <div className="flex flex-wrap gap-2">
                      {STUDENT_GOALS.map((g) => (
                        <button key={g.value} onClick={() => setGoal(g.value)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            goal === g.value ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                          }`}>{t(g.key)}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ════════════ TEACHER FIELDS ════════════ */}
              {role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">{t('auth_subjectExpertise')}</label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((s) => (
                        <button key={s.value} onClick={() => setSubject(s.value)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            subject === s.value ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}>{t(s.key)}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_school')}</label>
                    <input className="input" placeholder={t('auth_schoolPhTeacher')} value={school} onChange={e => setSchool(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">{t('auth_experience')}</label>
                    <div className="flex flex-wrap gap-2">
                      {EXPERIENCE.map((ex) => (
                        <button key={ex.value} onClick={() => setExperience(ex.value)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            experience === ex.value ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}>{t(ex.key)}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">
                      {t('auth_classesTeaching')}{' '}
                      <span className="text-slate-400 font-500">{t('auth_selectMultiple')}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CLASSES.map(c => (
                        <button key={c} onClick={() => toggleTeachClass(c)}
                          className={`h-10 w-10 rounded-xl text-sm font-700 transition-all ${
                            teachClasses.includes(c) ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                          }`}>{c}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ════════════ PARENT FIELDS ════════════ */}
              {role === 'parent' && (
                <>
                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_childName')}</label>
                    <input className="input" placeholder={t('auth_childNamePh')} value={childName} onChange={e => setChildName(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">{t('auth_childClass')}</label>
                    <div className="flex flex-wrap gap-2">
                      {CLASSES.map(c => (
                        <button key={c} onClick={() => setChildClass(c)}
                          className={`h-10 w-10 rounded-xl text-sm font-700 transition-all ${
                            childClass === c ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
                          }`}>{c}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-1.5">{t('auth_school')}</label>
                    <input className="input" placeholder={t('auth_schoolPhStudent')} value={school} onChange={e => setSchool(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">{t('auth_yourGoal')}</label>
                    <div className="flex flex-wrap gap-2">
                      {PARENT_GOALS.map((g) => (
                        <button key={g.value} onClick={() => setParentGoal(g.value)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            parentGoal === g.value ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                          }`}>{t(g.key)}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mError && <p className="text-rose-500 text-sm">{mError}</p>}

              <Button variant="primary" className="w-full text-base mt-2" onClick={handleRegister}>
                {submitLabel} <ArrowRight size={16} className="ml-1" />
              </Button>

              <p className="text-center text-sm text-slate-500">
                {t('auth_alreadyHave')}{' '}
                <button onClick={() => { setMError(''); setStep('login'); }} className="text-brand-600 font-700 hover:underline">
                  {t('auth_logInLink')}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-slate-400 text-xs text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        {t('auth_footer')}
      </p>
    </div>
  );
}
