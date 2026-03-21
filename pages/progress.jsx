// pages/progress.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Award, Flame, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/layout/AppShell';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

// Mock data — wire to real DB/API later
const MOCK_STATS = {
  totalQuestions: 42,
  streak:         7,
  accuracy:       91,
  weeklyGoal:     10,
  weeklyDone:     7,
};

const SUBJECTS = [
  { name: 'Mathematics',    icon: '🔢', questions: 18, pct: 43, color: 'blue'   },
  { name: 'Science',        icon: '🔬', questions: 12, pct: 29, color: 'green'  },
  { name: 'English',        icon: '📖', questions:  8, pct: 19, color: 'indigo' },
  { name: 'Social Science', icon: '🌍', questions:  4, pct:  9, color: 'amber'  },
];

const BADGES = [
  { icon: '🌟', title: 'First Answer',    desc: 'Solved your first question',     earned: true  },
  { icon: '🔥', title: '7-Day Streak',    desc: 'Studied 7 days in a row',         earned: true  },
  { icon: '🏆', title: 'Math Champion',   desc: 'Solved 10 math problems',         earned: true  },
  { icon: '🚀', title: 'Speed Learner',   desc: 'Answered 5 questions in one day', earned: false },
  { icon: '🎯', title: 'Perfect Score',   desc: 'Got all steps correct',           earned: false },
];

const WEEKLY = [
  { day: 'M', done: true  },
  { day: 'T', done: true  },
  { day: 'W', done: true  },
  { day: 'T', done: true  },
  { day: 'F', done: true  },
  { day: 'S', done: true  },
  { day: 'S', done: false },
];

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <AppShell title="My Progress">
      <div className="px-5 pt-5 space-y-5 pb-4">

        {/* ── Top stat cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up">
          {[
            { icon: BookOpen, label: 'Questions', value: MOCK_STATS.totalQuestions, unit: 'solved',   color: 'text-brand-500',  bg: 'bg-brand-50'   },
            { icon: Flame,    label: 'Streak',    value: MOCK_STATS.streak,          unit: 'days',    color: 'text-amber-500',  bg: 'bg-amber-50'   },
            { icon: Target,   label: 'Accuracy',  value: `${MOCK_STATS.accuracy}%`,  unit: 'avg',     color: 'text-indigo-500', bg: 'bg-indigo-50'  },
            { icon: TrendingUp, label: 'This Week', value: MOCK_STATS.weeklyDone,    unit: '/ 10 goal', color: 'text-rose-500', bg: 'bg-rose-50'    },
          ].map(({ icon: Icon, label, value, unit, color, bg }) => (
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

        {/* ── Weekly calendar ─────────────────────────────── */}
        <div className="card animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="font-display font-800 text-slate-700 text-base mb-4">This Week</p>
          <div className="flex items-center justify-between">
            {WEEKLY.map(({ day, done }, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                  done
                    ? 'bg-brand-500 shadow-glow'
                    : i === 6
                    ? 'border-2 border-dashed border-slate-200'
                    : 'bg-slate-100'
                }`}>
                  {done ? (
                    <span className="text-white text-sm font-800">✓</span>
                  ) : (
                    <span className="text-slate-400 text-sm font-700">·</span>
                  )}
                </div>
                <span className={`text-[10px] font-700 ${done ? 'text-brand-500' : 'text-slate-400'}`}>{day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-600 text-slate-500">Weekly goal</span>
              <span className="font-700 text-brand-600">{MOCK_STATS.weeklyDone} / {MOCK_STATS.weeklyGoal}</span>
            </div>
            <ProgressBar value={MOCK_STATS.weeklyDone} max={MOCK_STATS.weeklyGoal} color="green" />
          </div>
        </div>

        {/* ── Subjects ─────────────────────────────────────── */}
        <div className="card animate-fade-up" style={{ animationDelay: '140ms' }}>
          <p className="font-display font-800 text-slate-700 text-base mb-4">By Subject</p>
          <div className="space-y-4">
            {SUBJECTS.map(({ name, icon, questions, pct, color }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="text-sm font-600 text-slate-700">{name}</span>
                  </div>
                  <span className="text-xs font-700 text-slate-500">{questions} Qs</span>
                </div>
                <ProgressBar value={pct} max={100} color={color} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Badges ───────────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-800 text-slate-700 text-base">Badges</p>
            <Badge color="green">{BADGES.filter(b => b.earned).length} earned</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {BADGES.map(({ icon, title, desc, earned }) => (
              <div key={title} className={`card flex items-center gap-4 py-4 ${!earned ? 'opacity-50' : ''}`}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  earned ? 'bg-amber-50 shadow-card' : 'bg-slate-100'
                }`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <p className="font-display font-800 text-slate-800 text-sm">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
                {earned && (
                  <div className="h-6 w-6 bg-brand-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-800">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Motivational footer ──────────────────────────── */}
        <div
          className="rounded-3xl p-5 text-center animate-fade-up"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', animationDelay: '260ms' }}
        >
          <p className="text-3xl mb-3">🌟</p>
          <p className="font-display font-900 text-white text-lg">Keep it up, {user.name?.split(' ')[0]}!</p>
          <p className="text-slate-400 text-sm mt-1">Every question makes you smarter.</p>
        </div>

      </div>
    </AppShell>
  );
}
