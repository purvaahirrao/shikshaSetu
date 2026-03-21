<<<<<<< HEAD
// pages/teacher/analytics.jsx — Teacher's class analytics dashboard
import { useEffect } from 'react';
=======
// pages/teacher/analytics.jsx — Aggregates from registered students on this device
import { useEffect, useState, useCallback } from 'react';
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
<<<<<<< HEAD
import { ArrowLeft, TrendingUp, Users, BarChart3, Award, Target, BookOpen } from 'lucide-react';

const CLASS_DATA = [
  { cls: '6', students: 8, avg: 84, active: 7 },
  { cls: '7', students: 6, avg: 78, active: 4 },
  { cls: '8', students: 10, avg: 88, active: 9 },
  { cls: '9', students: 7, avg: 82, active: 5 },
  { cls: '10', students: 5, avg: 71, active: 3 },
];

const TOP_STUDENTS = [
  { rank: 1, name: 'Sneha Verma',  cls: '8', score: 95 },
  { rank: 2, name: 'Aarav Sharma', cls: '8', score: 92 },
  { rank: 3, name: 'Ananya Reddy', cls: '9', score: 90 },
  { rank: 4, name: 'Diya Mehta',   cls: '6', score: 88 },
  { rank: 5, name: 'Priya Patel',  cls: '7', score: 85 },
];

const SUBJECT_PERFORMANCE = [
  { subject: 'Mathematics', avg: 81, color: 'bg-indigo-500' },
  { subject: 'Science',     avg: 84, color: 'bg-emerald-500' },
  { subject: 'English',     avg: 79, color: 'bg-purple-500' },
];
=======
import { ArrowLeft, TrendingUp, Users, BarChart3, Target } from 'lucide-react';
import {
  getTeacherStudentSummaries,
  aggregateClassRows,
  aggregateSubjectAverages,
  topStudentsByXp,
  teacherOverviewStats,
} from '../../services/rosterProgress';
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e

