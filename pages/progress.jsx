// pages/progress.jsx — stats from local activity (+ Postgres when API + UUID available)
import { useEffect } from 'react';
import { useRouter } from 'next/router';
<<<<<<< HEAD
import { Award, Flame, BookOpen, Target, TrendingUp, Calculator, FlaskConical, Globe, Star, Trophy, Rocket, CheckCircle2 } from 'lucide-react';
=======
import { Flame, BookOpen, Target, TrendingUp, Calculator, FlaskConical, Globe, Star, Trophy, Rocket, CheckCircle2 } from 'lucide-react';
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
import { useAuth } from '../hooks/useAuth';
import { useStudentProgress } from '../hooks/useStudentProgress';
import AppShell from '../components/layout/AppShell';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import {
  weekChartData,
  subjectRowsFromProgress,
  badgesFromProgress,
  accuracyPercent,
  activeDaysThisWeek,
} from '../services/userProgress';

const SUBJECT_META = {
  Mathematics: { icon: Calculator, color: 'blue', iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  Science: { icon: FlaskConical, color: 'green', iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
  English: { icon: BookOpen, color: 'indigo', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
  'Social Science': { icon: Globe, color: 'amber', iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  General: { icon: BookOpen, color: 'slate', iconColor: 'text-slate-500', iconBg: 'bg-slate-100' },
};

<<<<<<< HEAD
const SUBJECTS = [
  { name: 'Mathematics',    icon: Calculator,   questions: 18, pct: 43, color: 'blue',   iconColor: 'text-blue-500',   iconBg: 'bg-blue-50' },
  { name: 'Science',        icon: FlaskConical,  questions: 12, pct: 29, color: 'green',  iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
  { name: 'English',        icon: BookOpen,      questions:  8, pct: 19, color: 'indigo', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
  { name: 'Social Science', icon: Globe,         questions:  4, pct:  9, color: 'amber',  iconColor: 'text-amber-500',  iconBg: 'bg-amber-50' },
];

const BADGES = [
  { icon: Star,   title: 'First Answer',    desc: 'Solved your first question',     earned: true,  iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  { icon: Flame,  title: '7-Day Streak',    desc: 'Studied 7 days in a row',         earned: true,  iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
  { icon: Trophy, title: 'Math Champion',   desc: 'Solved 10 math problems',         earned: true,  iconColor: 'text-purple-500', iconBg: 'bg-purple-50' },
  { icon: Rocket, title: 'Speed Learner',   desc: 'Answered 5 questions in one day', earned: false, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  { icon: Target, title: 'Perfect Score',   desc: 'Got all steps correct',           earned: false, iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
];

const WEEKLY = [
  { day: 'M', done: true  },
  { day: 'T', done: true  },
  { day: 'W', done: true  },
  { day: 'T', done: true  },
  { day: 'F', done: true  },
  { day: 'S', done: true  },
  { day: 'S', done: false },
=======
const BADGE_ICONS = [
  { icon: Star, iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  { icon: Flame, iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
  { icon: Trophy, iconColor: 'text-purple-500', iconBg: 'bg-purple-50' },
  { icon: Rocket, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  { icon: Target, iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
  { icon: Star, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
];

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const st = useStudentProgress(user);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const role = user.role || 'student';
  const pageTitle = role === 'teacher' ? 'Class Overview' : role === 'parent' ? "Child's Progress" : 'My Progress';
<<<<<<< HEAD
=======
  const p = st.progress;
  const acc = accuracyPercent(p);
  const weeklyGoalDays = 7;
  const weeklyDone = activeDaysThisWeek(p);
  const weekBars = weekChartData(p);
  const subjectRows = subjectRowsFromProgress(p);
  const badgeList = badgesFromProgress(p).map((b, i) => ({ ...b, ...BADGE_ICONS[i] }));

  const statCards = [
    {
      icon: BookOpen,
      label: 'Questions',
      value: p.questionsSolved,
      unit: 'solved',
      color: 'text-brand-500',
      bg: 'bg-brand-50',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: p.streak,
      unit: 'days',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: Target,
      label: 'Accuracy',
      value: acc == null ? '—' : `${acc}%`,
      unit: acc == null ? 'no quizzes yet' : 'quiz avg',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      icon: TrendingUp,
      label: 'This Week',
      value: weeklyDone,
      unit: `/ ${weeklyGoalDays} active days`,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
  ];
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e

  return (
    <AppShell title={pageTitle}>
      <div className="px-5 pt-5 space-y-5 pb-4">

        <div className="grid grid-cols-2 gap-3 animate-fade-up">
          {statCards.map(({ icon: Icon, label, value, unit, color, bg }) => (
            <div key={label} className="card animate-fade-up">
              <div className={`inline-flex h-10 w-10 rounded-xl ${bg} items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-900 text-2xl ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{unit}</p>
              <p className="text-slate-400 text-[11px] mt-0.5 uppercase tracking-wide font-600">{label}</p>
            </div>
          ))}
        </div>

        <div className="card animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="font-display font-800 text-slate-700 text-base mb-4">Activity Chart</p>
          <div className="flex items-end justify-between h-32 mb-4 pt-4 border-b border-slate-100 pb-2">
<<<<<<< HEAD
            {WEEKLY.map(({ day, done }, i) => {
              const height = done ? Math.floor(Math.random() * 40 + 40) : 15;
              return (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                <div 
                  className={`w-6 sm:w-8 rounded-t-xl transition-all relative group ${done ? 'bg-brand-500 hover:bg-brand-400 cursor-pointer shadow-glow tracking-trend' : 'bg-slate-100'}`} 
                  style={{ height: `${height}%` }}
                >
                    {done && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-700 py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">XP</div>}
=======
            {weekBars.map(({ day, count, heightPct, done }, i) => (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                <div
                  className={`w-6 sm:w-8 rounded-t-xl transition-all relative group ${
                    done ? 'bg-brand-500 hover:bg-brand-400 cursor-pointer shadow-glow' : 'bg-slate-100'
                  }`}
                  style={{ height: `${heightPct}%`, minHeight: done ? 8 : 4 }}
                >
                  {done && count > 0 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-700 py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      {count} actions
                    </div>
                  )}
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
                </div>
                <span className={`text-[10px] font-800 ${done ? 'text-brand-500' : 'text-slate-400'}`}>{day}</span>
              </div>
            )})}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-600 text-slate-500">Weekly goal</span>
<<<<<<< HEAD
              <span className="font-800 text-brand-600">{MOCK_STATS.weeklyDone} / {MOCK_STATS.weeklyGoal} days</span>
=======
              <span className="font-800 text-brand-600">
                {weeklyDone} / {weeklyGoalDays} days active
              </span>
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
            </div>
            <ProgressBar value={weeklyDone} max={weeklyGoalDays} color="green" />
          </div>
        </div>

<<<<<<< HEAD
        {/* ── Subjects ─────────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
          <div className="flex items-center justify-between mb-3 px-1">
             <p className="font-display font-800 text-slate-700 text-base">Course Progress</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map(({ name, icon: Icon, questions, pct, color, iconColor, iconBg }) => (
              <div key={name} className="card p-4 hover:-translate-y-1 transition-all cursor-pointer border-b-4 border-slate-100 pb-3 active:border-b-0 active:translate-y-0">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${iconBg} mb-3 shadow-inner`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h4 className="font-display font-900 text-slate-800 text-xs sm:text-sm leading-tight">{name}</h4>
                <p className="text-[10px] font-800 text-slate-400 mt-1 mb-3 uppercase tracking-wider">{pct}% Mastery</p>
                <ProgressBar value={pct} max={100} color={color} />
              </div>
            ))}
=======
        <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="font-display font-800 text-slate-700 text-base">Course Progress</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {subjectRows.map(({ name, questions, pct }) => {
              const meta = SUBJECT_META[name] || SUBJECT_META.General;
              const Icon = meta.icon;
              return (
                <div
                  key={name}
                  className="card p-4 hover:-translate-y-1 transition-all cursor-pointer border-b-4 border-slate-100 pb-3 active:border-b-0 active:translate-y-0"
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${meta.iconBg} mb-3 shadow-inner`}>
                    <Icon size={22} className={meta.iconColor} />
                  </div>
                  <h4 className="font-display font-900 text-slate-800 text-xs sm:text-sm leading-tight">{name}</h4>
                  <p className="text-[10px] font-800 text-slate-400 mt-1 mb-3 uppercase tracking-wider">
                    {questions} questions · {pct}% share
                  </p>
                  <ProgressBar value={pct} max={100} color={meta.color} />
                </div>
              );
            })}
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-800 text-slate-700 text-base">Badges</p>
            <Badge color="green">{badgeList.filter((b) => b.earned).length} earned</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3">
<<<<<<< HEAD
            {BADGES.map(({ icon: Icon, title, desc, earned, iconColor, iconBg }) => (
              <div key={title} className={`card flex items-center gap-4 py-4 ${!earned ? 'opacity-50' : ''}`}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  earned ? iconBg + ' shadow-card' : 'bg-slate-100'
                }`}>
=======
            {badgeList.map(({ icon: Icon, title, desc, earned, iconColor, iconBg }) => (
              <div key={title} className={`card flex items-center gap-4 py-4 ${!earned ? 'opacity-50' : ''}`}>
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    earned ? `${iconBg} shadow-card` : 'bg-slate-100'
                  }`}
                >
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
                  <Icon size={22} className={earned ? iconColor : 'text-slate-400'} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-800 text-slate-800 text-sm">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
                {earned && (
                  <div className="h-6 w-6 bg-brand-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-3xl p-5 text-center animate-fade-up"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', animationDelay: '260ms' }}
        >
          <div className="mx-auto w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3">
            <TrendingUp size={24} className="text-white" />
          </div>
          <p className="font-display font-900 text-white text-lg">Keep it up{role === 'parent' ? '!' : `, ${user.name?.split(' ')[0]}!`}</p>
<<<<<<< HEAD
          <p className="text-slate-400 text-sm mt-1">{role === 'parent' ? 'Your child is making great progress.' : role === 'teacher' ? 'Your students are learning well.' : 'Every question makes you smarter.'}</p>
=======
          <p className="text-slate-400 text-sm mt-1">
            {role === 'parent'
              ? 'Your child is making great progress.'
              : role === 'teacher'
                ? 'Your students are learning well.'
                : 'Every question makes you smarter.'}
          </p>
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
        </div>
      </div>
    </AppShell>
  );
}
