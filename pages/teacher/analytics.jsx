// pages/teacher/analytics.jsx — Aggregates from registered students on this device
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { ArrowLeft, TrendingUp, Users, BarChart3, Target } from 'lucide-react';
import {
  getTeacherStudentSummaries,
  aggregateClassRows,
  aggregateSubjectAverages,
  topStudentsByXp,
  teacherOverviewStats,
} from '../../services/rosterProgress';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  void tick;
  const summaries = getTeacherStudentSummaries();
  const overview = teacherOverviewStats(summaries);
  const classRows = aggregateClassRows(summaries);
  const subjectPerf = aggregateSubjectAverages(summaries);
  const top = topStudentsByXp(summaries, 5);

  const avgLabel = overview.avgScorePct != null ? `${overview.avgScorePct}%` : '—';
  const activeLabel = summaries.length ? overview.active : 0;

  return (
    <AppShell
      title="Analytics"
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

        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Class Performance</h3>
          <div className="card p-0 overflow-hidden">
            <div className="grid grid-cols-4 p-3 bg-slate-50 text-[10px] font-800 text-slate-400 uppercase tracking-wider">
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
                <span className="text-center text-sm font-600 text-slate-600">{c.active}</span>
              </div>
            ))}
          </div>
        </div>

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
                </div>
              </div>
            ))}
          </div>
        </div>

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
                  </div>
                  <div>
                    <p className="text-sm font-700 text-slate-800">{s.name}</p>
                    <p className="text-[11px] text-slate-400">Class {s.cls}</p>
                  </div>
                </div>
                <span className="text-sm font-800 text-emerald-600">{s.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 flex items-center gap-1">
          <BarChart3 size={12} /> Data is from this browser only until a shared backend links rosters.
        </p>
      </div>
    </AppShell>
  );
}