export default function AnalyticsPage() {
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
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

<<<<<<< HEAD
  const totalStudents = CLASS_DATA.reduce((s, c) => s + c.students, 0);
  const overallAvg = Math.round(CLASS_DATA.reduce((s, c) => s + c.avg * c.students, 0) / totalStudents);
  const totalActive = CLASS_DATA.reduce((s, c) => s + c.active, 0);
=======
  void tick;
  const summaries = getTeacherStudentSummaries();
  const overview = teacherOverviewStats(summaries);
  const classRows = aggregateClassRows(summaries);
  const subjectPerf = aggregateSubjectAverages(summaries);
  const top = topStudentsByXp(summaries, 5);

  const avgLabel = overview.avgScorePct != null ? `${overview.avgScorePct}%` : '—';
  const activeLabel = summaries.length ? overview.active : 0;
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e

  return (
    <AppShell
      title="Analytics"
<<<<<<< HEAD
      left={<button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><ArrowLeft size={20} /></button>}
    >
      <div className="px-5 pt-5 pb-4 space-y-5">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up">
          {[
            { label: 'Students', value: totalStudents, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'Avg Score', value: `${overallAvg}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Active', value: totalActive, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
=======
      left={
        <button type="button" onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={20} />
        </button>
      }
    >
      <div className="px-5 pt-5 pb-4 space-y-5">
        {summaries.length === 0 && (
          <p className="text-sm text-slate-500 py-2">
            Add student accounts on this device to see class analytics from their local activity.
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 animate-fade-up">
          {[
            { label: 'Students', value: overview.totalStudents, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'Avg quiz', value: avgLabel, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Active', value: activeLabel, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
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
        {/* Class-wise Performance */}
=======
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Class Performance</h3>
          <div className="card p-0 overflow-hidden">
            <div className="grid grid-cols-4 p-3 bg-slate-50 text-[10px] font-800 text-slate-400 uppercase tracking-wider">
<<<<<<< HEAD
              <span>Class</span><span className="text-center">Students</span><span className="text-center">Avg</span><span className="text-center">Active</span>
            </div>
            {CLASS_DATA.map((c, i) => (
              <div key={c.cls} className={`grid grid-cols-4 p-3 items-center ${i < CLASS_DATA.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <span className="text-sm font-700 text-slate-800">Class {c.cls}</span>
                <span className="text-center text-sm font-600 text-slate-600">{c.students}</span>
                <span className={`text-center text-sm font-800 ${c.avg >= 80 ? 'text-emerald-500' : c.avg >= 65 ? 'text-amber-500' : 'text-rose-500'}`}>{c.avg}%</span>
=======
              <span>Class</span>
              <span className="text-center">Students</span>
              <span className="text-center">Avg quiz</span>
              <span className="text-center">Active</span>
            </div>
            {classRows.length === 0 && (
              <p className="p-4 text-sm text-slate-400">No class breakdown yet.</p>
            )}
            {classRows.map((c, i) => (
              <div
                key={c.cls}
                className={`grid grid-cols-4 p-3 items-center ${i < classRows.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <span className="text-sm font-700 text-slate-800">Class {c.cls}</span>
                <span className="text-center text-sm font-600 text-slate-600">{c.students}</span>
                <span
                  className={`text-center text-sm font-800 ${
                    c.avg == null ? 'text-slate-400' : c.avg >= 80 ? 'text-emerald-500' : c.avg >= 65 ? 'text-amber-500' : 'text-rose-500'
                  }`}
                >
                  {c.avg != null ? `${c.avg}%` : '—'}
                </span>
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
                <span className="text-center text-sm font-600 text-slate-600">{c.active}</span>
              </div>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* Subject Performance */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Subject Averages</h3>
          <div className="card space-y-4">
            {SUBJECT_PERFORMANCE.map(({ subject, avg, color }) => (
              <div key={subject}>
                <div className="flex justify-between mb-1.5">
                  <p className="text-sm font-700 text-slate-700">{subject}</p>
                  <p className={`text-sm font-800 ${avg >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{avg}%</p>
                </div>
                <div className="progress-track h-2.5">
                  <div className={`progress-fill ${color}`} style={{ width: `${avg}%` }} />
=======
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Subject mix (avg share %)</h3>
          <div className="card space-y-4">
            {subjectPerf.map(({ subject, avg, color }) => (
              <div key={subject}>
                <div className="flex justify-between mb-1.5">
                  <p className="text-sm font-700 text-slate-700">{subject}</p>
                  <p className={`text-sm font-800 ${avg >= 25 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {summaries.length ? `${avg}%` : '—'}
                  </p>
                </div>
                <div className="progress-track h-2.5">
                  <div className={`progress-fill ${color}`} style={{ width: `${Math.min(100, avg)}%` }} />
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
                </div>
              </div>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* Top Students */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Top Students</h3>
          <div className="card p-0 overflow-hidden">
            {TOP_STUDENTS.map((s, i) => (
              <div key={s.rank} className={`flex items-center justify-between p-4 ${i < TOP_STUDENTS.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-800 ${
                    s.rank === 1 ? 'bg-amber-100 text-amber-600' :
                    s.rank === 2 ? 'bg-slate-200 text-slate-600' :
                    s.rank === 3 ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {s.rank}
=======
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Top by XP</h3>
          <div className="card p-0 overflow-hidden">
            {top.length === 0 && <p className="p-4 text-sm text-slate-400">No data yet.</p>}
            {top.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between p-4 ${i < top.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-800 ${
                      i === 0 ? 'bg-amber-100 text-amber-600' :
                      i === 1 ? 'bg-slate-200 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {i + 1}
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
                  </div>
                  <div>
                    <p className="text-sm font-700 text-slate-800">{s.name}</p>
                    <p className="text-[11px] text-slate-400">Class {s.cls}</p>
                  </div>
                </div>
<<<<<<< HEAD
                <span className="text-sm font-800 text-emerald-500">{s.score}%</span>
=======
                <span className="text-sm font-800 text-emerald-600">{s.xp} XP</span>
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
              </div>
            ))}
          </div>
        </div>
<<<<<<< HEAD
=======

        <p className="text-[11px] text-slate-400 flex items-center gap-1">
          <BarChart3 size={12} /> Data is from this browser only until a shared backend links rosters.
        </p>
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
      </div>
    </AppShell>
  );
}
