// pages/teacher/index.jsx — Teacher dashboard
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  GraduationCap, Users, BarChart3, BookOpen,
  Plus, ChevronRight, TrendingUp, Flame,
  Brain, Award, AlertCircle,
} from 'lucide-react';
import { useRequireRole } from '../../hooks/useRequireRole';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import {
  getTeacherStudentSummaries,
  teacherOverviewStats,
  topStudentsByXp,
} from '../../services/rosterProgress';

export default function TeacherHomePage() {
  const { user, loading } = useRequireRole('teacher');
  const router = useRouter();

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  void tick;
  const summaries = getTeacherStudentSummaries();
  const overview = teacherOverviewStats(summaries);
  const topFive = topStudentsByXp(summaries, 5);

  let bankLen = 0;
  try { bankLen = JSON.parse(localStorage.getItem('ss_teacher_questions') || '[]').length; } catch { }

  const hasStudents = summaries.length > 0;
  const firstName = user.name?.split(' ')[0] ?? 'Teacher';

  // At-risk: no streak + has done at least one quiz
  const atRisk = summaries.filter(s => (s.streak ?? 0) === 0 && (s.quizzes ?? 0) > 0);

  const QUICK_ACTIONS = [
    {
      label: 'My Students',
      sub: 'View roster & progress',
      icon: Users,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      href: '/teacher/students',
      badge: summaries.length || null,
    },
    {
      label: 'Analytics',
      sub: 'Class performance charts',
      icon: BarChart3,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      href: '/teacher/analytics',
    },
    {
      label: 'Question Bank',
      sub: 'Manage your questions',
      icon: BookOpen,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      href: '/teacher/content',
      badge: bankLen || null,
    },
    {
      label: 'Create Question',
      sub: 'Add to your question bank',
      icon: Plus,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      href: '/teacher/create-quiz',
    },
  ];

  return (
    <AppShell title="Teacher Dashboard">
      <div className="px-5 pt-6 pb-24 space-y-5">

        {/* ── Greeting ────────────────────────────────── */}
        <div className="animate-fade-up">
          <h1 className="font-display font-900 text-2xl text-slate-800 leading-tight">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {hasStudents
              ? `You have ${summaries.length} student${summaries.length !== 1 ? 's' : ''} on this device.`
              : 'Your class dashboard will fill up once students register.'}
          </p>
        </div>

        {/* ── No students hint ─────────────────────────── */}
        {!hasStudents && (
          <div
            className="card border border-indigo-100 bg-indigo-50/60 flex items-start gap-3 animate-fade-up"
            style={{ animationDelay: '30ms' }}
          >
            <AlertCircle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-700 text-indigo-900">No students yet</p>
              <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
                Students need to <strong>register with the Student role</strong> in this same browser.
                Their activity will appear here automatically.
              </p>
            </div>
          </div>
        )}

        {/* ── Overview hero ────────────────────────────── */}
        <div
          className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white animate-fade-up"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-200 text-xs font-600 uppercase tracking-wide mb-1">
                Class overview
              </p>
              <p className="font-display font-900 text-2xl leading-tight">
                {summaries.length} Student{summaries.length !== 1 ? 's' : ''}
              </p>
              <p className="text-indigo-200 text-xs mt-1">
                {overview.active} active this week ·{' '}
                {overview.avgScorePct != null ? `${overview.avgScorePct}% avg` : 'no quizzes yet'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
          </div>

          {hasStudents && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { label: 'Questions', value: summaries.reduce((t, s) => t + (s.questionsSolved ?? 0), 0) },
                { label: 'Quizzes', value: summaries.reduce((t, s) => t + (s.quizzes ?? 0), 0) },
                { label: 'Bank Qs', value: bankLen },
                { label: 'At risk', value: atRisk.length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/15 rounded-xl p-2 text-center">
                  <p className="font-display font-900 text-base leading-none">{value}</p>
                  <p className="text-indigo-200 text-[9px] font-600 mt-1 uppercase tracking-wide leading-none">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick action grid ────────────────────────── */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <p className="text-xs font-800 text-slate-400 uppercase tracking-widest px-1 mb-2">
            Quick access
          </p>
          <div className="card p-0 overflow-hidden">
            {QUICK_ACTIONS.map(({ label, sub, icon: Icon, iconBg, iconColor, href, badge }, i) => (
              <button
                key={label}
                type="button"
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-left ${i < QUICK_ACTIONS.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
              >
                <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-700 text-sm text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
                {badge ? (
                  <span className="bg-indigo-100 text-indigo-600 text-xs font-800 px-2 py-0.5 rounded-full shrink-0">
                    {badge}
                  </span>
                ) : null}
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Top performers ───────────────────────────── */}
        {topFive.length > 0 && (
          <div
            className="animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-800 text-slate-400 uppercase tracking-widest">Top performers</p>
              <button
                type="button"
                onClick={() => router.push('/teacher/analytics')}
                className="text-xs font-700 text-indigo-500 hover:underline"
              >
                Full analytics →
              </button>
            </div>
            <div className="card p-0 overflow-hidden">
              {topFive.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => router.push(`/teacher/student/${encodeURIComponent(s.id)}`)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors ${i < topFive.length - 1 ? 'border-b border-slate-50' : ''
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-800 shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-600' :
                      i === 1 ? 'bg-slate-200 text-slate-600' :
                        i === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-indigo-50 text-indigo-500'
                    }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-700 text-slate-800 truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Class {s.cls}
                      {s.scorePct != null && ` · ${s.scorePct}% avg`}
                    </p>
                  </div>
                  <span className="text-sm font-800 text-indigo-600 shrink-0">{s.xp} XP</span>
                  <ChevronRight size={14} className="text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── At-risk students ─────────────────────────── */}
        {atRisk.length > 0 && (
          <div
            className="animate-fade-up"
            style={{ animationDelay: '150ms' }}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-800 text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flame size={11} /> Needs attention
              </p>
            </div>
            <div className="card p-0 overflow-hidden border border-rose-100">
              {atRisk.slice(0, 4).map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => router.push(`/teacher/student/${encodeURIComponent(s.id)}`)}
                  className={`w-full flex items-center gap-3 p-4 bg-rose-50/40 hover:bg-rose-50 transition-colors ${i < Math.min(atRisk.length, 4) - 1 ? 'border-b border-rose-50' : ''
                    }`}
                >
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-600 font-800 text-sm">{s.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-700 text-slate-800 truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {s.scorePct != null && s.scorePct < 50
                        ? `Low quiz avg: ${s.scorePct}%`
                        : 'No activity streak'}
                    </p>
                  </div>
                  <Award size={14} className="text-rose-300 shrink-0" />
                </button>
              ))}
              {atRisk.length > 4 && (
                <button
                  type="button"
                  onClick={() => router.push('/teacher/students')}
                  className="w-full p-3 text-xs font-700 text-rose-400 hover:bg-rose-50 transition-colors text-center"
                >
                  +{atRisk.length - 4} more → View all students
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Activity this week sparkline ─────────────── */}
        {hasStudents && (() => {
          const heatByDay = Array(7).fill(0);
          summaries.forEach(st => {
            (st.weekBars ?? []).forEach((b, i) => { if (b?.done) heatByDay[i]++; });
          });
          const maxH = Math.max(1, ...heatByDay);
          const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
          const anyActivity = heatByDay.some(v => v > 0);
          if (!anyActivity) return null;
          return (
            <div
              className="card animate-fade-up"
              style={{ animationDelay: '180ms' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-700 text-sm text-slate-700 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-indigo-400" /> Class activity this week
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/teacher/analytics')}
                  className="text-xs font-700 text-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  Details →
                </button>
              </div>
              <div className="flex items-end justify-between gap-2 h-14">
                {heatByDay.map((count, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${count > 0 ? Math.max(10, (count / maxH) * 100) : 4}%`,
                        minHeight: count > 0 ? 5 : 2,
                        background: count > 0 ? '#818cf8' : '#f1f5f9',
                        opacity: count > 0 ? 1 : 0.6,
                      }}
                    />
                    <span className="text-[9px] font-700 text-slate-400">{labels[i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {heatByDay.filter(v => v > 0).length} day{heatByDay.filter(v => v > 0).length !== 1 ? 's' : ''} with activity · bar height = student count
              </p>
            </div>
          );
        })()}

      </div>
    </AppShell>
  );
}
