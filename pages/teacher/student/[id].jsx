// pages/teacher/student/[id].jsx — Detail from roster + local progress (id = email or uid)
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import AppShell from '../../../components/layout/AppShell';
import Spinner from '../../../components/ui/Spinner';
import { ArrowLeft, BookOpen, Brain, Target, AlertTriangle } from 'lucide-react';
import {
  getRegisteredStudents,
  progressSnapshotForUserRecord,
  weakSubjectsFromProgress,
  formatActivityTime,
} from '../../../services/rosterProgress';
import { accuracyPercent, subjectRowsFromProgress } from '../../../services/userProgress';

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
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

  if (loading || !user || !router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const rawId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const decoded = rawId ? decodeURIComponent(rawId) : '';
  const roster = getRegisteredStudents();
  const student = roster.find((s) => s.email === decoded || s.uid === decoded);

  if (!decoded || !student) {
    return (
      <AppShell title="Student">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
          <p className="text-slate-500 text-lg">Student not found</p>
          <button type="button" onClick={() => router.back()} className="mt-4 text-indigo-500 font-700 text-sm">
            Go back
          </button>
        </div>
      </AppShell>
    );
  }

  void tick;
  const p = progressSnapshotForUserRecord(student);
  const acc = accuracyPercent(p);
  const subjectRows = subjectRowsFromProgress(p).filter((r) => r.name !== 'General');
  const weak = weakSubjectsFromProgress(p);
  const recent = (p.recentActivity || []).slice(0, 8);

  const subjectBars = subjectRows.slice(0, 6).map((r) => ({
    key: r.name,
    label: r.name,
    pct: r.pct,
    questions: r.questions,
  }));

  return (
    <AppShell
      title={student.name || 'Student'}
      left={
        <button type="button" onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={20} />
        </button>
      }
    >
      <div className="px-5 pt-5 pb-4 space-y-5">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-indigo-700 animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-white font-display font-900 text-2xl">{(student.name || 'S').charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-white font-display font-900 text-xl">{student.name}</h2>
              <p className="text-indigo-200 text-sm mt-0.5">Class {student.class || '?'}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-lg font-700">{Math.round(p.xp || 0)} XP</span>
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-lg font-700">
                  {(p.streak || 0)}-day streak
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          {[
            {
              label: 'Quiz avg',
              value: acc != null ? `${acc}%` : '—',
              icon: Target,
              color: acc != null && acc >= 80 ? 'text-emerald-500' : 'text-amber-500',
              bg: acc != null && acc >= 80 ? 'bg-emerald-50' : 'bg-amber-50',
            },
            { label: 'Quizzes', value: p.quizSessions || 0, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Solved', value: p.questionsSolved || 0, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50' },
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

        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Subject mix</h3>
          <div className="card space-y-4">
            {subjectBars.length === 0 && <p className="text-sm text-slate-400">No subject activity yet.</p>}
            {subjectBars.map(({ key, label, pct, questions }) => (
              <div key={key}>
                <div className="flex justify-between mb-1.5">
                  <p className="text-sm font-700 text-slate-700">{label}</p>
                  <p className={`text-sm font-800 ${pct >= 30 ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {questions} q · {pct}% share
                  </p>
                </div>
                <div className="progress-track h-2">
                  <div
                    className={`progress-fill ${pct >= 30 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {weak.length > 0 && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base">Focus areas</h3>
            <div className="flex flex-wrap gap-2">
              {weak.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-700"
                >
                  <AlertTriangle size={12} /> Less practice: {area}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Recent activity</h3>
          <div className="card p-0 overflow-hidden">
            {recent.length === 0 && <p className="p-4 text-sm text-slate-400">No recent questions yet.</p>}
            {recent.map((r, i) => (
              <div
                key={`${r.time}-${i}`}
                className={`flex items-center justify-between p-4 ${i < recent.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-700 text-slate-800 truncate">{r.subject}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{r.q}</p>
                </div>
                <span className="text-[11px] font-600 text-slate-400 shrink-0">{formatActivityTime(r.time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
