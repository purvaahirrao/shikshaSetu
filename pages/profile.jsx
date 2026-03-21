// pages/profile.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import {
  LogOut, Settings, Bell, Shield, ChevronRight,
  Zap, Star, Award, GraduationCap, BookOpen, Users,
  Camera, Lock, Eye, EyeOff, Edit3, X, CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { useStudentProgress } from '../hooks/useStudentProgress';
import {
  getTeacherStudentSummaries,
  findLinkedStudentForParent,
  progressSnapshotForUserRecord,
} from '../services/rosterProgress';
import { accuracyPercent, badgesFromProgress } from '../services/userProgress';
import { translateSubjectDisplayName } from '../services/subjectI18n';

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'हिंदी' },
  { value: 'marathi', label: 'मराठी' },
];
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'Other'];
const STUDENT_GOALS = ['Improve Marks', 'Clear Doubts', 'Exam Preparation', 'Concept Building'];
const PARENT_GOALS = ['Improve Child Performance', 'Track Progress', 'Homework Help'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'];
const EXPERIENCE = ['0-1 years', '2-5 years', '5-10 years', '10+ years'];

export default function ProfilePage() {
  const { t, setGuestLocale, locale: uiLocale } = useI18n();
  const { user, loading, logout, setManualUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const st = useStudentProgress(user);

  // ── Extra stats (teacher / parent) ──────────────────────────────────────
  const [extraStats, setExtraStats] = useState({
    teacherStudentCount: 0,
    teacherBankCount: 0,
    parentChildAcc: null,
    parentChildActs: 0,
  });

  const refreshExtra = useCallback(() => {
    if (typeof window === 'undefined') return;
    const students = getTeacherStudentSummaries();
    let bankLen = 0;
    try { bankLen = JSON.parse(localStorage.getItem('ss_teacher_questions') || '[]').length; } catch { bankLen = 0; }

    const next = {
      teacherStudentCount: students.length,
      teacherBankCount: bankLen,
      parentChildAcc: null,
      parentChildActs: 0,
    };

    if (user?.role === 'parent') {
      const linked = findLinkedStudentForParent(user);
      const cp = linked ? progressSnapshotForUserRecord(linked) : null;
      next.parentChildAcc = cp ? accuracyPercent(cp) : null;
      next.parentChildActs = (cp?.questionsSolved ?? 0) + (cp?.quizSessions ?? 0);
    }
    setExtraStats(next);
  }, [user]);

  useEffect(() => { refreshExtra(); }, [refreshExtra]);
  useEffect(() => {
    window.addEventListener('focus', refreshExtra);
    window.addEventListener('storage', refreshExtra);
    return () => {
      window.removeEventListener('focus', refreshExtra);
      window.removeEventListener('storage', refreshExtra);
    };
  }, [refreshExtra]);

  // ── Editable form state ─────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [profilePic, setProfilePic] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [cls, setCls] = useState('');
  const [lang, setLang] = useState('english');
  const [board, setBoard] = useState('');
  const [goal, setGoal] = useState('');
  const [subject, setSubject] = useState('');
  const [exp, setExp] = useState('');
  const [childName, setChildName] = useState('');
  const [childClass, setChildClass] = useState('');
  const [parentGoal, setParentGoal] = useState('');

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (!loading && !user) { router.replace('/'); return; }
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setSchool(user.school || '');
      setCls(user.class || '');
      setLang(user.language || 'english');
      setBoard(user.board || '');
      setGoal(user.goal || '');
      setSubject(user.subject || '');
      setExp(user.experience || '');
      setChildName(user.childName || '');
      setChildClass(user.childClass || '');
      setParentGoal(user.goal || '');
      const pic = localStorage.getItem(`ss_profile_pic_${user.uid}`);
      if (pic) setProfilePic(pic);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  const role = user.role || 'student';
  const accentColor = role === 'teacher' ? 'indigo' : role === 'parent' ? 'amber' : 'brand';

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleLogout = async () => { await logout(); router.replace('/'); };

  const applyAppLanguage = useCallback(
    (value) => {
      setLang(value);
      setGuestLocale(value);
      const updated = { ...user, language: value };
      if (user?.source === 'manual' && user?.email) {
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
    },
    [user, setManualUser, setGuestLocale],
  );

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setProfilePic(dataUrl);
      localStorage.setItem(`ss_profile_pic_${user.uid}`, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const updated = { ...user, name, phone, school, language: lang };
    if (role === 'student') Object.assign(updated, { class: cls, board, goal });
    if (role === 'teacher') Object.assign(updated, { subject, experience: exp });
    if (role === 'parent') Object.assign(updated, { childName, childClass, goal: parentGoal });
    if (user?.source === 'manual') {
      setManualUser(updated);
    }
    setGuestLocale(lang);
    try {
      const db = JSON.parse(localStorage.getItem('ss_registered_users') || '{}');
      const key = user.email?.toLowerCase();
      if (key && db[key]) {
        db[key] = { ...db[key], ...updated };
        localStorage.setItem('ss_registered_users', JSON.stringify(db));
      }
    } catch { }
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    setPwError(''); setPwSuccess('');
    if (!oldPw) { setPwError(t('prof_pw_enterCurrent')); return; }
    if (newPw.length < 4) { setPwError(t('prof_pw_newMin')); return; }
    if (newPw !== confirmPw) { setPwError(t('prof_pw_mismatch')); return; }
    try {
      const db = JSON.parse(localStorage.getItem('ss_registered_users') || '{}');
      const key = user.email?.toLowerCase();
      if (!key || !db[key]) { setPwError(t('prof_pw_noAccount')); return; }
      if (db[key].password !== oldPw) { setPwError(t('prof_pw_wrongCurrent')); return; }
      db[key].password = newPw;
      localStorage.setItem('ss_registered_users', JSON.stringify(db));
      setPwSuccess(t('prof_pw_success'));
      setOldPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { setPwSuccess(''); setShowPwForm(false); }, 2000);
    } catch { setPwError(t('prof_pw_generic')); }
  };

  // ── Stats config ────────────────────────────────────────────────────────
  const statsConfig = useMemo(
    () =>
      role === 'teacher'
        ? [
            { label: t('prof_stat_students'), value: extraStats.teacherStudentCount, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-100' },
            { label: t('prof_stat_bankQs'), value: extraStats.teacherBankCount, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100' },
          ]
        : role === 'parent'
          ? [
              {
                label: t('prof_stat_childQuizAvg'),
                value: extraStats.parentChildAcc != null ? `${extraStats.parentChildAcc}%` : t('prof_na'),
                icon: Star,
                color: 'text-amber-500',
                bg: 'bg-amber-100',
              },
              { label: t('prof_stat_childActivity'), value: extraStats.parentChildActs, icon: BarChart3, color: 'text-orange-500', bg: 'bg-orange-100' },
            ]
          : [
              { label: t('prof_stat_dayStreak'), value: st.streak, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100' },
              { label: t('prof_stat_totalXp'), value: st.xp.toLocaleString(), icon: Star, color: 'text-purple-500', bg: 'bg-purple-100' },
            ],
    [role, t, extraStats, st.streak, st.xp],
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AppShell title={t('page_profile')}>
      <div className="px-5 py-6 space-y-6 animate-fade-in">

        {/* ── Avatar & name ───────────────────────────── */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {profilePic ? (
              <img
                src={profilePic}
                alt={t('page_profile')}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <Avatar src={user.photo} name={name} size="xl" />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`absolute bottom-0 right-0 h-9 w-9 bg-${accentColor}-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform`}
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <h2 className="font-display font-800 text-2xl text-slate-900">{name}</h2>
          <p className="text-slate-500 text-sm mt-1">{user.email || t('prof_manualAccount')}</p>

          {/* Role badge */}
          <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-800 uppercase tracking-wider px-2.5 py-1 rounded-md ${role === 'teacher' ? 'bg-indigo-100 text-indigo-600' :
              role === 'parent' ? 'bg-amber-100  text-amber-600' :
                'bg-brand-100  text-brand-600'
            }`}>
            {role === 'teacher' ? <BookOpen size={12} /> : role === 'parent' ? <Users size={12} /> : <GraduationCap size={12} />}
            {t(`role_${role}`)}
          </span>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {role === 'student' && (
              <>
                <span className="px-3 py-1 bg-brand-50  text-brand-700  text-xs font-700 rounded-full">{t('home_class')} {cls || '?'}</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-700 rounded-full capitalize">{LANGUAGES.find(l => l.value === lang)?.label ?? lang}</span>
                {board && <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-700 rounded-full">{board}</span>}
              </>
            )}
            {role === 'teacher' && (
              <>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-700 rounded-full">
                  {subject ? translateSubjectDisplayName(subject, t) : t('prof_teacherRole')}
                </span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-700 rounded-full">{exp || t('prof_experienced')}</span>
              </>
            )}
            {role === 'parent' && (
              <>
                <span className="px-3 py-1 bg-amber-50  text-amber-700  text-xs font-700 rounded-full">{t('prof_childLabel')} {childName || t('prof_na')}</span>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-700 rounded-full">{t('home_class')} {childClass || '?'}</span>
              </>
            )}
          </div>

          <div className="w-full max-w-sm mt-4">
            <p className="text-xs font-600 text-slate-500 mb-2 text-center">{t('auth_appLanguage')}</p>
            <p className="text-[10px] text-slate-400 mb-2 text-center">{t('auth_appLanguageHint')}</p>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => applyAppLanguage(l.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-600 border transition-all ${
                    uiLocale === l.value
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

          <button
            onClick={() => setIsEditing(true)}
            className={`mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-700 transition-all ${role === 'teacher' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' :
                role === 'parent' ? 'bg-amber-50  text-amber-700  hover:bg-amber-100' :
                  'bg-brand-50  text-brand-600  hover:bg-brand-100'
              }`}
          >
            <Edit3 size={14} /> {t('prof_editProfile')}
          </button>
        </div>

        {/* ── Stats ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {statsConfig.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                <Icon size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-2xl font-display font-900 text-slate-800">{value}</p>
                <p className="text-[10px] font-800 text-slate-400 uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Achievements (student only) ──────────────── */}
        {role === 'student' && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '150ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base px-1">{t('prof_achievements')}</h3>
            <div className="card p-4 space-y-3">
              {badgesFromProgress(st.progress).map((b) => (
                <div
                  key={b.id}
                  className={`flex items-start gap-3 py-2 border-b border-slate-50 last:border-0 ${b.earned ? '' : 'opacity-45'}`}
                >
                  <div className="bg-slate-100 p-2 rounded-xl shrink-0">
                    <Award size={20} className={b.earned ? 'text-amber-500' : 'text-slate-400'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-800 text-slate-800 text-sm">{t(b.titleKey)}</h4>
                    <p className="text-xs font-600 text-slate-500 mt-0.5">{t(b.descKey)}</p>
                  </div>
                  {b.earned && <CheckCircle2 size={18} className="text-brand-500 shrink-0 mt-0.5" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Edit Profile Form ────────────────────────── */}
        {isEditing && (
          <div className="card space-y-4 border-2 border-slate-200 animate-slide-in">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-800 text-slate-800">{t('prof_editProfile')}</h3>
              <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-500 mb-1.5">{t('auth_fullName')}</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder={t('prof_placeholder_yourName')} />
            </div>
            <div>
              <label className="block text-xs font-600 text-slate-500 mb-1.5">{t('auth_phone')}</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder={t('prof_placeholder_phone10')} type="tel" maxLength={10} />
            </div>
            <div>
              <label className="block text-xs font-600 text-slate-500 mb-1.5">{t('auth_school')}</label>
              <input className="input" value={school} onChange={e => setSchool(e.target.value)} placeholder={t('prof_placeholder_school')} />
            </div>

            {role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('home_class')}</label>
                  <div className="flex flex-wrap gap-2">
                    {CLASSES.map(c => (
                      <button key={c} onClick={() => setCls(c)} className={`h-9 w-9 rounded-xl text-sm font-700 transition-all ${cls === c ? 'bg-brand-500 text-white shadow-glow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_appLanguage')}</label>
                  <div className="flex gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => applyAppLanguage(l.value)}
                        className={`flex-1 py-2 rounded-xl text-sm font-600 transition-all ${
                          lang === l.value ? 'bg-brand-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_board')}</label>
                  <div className="flex flex-wrap gap-2">
                    {BOARDS.map(b => (
                      <button key={b} onClick={() => setBoard(b)} className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${board === b ? 'bg-brand-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{b}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_learningGoal')}</label>
                  <div className="flex flex-wrap gap-2">
                    {STUDENT_GOALS.map(g => (
                      <button key={g} onClick={() => setGoal(g)} className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${goal === g ? 'bg-brand-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {role === 'teacher' && (
              <>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_appLanguage')}</label>
                  <div className="flex gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => applyAppLanguage(l.value)}
                        className={`flex-1 py-2 rounded-xl text-sm font-600 transition-all ${
                          uiLocale === l.value ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_subjectExpertise')}</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(s)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${subject === s ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {translateSubjectDisplayName(s, t)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_experience')}</label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE.map(ex => (
                      <button key={ex} onClick={() => setExp(ex)} className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${exp === ex ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{ex}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {role === 'parent' && (
              <>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_appLanguage')}</label>
                  <div className="flex gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => applyAppLanguage(l.value)}
                        className={`flex-1 py-2 rounded-xl text-sm font-600 transition-all ${
                          uiLocale === l.value ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-1.5">{t('auth_childName')}</label>
                  <input className="input" value={childName} onChange={e => setChildName(e.target.value)} placeholder={t('auth_childNamePh')} />
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_childClass')}</label>
                  <div className="flex flex-wrap gap-2">
                    {CLASSES.map(c => (
                      <button key={c} onClick={() => setChildClass(c)} className={`h-9 w-9 rounded-xl text-sm font-700 transition-all ${childClass === c ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">{t('auth_yourGoal')}</label>
                  <div className="flex flex-wrap gap-2">
                    {PARENT_GOALS.map(g => (
                      <button key={g} onClick={() => setParentGoal(g)} className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${parentGoal === g ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button variant="primary" className="w-full mt-2" onClick={handleSaveProfile}>
              {t('prof_saveChanges')}
            </Button>
          </div>
        )}

        {/* ── Account Settings ────────────────────────── */}
        <div className="space-y-3">
          <h3 className="font-display font-800 text-slate-700 text-base px-1">{t('prof_account')}</h3>
          <div className="card p-0 overflow-hidden">

            {/* Change password */}
            <button
              onClick={() => { setShowPwForm(v => !v); setPwError(''); setPwSuccess(''); }}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50"
            >
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Lock size={18} /></div>
                {t('prof_changePassword')}
              </div>
              <ChevronRight size={18} className={`text-slate-400 transition-transform ${showPwForm ? 'rotate-90' : ''}`} />
            </button>

            {showPwForm && (
              <div className="px-4 pb-4 space-y-3 animate-slide-in">
                <div className="relative">
                  <input className="input pr-10" type={showOldPw ? 'text' : 'password'} placeholder={t('prof_currentPwPh')} value={oldPw} onChange={e => setOldPw(e.target.value)} />
                  <button type="button" onClick={() => setShowOldPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showOldPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="relative">
                  <input className="input pr-10" type={showNewPw ? 'text' : 'password'} placeholder={t('prof_newPwPh')} value={newPw} onChange={e => setNewPw(e.target.value)} />
                  <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input className="input" type="password" placeholder={t('prof_confirmPwPh')} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                {pwError && <p className="text-rose-500 text-xs">{pwError}</p>}
                {pwSuccess && <p className="text-brand-600 text-xs flex items-center gap-1"><CheckCircle2 size={14} />{pwSuccess}</p>}
                <Button variant="primary" className="w-full text-sm" onClick={handleChangePassword}>
                  {t('prof_updatePassword')}
                </Button>
              </div>
            )}

            <Link href="/settings/notifications" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Bell size={18} /></div>
                {t('prof_notifications')}
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            <Link href="/settings/preferences" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Settings size={18} /></div>
                {t('prof_appPreferences')}
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            <Link href="/settings/privacy" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Shield size={18} /></div>
                {t('prof_privacySecurity')}
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ── Logout ──────────────────────────────────── */}
        <div className="pt-2 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-700 text-sm text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut size={18} />
            {t('prof_logOut')}
          </button>

          <p className="mt-6 text-center text-xs text-slate-400 font-500">
            <span className="inline-block px-3 py-1 bg-slate-100 rounded text-[10px] tracking-wider uppercase">
              ShikshaSetu v1.1
            </span>
          </p>
        </div>

      </div>
    </AppShell>
  );
}
