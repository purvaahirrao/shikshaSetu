<<<<<<< HEAD
import { useState, useEffect, useRef } from 'react';
=======
import { useState, useEffect, useRef, useCallback } from 'react';
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { LogOut, Settings, User, Bell, Shield, ChevronRight, Zap, Star, Award, GraduationCap, BookOpen, Users, Camera, Lock, Eye, EyeOff, Edit3, X, CheckCircle2, Phone, School, Target, BarChart3 } from 'lucide-react';
<<<<<<< HEAD
=======
import { useStudentProgress } from '../hooks/useStudentProgress';
import {
  getTeacherStudentSummaries,
  findLinkedStudentForParent,
  progressSnapshotForUserRecord,
} from '../services/rosterProgress';
import { accuracyPercent, badgesFromProgress } from '../services/userProgress';
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e

const CLASSES = ['1','2','3','4','5','6','7','8','9','10'];
const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi',   label: 'हिंदी'   },
  { value: 'marathi', label: 'मराठी'   },
];
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'Other'];
const STUDENT_GOALS = ['Improve Marks', 'Clear Doubts', 'Exam Preparation', 'Concept Building'];
const PARENT_GOALS = ['Improve Child Performance', 'Track Progress', 'Homework Help'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'];
const EXPERIENCE = ['0-1 years', '2-5 years', '5-10 years', '10+ years'];

export default function ProfilePage() {
  const { user, loading, logout, setManualUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
<<<<<<< HEAD

  const [isEditing, setIsEditing]       = useState(false);
  const [showPwForm, setShowPwForm]     = useState(false);
  const [pwSuccess, setPwSuccess]       = useState('');

  // Editable fields
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [school,  setSchool]  = useState('');
  const [cls,     setCls]     = useState('');
  const [lang,    setLang]    = useState('english');
  const [board,   setBoard]   = useState('');
  const [goal,    setGoal]    = useState('');
  const [subject, setSubject] = useState('');
  const [exp,     setExp]     = useState('');
  const [childName,  setChildName]  = useState('');
  const [childClass, setChildClass] = useState('');
  const [parentGoal, setParentGoal] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Password change
  const [oldPw,     setOldPw]     = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError,   setPwError]   = useState('');

  useEffect(() => {
=======
  const st = useStudentProgress(user);
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
    try {
      bankLen = JSON.parse(localStorage.getItem('ss_teacher_questions') || '[]').length;
    } catch {
      bankLen = 0;
    }
    const next = {
      teacherStudentCount: students.length,
      teacherBankCount: bankLen,
      parentChildAcc: null,
      parentChildActs: 0,
    };
    if (user?.role === 'parent') {
      const l = findLinkedStudentForParent(user);
      const cp = l ? progressSnapshotForUserRecord(l) : null;
      const acc = cp ? accuracyPercent(cp) : null;
      next.parentChildAcc = acc;
      next.parentChildActs = (cp?.questionsSolved || 0) + (cp?.quizSessions || 0);
    }
    setExtraStats(next);
  }, [user]);

  useEffect(() => {
    refreshExtra();
  }, [refreshExtra]);

  useEffect(() => {
    window.addEventListener('focus', refreshExtra);
    window.addEventListener('storage', refreshExtra);
    return () => {
      window.removeEventListener('focus', refreshExtra);
      window.removeEventListener('storage', refreshExtra);
    };
  }, [refreshExtra]);

  const [isEditing, setIsEditing]       = useState(false);
  const [showPwForm, setShowPwForm]     = useState(false);
  const [pwSuccess, setPwSuccess]       = useState('');

  // Editable fields
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [school,  setSchool]  = useState('');
  const [cls,     setCls]     = useState('');
  const [lang,    setLang]    = useState('english');
  const [board,   setBoard]   = useState('');
  const [goal,    setGoal]    = useState('');
  const [subject, setSubject] = useState('');
  const [exp,     setExp]     = useState('');
  const [childName,  setChildName]  = useState('');
  const [childClass, setChildClass] = useState('');
  const [parentGoal, setParentGoal] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Password change
  const [oldPw,     setOldPw]     = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError,   setPwError]   = useState('');

  useEffect(() => {
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
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
      // Load profile picture from localStorage
      const pic = localStorage.getItem(`ss_profile_pic_${user.uid}`);
      if (pic) setProfilePic(pic);
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const role = user.role || 'student';
  const accentColor = role === 'teacher' ? 'indigo' : role === 'parent' ? 'amber' : 'brand';

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

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
    if (role === 'parent')  Object.assign(updated, { childName, childClass, goal: parentGoal });
    setManualUser(updated);

    // Also update the registered user DB
    try {
      const db = JSON.parse(localStorage.getItem('ss_registered_users') || '{}');
      if (user.email && db[user.email.toLowerCase()]) {
        db[user.email.toLowerCase()] = { ...db[user.email.toLowerCase()], ...updated };
        localStorage.setItem('ss_registered_users', JSON.stringify(db));
      }
    } catch {}

    setIsEditing(false);
  };

  const handleChangePassword = () => {
    setPwError(''); setPwSuccess('');
    if (!oldPw)             { setPwError('Enter your current password.'); return; }
    if (newPw.length < 4)   { setPwError('New password must be at least 4 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }

    try {
      const db = JSON.parse(localStorage.getItem('ss_registered_users') || '{}');
      const email = user.email?.toLowerCase();
      if (!email || !db[email]) { setPwError('Account not found.'); return; }
      if (db[email].password !== oldPw) { setPwError('Current password is incorrect.'); return; }
      db[email].password = newPw;
      localStorage.setItem('ss_registered_users', JSON.stringify(db));
      setPwSuccess('Password changed successfully!');
      setOldPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { setPwSuccess(''); setShowPwForm(false); }, 2000);
    } catch {
      setPwError('Something went wrong.');
    }
  };

<<<<<<< HEAD
  // Role-based stats
  const statsConfig = role === 'teacher' ? [
    { label: 'Students', value: 34, icon: Users, color: `text-indigo-500`, bg: 'bg-indigo-100' },
    { label: 'Quizzes', value: 12, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100' },
  ] : role === 'parent' ? [
    { label: 'Child Score', value: 85, icon: Star, color: 'text-amber-500', bg: 'bg-amber-100' },
    { label: 'Activities', value: 18, icon: BarChart3, color: 'text-orange-500', bg: 'bg-orange-100' },
  ] : [
    { label: 'Day Streak', value: 7, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100' },
    { label: 'Total XP', value: '1,240', icon: Star, color: 'text-purple-500', bg: 'bg-purple-100' },
  ];
=======
  const statsConfig =
    role === 'teacher'
      ? [
          { label: 'Students', value: extraStats.teacherStudentCount, icon: Users, color: `text-indigo-500`, bg: 'bg-indigo-100' },
          { label: 'Bank Qs', value: extraStats.teacherBankCount, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100' },
        ]
      : role === 'parent'
        ? [
            {
              label: 'Child quiz avg',
              value: extraStats.parentChildAcc != null ? `${extraStats.parentChildAcc}%` : '—',
              icon: Star,
              color: 'text-amber-500',
              bg: 'bg-amber-100',
            },
            {
              label: 'Child activity',
              value: extraStats.parentChildActs,
              icon: BarChart3,
              color: 'text-orange-500',
              bg: 'bg-orange-100',
            },
          ]
        : [
            { label: 'Day Streak', value: st.streak, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100' },
            {
              label: 'Total XP',
              value: st.xp.toLocaleString(),
              icon: Star,
              color: 'text-purple-500',
              bg: 'bg-purple-100',
            },
          ];
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e

  return (
    <AppShell title="My Profile">
      <div className="px-5 py-6 space-y-6 animate-fade-in">

        {/* ── User Info ──────────────────────────────────── */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <Avatar src={user.photo} name={name} size="xl" />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`absolute bottom-0 right-0 h-9 w-9 bg-${accentColor}-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform`}
            >
              <Camera size={16} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>

          <h2 className="font-display font-800 text-2xl text-slate-900">{name}</h2>
          <p className="text-slate-500 text-sm mt-1">{user.email || 'Manual Account'}</p>

          {/* Role badge */}
          <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-800 uppercase tracking-wider px-2.5 py-1 rounded-md ${
            role === 'teacher' ? 'bg-indigo-100 text-indigo-600' :
            role === 'parent' ? 'bg-amber-100 text-amber-600' :
            'bg-brand-100 text-brand-600'
          }`}>
            {role === 'teacher' ? <BookOpen size={12} /> : role === 'parent' ? <Users size={12} /> : <GraduationCap size={12} />}
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>

          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {role === 'student' && (
              <>
                <div className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-700 rounded-full">Class {cls || '?'}</div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-700 rounded-full capitalize">{LANGUAGES.find(l => l.value === lang)?.label || lang}</div>
                {board && <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-700 rounded-full">{board}</div>}
              </>
            )}
            {role === 'teacher' && (
              <>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-700 rounded-full">{subject || 'Teacher'}</div>
                <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-700 rounded-full">{exp || 'Experienced'}</div>
              </>
            )}
            {role === 'parent' && (
              <>
                <div className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-700 rounded-full">Child: {childName || 'N/A'}</div>
                <div className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-700 rounded-full">Class {childClass || '?'}</div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className={`mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-700 transition-all
              ${role === 'teacher' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' :
                role === 'parent' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>

        {/* ── Stats ──────────────────────────────────── */}
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

        {/* ── Achievements (Student only) ──────────────── */}
        {role === 'student' && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '150ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base px-1">Achievements</h3>
<<<<<<< HEAD
            <div className="card p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-2xl"><Award size={24} className="text-amber-500" /></div>
                  <div>
                    <h4 className="font-display font-800 text-slate-800">Early Bird</h4>
                    <p className="text-xs font-600 text-slate-500 mt-0.5">Complete 5 morning quizzes</p>
                  </div>
                </div>
                <span className="text-sm font-800 text-brand-500">3/5</span>
              </div>
              <div className="progress-track h-2.5">
                <div className="progress-fill bg-brand-500" style={{ width: '60%' }} />
              </div>
=======
            <div className="card p-4 space-y-3">
              {badgesFromProgress(st.progress).map((b) => (
                <div
                  key={b.title}
                  className={`flex items-start gap-3 py-2 border-b border-slate-50 last:border-0 ${b.earned ? '' : 'opacity-45'}`}
                >
                  <div className="bg-slate-100 p-2 rounded-xl shrink-0">
                    <Award size={20} className={b.earned ? 'text-amber-500' : 'text-slate-400'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-800 text-slate-800 text-sm">{b.title}</h4>
                    <p className="text-xs font-600 text-slate-500 mt-0.5">{b.desc}</p>
                  </div>
                  {b.earned && <CheckCircle2 size={18} className="text-brand-500 shrink-0 mt-0.5" />}
                </div>
              ))}
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
            </div>
          </div>
        )}

        {/* ══════════════ EDIT PROFILE FORM ══════════════ */}
        {isEditing && (
          <div className="card space-y-4 border-2 border-slate-200 animate-slide-in">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-800 text-slate-800">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-600 text-slate-500 mb-1.5">Full Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-600 text-slate-500 mb-1.5">Phone Number</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" type="tel" maxLength={10} />
            </div>

            {/* School */}
            <div>
              <label className="block text-xs font-600 text-slate-500 mb-1.5">School Name</label>
              <input className="input" value={school} onChange={e => setSchool(e.target.value)} placeholder="School name" />
            </div>

            {/* ── Student-specific edit ─── */}
            {role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">Class</label>
                  <div className="flex flex-wrap gap-2">
                    {CLASSES.map(c => (
                      <button key={c} onClick={() => setCls(c)}
                        className={`h-9 w-9 rounded-xl text-sm font-700 transition-all ${cls === c ? 'bg-brand-500 text-white shadow-glow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">Language</label>
                  <div className="flex gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l.value} onClick={() => setLang(l.value)}
                        className={`flex-1 py-2 rounded-xl text-sm font-600 transition-all ${lang === l.value ? 'bg-brand-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{l.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">Board</label>
                  <div className="flex flex-wrap gap-2">
                    {BOARDS.map(b => (
                      <button key={b} onClick={() => setBoard(b)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${board === b ? 'bg-brand-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{b}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">Learning Goal</label>
                  <div className="flex flex-wrap gap-2">
                    {STUDENT_GOALS.map(g => (
                      <button key={g} onClick={() => setGoal(g)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${goal === g ? 'bg-brand-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Teacher-specific edit ─── */}
            {role === 'teacher' && (
              <>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">Subject Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s => (
                      <button key={s} onClick={() => setSubject(s)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${subject === s ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">Years of Experience</label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE.map(ex => (
                      <button key={ex} onClick={() => setExp(ex)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${exp === ex ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{ex}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Parent-specific edit ─── */}
            {role === 'parent' && (
              <>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-1.5">Child's Name</label>
                  <input className="input" value={childName} onChange={e => setChildName(e.target.value)} placeholder="Child's name" />
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">Child's Class</label>
                  <div className="flex flex-wrap gap-2">
                    {CLASSES.map(c => (
                      <button key={c} onClick={() => setChildClass(c)}
                        className={`h-9 w-9 rounded-xl text-sm font-700 transition-all ${childClass === c ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-slate-500 mb-2">Your Goal</label>
                  <div className="flex flex-wrap gap-2">
                    {PARENT_GOALS.map(g => (
                      <button key={g} onClick={() => setParentGoal(g)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-600 transition-all ${parentGoal === g ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button variant="primary" className="w-full mt-2" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </div>
        )}

        {/* ══════════════ ACCOUNT SETTINGS ══════════════ */}
        <div className="space-y-3">
          <h3 className="font-display font-800 text-slate-700 text-base px-1">Account</h3>
          <div className="card p-0 overflow-hidden">
            {/* Change Password */}
            <button
              onClick={() => { setShowPwForm(!showPwForm); setPwError(''); setPwSuccess(''); }}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50"
            >
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Lock size={18} /></div>
                Change Password
              </div>
              <ChevronRight size={18} className={`text-slate-400 transition-transform ${showPwForm ? 'rotate-90' : ''}`} />
            </button>

            {showPwForm && (
              <div className="px-4 pb-4 space-y-3 animate-slide-in">
                <div className="relative">
                  <input className="input pr-10" type={showOldPw ? 'text' : 'password'} placeholder="Current password" value={oldPw} onChange={e => setOldPw(e.target.value)} />
                  <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showOldPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                <div className="relative">
                  <input className="input pr-10" type={showNewPw ? 'text' : 'password'} placeholder="New password (min 4 chars)" value={newPw} onChange={e => setNewPw(e.target.value)} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                <input className="input" type="password" placeholder="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                {pwError && <p className="text-rose-500 text-xs">{pwError}</p>}
                {pwSuccess && <p className="text-brand-600 text-xs flex items-center gap-1"><CheckCircle2 size={14} />{pwSuccess}</p>}
                <Button variant="primary" className="w-full text-sm" onClick={handleChangePassword}>Update Password</Button>
              </div>
            )}

            {/* Notifications */}
            <Link href="/settings/notifications" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Bell size={18} /></div>
                Notifications
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            {/* Preferences */}
            <Link href="/settings/preferences" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Settings size={18} /></div>
                App Preferences
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            {/* Privacy */}
            <Link href="/settings/privacy" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Shield size={18} /></div>
                Privacy & Security
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ── Logout ──────────────────────────────────── */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-700 text-sm text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut size={18} />
            Log Out Account
          </button>

          <p className="mt-6 text-center text-xs text-slate-400 font-500 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <img
              src="https://user5301.na.imgto.link/public/20260321/az0pmpqr3wttpr2cmzwy7w-az0pmpqrar-qd1us4ehj7a-1.avif"
              alt="Logo"
              className="h-8 w-auto mx-auto mb-2 opacity-60 grayscale hover:grayscale-0 transition-all duration-300"
            />
            <span className="inline-block px-3 py-1 bg-slate-100 rounded text-[10px] tracking-wider uppercase">
              ShikshaSetu v1.1
            </span>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
