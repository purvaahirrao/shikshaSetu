// pages/index.jsx  — Multi-role onboarding with persistent login
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
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
  { id: 'student', label: 'Student',  icon: GraduationCap, desc: 'Learn & practice', gradient: 'from-brand-400 to-brand-600' },
  { id: 'teacher', label: 'Teacher',  icon: BookOpen,      desc: 'Teach & monitor',  gradient: 'from-indigo-400 to-indigo-600' },
  { id: 'parent',  label: 'Parent',   icon: Users,         desc: 'Track & support',  gradient: 'from-amber-400 to-amber-600' },
];

const BOARDS        = ['CBSE', 'ICSE', 'State Board', 'Other'];
const STUDENT_GOALS = ['Improve Marks', 'Clear Doubts', 'Exam Preparation', 'Concept Building'];
const PARENT_GOALS  = ['Improve Child Performance', 'Track Progress', 'Homework Help'];
const SUBJECTS      = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'];
const EXPERIENCE    = ['0-1 years', '2-5 years', '5-10 years', '10+ years'];

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
  if (!user) return { error: 'No account found with this email. Please register first.' };
  if (user.password !== password) return { error: 'Incorrect password. Please try again.' };
  return { user };
}

// ─────────────────────────────────────────────────────────

export default function LoginPage() {
  const { user, loading, setManualUser } = useAuth();
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
    if (step === 'form' || step === 'login') {
      setTimeout(() => firstInputRef.current?.focus(), 200);
    }
  }, [step]);

  // ── Handlers ──────────────────────────────────────────

  const handleGoogle = async () => {
    setGError(''); setGLoading(true);
    try { await signInWithGoogle(); }
    catch { setGError('Could not sign in with Google.'); }
    finally { setGLoading(false); }
  };

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p) => /^[0-9]{10}$/.test(p);

  // Log in with existing credentials
  const handleLogin = () => {
    if (!email.trim())    { setMError('Please enter your email.'); return; }
    if (!validateEmail(email)) { setMError('Please enter a valid email address.'); return; }
    if (!password)        { setMError('Please enter your password.'); return; }
    if (password.length < 4) { setMError('Password must be at least 4 characters.'); return; }

    setMError('');
    const result = findRegisteredUser(email, password);
    if (result.error) { setMError(result.error); return; }

    // Restore user — omit the password from active session
    const { password: _pw, ...userData } = result.user;
    setManualUser(userData);
    router.push('/home');
  };

  // Register a new account
  const handleRegister = () => {
    if (!email.trim())    { setMError('Please enter your email.'); return; }
    if (!validateEmail(email)) { setMError('Please enter a valid email address.'); return; }
    if (!password)        { setMError('Please create a password.'); return; }
    if (password.length < 4) { setMError('Password must be at least 4 characters.'); return; }
    if (!name.trim())     { setMError('Please enter your name.'); return; }
    if (phone && !validatePhone(phone)) { setMError('Please enter a valid 10-digit phone number.'); return; }

    // Check if email already exists
    const existing = getRegisteredUsers();
    if (existing[email.toLowerCase()]) {
      setMError('An account with this email already exists. Please log in instead.');
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
      if (!cls) { setMError('Please select your class.'); return; }
      userData = { ...base, class: cls, board, goal };
    } else if (role === 'teacher') {
      if (!subject) { setMError('Please select your subject.'); return; }
      userData = { ...base, subject, experience, teachClasses };
    } else {
      if (!childName.trim()) { setMError("Please enter your child's name."); return; }
      if (!childClass)       { setMError("Please select your child's class."); return; }
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

  const submitLabel = role === 'student' ? 'Start Learning' : role === 'teacher' ? 'Continue as Teacher' : 'View Child Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-5 py-10">
      {loading && (
        <p className="text-center text-xs text-slate-400 mb-2" aria-live="polite">
          Checking saved session…
        </p>
      )}
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
        <p className="mt-1.5 text-slate-500 text-sm">Your smart learning companion</p>
      </div>

      <div className="w-full max-w-sm">

        {/* ══════════════════════════════════════════════════
            STEP: LOGIN (returning users)
           ══════════════════════════════════════════════════ */}
        {step === 'login' && (
          <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
            <p className="text-center text-sm font-700 text-slate-600 mb-5">Welcome back! Log in to continue.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={firstInputRef}
                    className="input pl-10"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-10 pr-10"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
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
                Log In <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-600 text-slate-400 uppercase tracking-wider">or</span>
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
                {gLoading ? 'Signing in...' : 'Continue with Google'}
              </button>
              {gError && <p className="text-rose-500 text-sm text-center mt-2">{gError}</p>}
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              New here?{' '}
              <button onClick={() => { setMError(''); setStep('role'); }} className="text-brand-600 font-700 hover:underline">
                Create an account
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
              <ArrowLeft size={16} /> Back to login
            </button>

            <p className="text-center text-sm font-700 text-slate-600 mb-4">I am a...</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {ROLES.map(({ id, label, icon: Icon, desc, gradient }) => (
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
                  <p className={`relative font-800 text-sm ${role === id ? 'text-slate-900' : 'text-slate-600'}`}>{label}</p>
                  <p className="relative text-[10px] font-500 text-slate-400 mt-0.5">{desc}</p>
                  {role === id && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button variant="primary" className="w-full text-base" onClick={() => { setMError(''); setStep('form'); }}>
              Continue <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP: REGISTRATION FORM
           ══════════════════════════════════════════════════ */}
        {step === 'form' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep('role')} className="flex items-center gap-1 text-sm font-600 text-slate-500 hover:text-brand-600 mb-5 transition-colors">
              <ArrowLeft size={16} /> Change role
            </button>

            <div className="flex items-center gap-2 mb-5 px-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${ROLES.find(r => r.id === role).gradient}`}>
                {(() => { const R = ROLES.find(r => r.id === role).icon; return <R size={16} className="text-white" />; })()}
              </div>
              <div>
                <p className="text-xs font-600 text-slate-400 uppercase tracking-wider">{role} Registration</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* ── Email & Password ─── */}
              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={firstInputRef}
                    className="input pl-10"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">Create Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-10 pr-10"
                    type={showPw ? 'text' : 'password'}
                    placeholder="At least 4 characters"
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
                <label className="block text-sm font-600 text-slate-600 mb-1.5">Full Name</label>
                <input
                  className="input"
                  placeholder={role === 'parent' ? 'Parent Name' : 'e.g. Priya Sharma'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* ── Phone ─── */}
              <div>
                <label className="block text-sm font-600 text-slate-600 mb-1.5">Phone Number</label>
                <input
                  className="input"
                  placeholder="10-digit mobile number"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {/* ════════════ STUDENT FIELDS ════════════ */}
              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">Select Class</label>
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
                    <label className="block text-sm font-600 text-slate-600 mb-2">Language</label>
                    <div className="flex gap-2">
                      {LANGUAGES.map(l => (
                        <button key={l.value} onClick={() => setLang(l.value)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-600 border transition-all ${
                            lang === l.value ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                          }`}>{l.label}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-1.5">School Name</label>
                    <input className="input" placeholder="e.g. Kendriya Vidyalaya" value={school} onChange={e => setSchool(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">Board</label>
                    <div className="flex flex-wrap gap-2">
                      {BOARDS.map(b => (
                        <button key={b} onClick={() => setBoard(b)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            board === b ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                          }`}>{b}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">Learning Goal</label>
                    <div className="flex flex-wrap gap-2">
                      {STUDENT_GOALS.map(g => (
                        <button key={g} onClick={() => setGoal(g)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            goal === g ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                          }`}>{g}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ════════════ TEACHER FIELDS ════════════ */}
              {role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">Subject Expertise</label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map(s => (
                        <button key={s} onClick={() => setSubject(s)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            subject === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-1.5">School Name</label>
                    <input className="input" placeholder="e.g. Delhi Public School" value={school} onChange={e => setSchool(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">Years of Experience</label>
                    <div className="flex flex-wrap gap-2">
                      {EXPERIENCE.map(ex => (
                        <button key={ex} onClick={() => setExperience(ex)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            experience === ex ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}>{ex}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">Classes Teaching <span className="text-slate-400 font-500">(select multiple)</span></label>
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
                    <label className="block text-sm font-600 text-slate-600 mb-1.5">Child's Name</label>
                    <input className="input" placeholder="e.g. Aarav" value={childName} onChange={e => setChildName(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">Child's Class</label>
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
                    <label className="block text-sm font-600 text-slate-600 mb-1.5">School Name</label>
                    <input className="input" placeholder="e.g. Kendriya Vidyalaya" value={school} onChange={e => setSchool(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-slate-600 mb-2">Your Goal</label>
                    <div className="flex flex-wrap gap-2">
                      {PARENT_GOALS.map(g => (
                        <button key={g} onClick={() => setParentGoal(g)}
                          className={`px-3 py-2 rounded-xl text-sm font-600 border transition-all ${
                            parentGoal === g ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                          }`}>{g}</button>
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
                Already have an account?{' '}
                <button onClick={() => { setMError(''); setStep('login'); }} className="text-brand-600 font-700 hover:underline">
                  Log in
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-slate-400 text-xs text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        Built for learners across Bharat
      </p>
    </div>
  );
}
