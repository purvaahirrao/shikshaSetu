<<<<<<< HEAD
// pages/parent/reports.jsx — Parent's child performance reports
import { useEffect } from 'react';
=======
// pages/parent/reports.jsx — Child stats when a matching student account exists on this device
import { useEffect, useState, useCallback } from 'react';
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
<<<<<<< HEAD
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
=======
import { ArrowLeft, TrendingUp, TrendingDown, BookOpen, Brain, Target, Calendar, CheckCircle2 } from 'lucide-react';
import {
  findLinkedStudentForParent,
  progressSnapshotForUserRecord,
} from '../../services/rosterProgress';
import { accuracyPercent, subjectRowsFromProgress, weekChartData } from '../../services/userProgress';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e

export default function ParentReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
<<<<<<< HEAD
=======
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

<<<<<<< HEAD
  const totalQuestions = WEEKLY_ACTIVITY.reduce((s, d) => s + d.questions, 0);
  const totalQuizzes = WEEKLY_ACTIVITY.reduce((s, d) => s + d.quizzes, 0);
  const overallScore = Math.round(SUBJECT_DATA.reduce((s, d) => s + d.score, 0) / SUBJECT_DATA.length);
  const maxDaily = Math.max(...WEEKLY_ACTIVITY.map(d => d.questions));
=======
  void tick;
  const linked = findLinkedStudentForParent(user);
  const p = linked ? progressSnapshotForUserRecord(linked) : null;
  const acc = p ? accuracyPercent(p) : null;
  const subjectRows = p ? subjectRowsFromProgress(p).filter((r) => r.name !== 'General') : [];
  const weekBars = p ? weekChartData(p) : WEEK_LABELS.map((day) => ({ day, count: 0, heightPct: 12, done: false }));
  const maxBar = Math.max(1, ...weekBars.map((b) => b.count));

  const totalQuestions = p?.questionsSolved ?? 0;
  const totalQuizzes = p?.quizSessions ?? 0;
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e

  return (
    <AppShell
      title="Reports"
<<<<<<< HEAD
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
=======
      left={
        <button type="button" onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={20} />
        </button>
      }
    >
      <div className="px-5 pt-5 pb-4 space-y-5">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 animate-fade-up">
          <p className="text-amber-100 text-sm font-600">Performance Report</p>
          <p className="text-white font-display font-900 text-xl mt-1">{user.childName || 'Your Child'}</p>
          <p className="text-amber-100 text-xs mt-1">Class {user.childClass || '?'} • This device</p>
        </div>

        {!linked && (
          <div className="card border border-amber-100 bg-amber-50/80 text-amber-900 text-sm leading-relaxed">
            To see live numbers, your child needs a <strong>student account</strong> registered on this device with the
            same name and class as in your profile. Until then, totals stay at zero.
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          {[
            {
              label: 'Accuracy',
              value: acc != null ? `${acc}%` : '—',
              icon: Target,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            { label: 'Solved', value: linked ? totalQuestions : 0, icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
            { label: 'Quizzes', value: linked ? totalQuizzes : 0, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
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

<<<<<<< HEAD
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
=======
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" /> This week (activity)
          </h3>
          <div className="card">
            <div className="flex items-end justify-between gap-2 h-28 mb-3">
              {weekBars.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end h-20">
                    <div
                      className="w-full bg-amber-400 rounded-t-lg transition-all"
                      style={{
                        height: `${b.done ? Math.max(8, (b.count / maxBar) * 100) : 4}%`,
                        minHeight: b.count > 0 ? 6 : 2,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-700 text-slate-400">{b.day}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">Bar height = actions that day (same week as student app).</p>
          </div>
        </div>

        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Subject breakdown</h3>
          {!linked || subjectRows.length === 0 ? (
            <p className="text-sm text-slate-400">No subject activity recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {subjectRows.map((s) => {
                const trendUp = s.pct >= 25;
                return (
                  <div key={s.name} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-700 text-slate-800">{s.name}</p>
                        {trendUp ? (
                          <TrendingUp size={14} className="text-emerald-500" />
                        ) : (
                          <TrendingDown size={14} className="text-rose-400" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-800 ${
                          s.questions >= 5 ? 'text-emerald-500' : s.questions >= 1 ? 'text-amber-500' : 'text-slate-400'
                        }`}
                      >
                        {s.questions} questions
                      </span>
                    </div>
                    <div className="progress-track h-2 mb-2">
                      <div
                        className={`progress-fill ${s.pct >= 25 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, s.pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Recent activity</h3>
          <div className="card p-0 overflow-hidden">
            {!linked || !(p?.recentActivity || []).length ? (
              <p className="p-4 text-sm text-slate-400">No recent questions yet from the linked student account.</p>
            ) : (
              (p.recentActivity || []).slice(0, 6).map((r, i) => (
                <div
                  key={`${r.time}-${i}`}
                  className={`flex items-center justify-between gap-2 p-4 ${i < 5 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-700 text-slate-800">{r.subject}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{r.q}</p>
                  </div>
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                </div>
              ))
            )}
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
          </div>
        </div>
      </div>
    </AppShell>
  );
}
