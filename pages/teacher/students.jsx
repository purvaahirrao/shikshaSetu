// pages/teacher/students.jsx — Students from ss_registered_users + their progress on this device
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { Search, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getTeacherStudentSummaries } from '../../services/rosterProgress';

export default function TeacherStudentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [summaries, setSummaries] = useState([]);

  const refresh = useCallback(() => {
    setSummaries(getTeacherStudentSummaries());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  const filtered = summaries.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === 'all' || s.cls === filterClass;
    return matchSearch && matchClass;
  });

  const above80 = summaries.filter((s) => s.scorePct != null && s.scorePct >= 80).length;
  const inactive = summaries.filter((s) => s.streak === 0).length;

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const scoreLabel = (s) => {
    if (s.scorePct != null) return `${s.scorePct}%`;
    if (s.xp > 0) return `${s.xp} XP`;
    return '—';
  };

  const scoreTone = (s) => {
    if (s.scorePct != null) {
      return s.scorePct >= 80 ? 'text-emerald-500' : s.scorePct >= 60 ? 'text-amber-500' : 'text-rose-500';
    }
    return s.xp > 0 ? 'text-indigo-500' : 'text-slate-400';
  };

  return (
    <AppShell title="My Students">
      <div className="px-5 pt-5 pb-4 space-y-5">
        <div className="space-y-3 animate-fade-up">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['all', '6', '7', '8', '9', '10'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterClass(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all ${
                  filterClass === c ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {c === 'all' ? 'All Classes' : `Class ${c}`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="card text-center py-3">
            <p className="text-xl font-display font-900 text-indigo-500">{summaries.length}</p>
            <p className="text-[10px] text-slate-400 font-700 uppercase">Total</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xl font-display font-900 text-emerald-500">{above80}</p>
            <p className="text-[10px] text-slate-400 font-700 uppercase">Quiz 80%+</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xl font-display font-900 text-rose-500">{inactive}</p>
            <p className="text-[10px] text-slate-400 font-700 uppercase">No streak</p>
          </div>
        </div>

        <div className="space-y-2 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">
            {filtered.length} Student{filtered.length !== 1 ? 's' : ''}
          </h3>
          {summaries.length === 0 && (
            <p className="text-sm text-slate-500 py-4">
              No student accounts found on this device. Students appear here after they register in the app (same browser).
            </p>
          )}
          <div className="card p-0 overflow-hidden">
            {filtered.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => router.push(`/teacher/student/${encodeURIComponent(s.id)}`)}
                className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${
                  i < filtered.length - 1 ? 'border-b border-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-indigo-600 font-800 text-sm">{s.name.charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-700 text-slate-800">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">Class {s.cls}</span>
                      <span className="text-[11px] text-slate-300">|</span>
                      <span className="text-[11px] text-slate-400">{s.quizzes} quizzes</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`text-sm font-800 ${scoreTone(s)}`}>{scoreLabel(s)}</p>
                  </div>
                  <TrendIcon trend={s.trend} />
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </button>
            ))}
            {summaries.length > 0 && filtered.length === 0 && (
              <p className="text-center py-8 text-slate-400 text-sm">No students match filters</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
