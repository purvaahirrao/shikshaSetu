// pages/parent/reports.jsx — Parent's child performance reports
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { ArrowLeft, TrendingUp, TrendingDown, BookOpen, Brain, Flame, Target, Calendar, CheckCircle2 } from 'lucide-react';

const WEEKLY_ACTIVITY = [
  { day: 'Mon', questions: 8, quizzes: 1 },
  { day: 'Tue', questions: 12, quizzes: 2 },
  { day: 'Wed', questions: 5, quizzes: 0 },
  { day: 'Thu', questions: 15, quizzes: 2 },
  { day: 'Fri', questions: 10, quizzes: 1 },
  { day: 'Sat', questions: 3, quizzes: 0 },
  { day: 'Sun', questions: 7, quizzes: 1 },
];

const QUIZ_SCORES = [
  { date: 'Today',     subject: 'Math',    score: 4, total: 5 },
  { date: 'Yesterday', subject: 'Science', score: 3, total: 5 },
  { date: '2 days ago', subject: 'English', score: 5, total: 5 },
  { date: '3 days ago', subject: 'Math',    score: 3, total: 5 },
  { date: '4 days ago', subject: 'Science', score: 4, total: 5 },
];

const SUBJECT_DATA = [
  { name: 'Mathematics', score: 82, trend: 'up',   weak: ['Fractions', 'Geometry'] },
  { name: 'Science',     score: 71, trend: 'down', weak: ['Magnetism', 'Chemical Reactions'] },
  { name: 'English',     score: 89, trend: 'up',   weak: [] },
];

export default function ParentReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const totalQuestions = WEEKLY_ACTIVITY.reduce((s, d) => s + d.questions, 0);
  const totalQuizzes = WEEKLY_ACTIVITY.reduce((s, d) => s + d.quizzes, 0);
  const overallScore = Math.round(SUBJECT_DATA.reduce((s, d) => s + d.score, 0) / SUBJECT_DATA.length);
  const maxDaily = Math.max(...WEEKLY_ACTIVITY.map(d => d.questions));

  return (
    <AppShell
      title="Reports"
      left={<button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><ArrowLeft size={20} /></button>}
    >
      <div className="px-5 pt-5 pb-4 space-y-5">
        {/* Child Summary */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 animate-fade-up">
          <p className="text-amber-100 text-sm font-600">Performance Report</p>
          <p className="text-white font-display font-900 text-xl mt-1">{user.childName || 'Your Child'}</p>
          <p className="text-amber-100 text-xs mt-1">Class {user.childClass || '?'} • This Week</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          {[
            { label: 'Accuracy', value: `${overallScore}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Solved', value: totalQuestions, icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
            { label: 'Quizzes', value: totalQuizzes, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card text-center py-4">
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" /> Daily Activity
          </h3>
          <div className="card">
            <div className="flex items-end justify-between gap-2 h-28 mb-3">
              {WEEKLY_ACTIVITY.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end h-20">
                    <div
                      className="w-full bg-amber-400 rounded-t-lg transition-all"
                      style={{ height: `${(d.questions / maxDaily) * 100}%`, minHeight: d.questions > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-[10px] font-700 text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-sm" /> Questions solved</span>
            </div>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Subject Breakdown</h3>
          <div className="space-y-3">
            {SUBJECT_DATA.map(s => (
              <div key={s.name} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-700 text-slate-800">{s.name}</p>
                    {s.trend === 'up' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                  </div>
                  <span className={`text-sm font-800 ${s.score >= 80 ? 'text-emerald-500' : s.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{s.score}%</span>
                </div>
                <div className="progress-track h-2 mb-2">
                  <div className={`progress-fill ${s.score >= 80 ? 'bg-emerald-500' : s.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.score}%` }} />
                </div>
                {s.weak.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.weak.map(w => (
                      <span key={w} className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-500 font-700 rounded-md">Weak: {w}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Scores */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Recent Quiz Scores</h3>
          <div className="card p-0 overflow-hidden">
            {QUIZ_SCORES.map((q, i) => (
              <div key={i} className={`flex items-center justify-between p-4 ${i < QUIZ_SCORES.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div>
                  <p className="text-sm font-700 text-slate-800">{q.subject}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{q.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-800 ${q.score/q.total >= 0.8 ? 'text-emerald-500' : q.score/q.total >= 0.6 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {q.score}/{q.total}
                  </span>
                  {q.score === q.total && <CheckCircle2 size={14} className="text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
