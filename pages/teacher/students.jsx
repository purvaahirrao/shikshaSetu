// pages/teacher/students.jsx — Students from ss_registered_users + their progress on this device
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import {
  Search, ChevronRight, TrendingUp, TrendingDown,
  Minus, Users, Flame, Award, SlidersHorizontal,
} from 'lucide-react';
import { getTeacherStudentSummaries } from '../../services/rosterProgress';

const SORT_OPTIONS = [
  { key: 'name', label: 'Name A–Z' },
  { key: 'xp', label: 'XP (high)' },
  { key: 'score', label: 'Score (high)' },
  { key: 'streak', label: 'Streak' },
];

export default function TeacherStudentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [showSort, setShowSort] = useState(false);
  const [summaries, setSummaries] = useState([]);

  const refresh = useCallback(() => {
    setSummaries(getTeacherStudentSummaries());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Derived values
  const allClasses = [...new Set(summaries.map(s => s.cls))].sort((a, b) => +a - +b);
  const above80 = summaries.filter(s => s.scorePct != null && s.scorePct >= 80).length;
  const inactive = summaries.filter(s => (s.streak ?? 0) === 0).length;
  const totalXP = summaries.reduce((t, s) => t + (s.xp ?? 0), 0);

  // Filter → sort
  const sorted = summaries
    .filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchClass = filterClass === 'all' || s.cls === filterClass;
      return matchSearch && matchClass;
    })
    .sort((a, b) => {
      if (sortKey === 'xp') return (b.xp ?? 0) - (a.xp ?? 0);
      if (sortKey === 'score') return (b.scorePct ?? -1) - (a.scorePct ?? -1);
      if (sortKey === 'streak') return (b.streak ?? 0) - (a.streak ?? 0);
      return a.name.localeCompare(b.name);
    });

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const scoreLabel = s =>
    s.scorePct != null ? `${s.scorePct}%` : s.xp > 0 ? `${s.xp} XP` : '—';

  const scoreTone = s => {
    if (s.scorePct != null) {
      return s.scorePct >= 80 ? 'text-emerald-500' :
        s.scorePct >= 60 ? 'text-amber-500' : 'text-rose-500';
    }
    return s.xp > 0 ? 'text-indigo-500' : 'text-slate-400';
  };

  // Avatar initials color cycle
  const AVATAR_COLORS = [
    'bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600',
    'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
  ];

  return (
    <AppShell title="My Students">
      <div className="px-5 pt-5 pb-8 space-y-5">

        {/* ── Summary stats ────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2 animate-fade-up">
          {[
            { label: 'Total', value: summaries.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: '80%+ avg', value: above80, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'No streak', value: inactive, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' },
            {
              label: 'Total XP', value: totalXP > 999 ? `${(totalXP / 1000).toFixed(1)}k` : totalXP,
              icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50'
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card text-center py-3 px-1">
              <div className={`inline-flex items-center justify-center h-7 w-7 rounded-lg ${bg} mx-auto mb-1.5`}>
                <Icon size={13} className={color} />
              </div>
              <p className={`font-display font-900 text-base leading-none ${color}`}>{value}</p>
              <p className="text-[9px] text-slate-400 font-700 uppercase tracking-wide mt-1 leading-none">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Empty state ──────────────────────────────── */}
        {summaries.length === 0 && (
          <div className="card border border-indigo-100 bg-indigo-50/60 text-sm text-indigo-900 leading-relaxed">
            No student accounts found on this device. Students appear here after they
            <strong> register with the Student role</strong> in the same browser.
          </div>
        )}

        {/* ── Search + filters ─────────────────────────── */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                placeholder="Search students…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowSort(v => !v)}
              className={`px-3 h-11 rounded-xl border text-xs font-700 flex items-center gap-1.5 transition-colors ${showSort
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
            >
              <SlidersHorizontal size={14} />
              Sort
            </button>
          </div>

          {showSort && (
            <div className="flex gap-2 flex-wrap animate-fade-up">
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.key}
                  onClick={() => setSortKey(o.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-700 transition-all ${sortKey === o.key ? 'bg-indigo-500 text-white' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}

          {/* Class filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['all', ...allClasses].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterClass(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all ${filterClass === c
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                  }`}
              >
                {c === 'all' ? 'All Classes' : `Class ${c}`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Student list ─────────────────────────────── */}
        <div className="space-y-2 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display font-800 text-slate-700 text-base">
              {sorted.length} Student{sorted.length !== 1 ? 's' : ''}
            </h3>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-600"
              >
                Clear search
              </button>
            )}
          </div>

          <div className="card p-0 overflow-hidden">
            {summaries.length > 0 && sorted.length === 0 && (
              <p className="text-center py-8 text-slate-400 text-sm">
                No students match these filters
              </p>
            )}

            {sorted.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => router.push(`/teacher/student/${encodeURIComponent(s.id)}`)}
                className={`w-full flex items-center justify-between gap-3 p-4 hover:bg-slate-50 transition-colors ${i < sorted.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-800 text-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]
                  }`}>
                  {s.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-700 text-slate-800 truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-slate-400">Class {s.cls}</span>
                    <span className="text-[11px] text-slate-300">|</span>
                    <span className="text-[11px] text-slate-400">{s.quizzes ?? 0} quiz{(s.quizzes ?? 0) !== 1 ? 'zes' : ''}</span>
                    {(s.streak ?? 0) > 0 && (
                      <>
                        <span className="text-[11px] text-slate-300">|</span>
                        <span className="text-[11px] text-amber-500 font-700">
                          🔥 {s.streak}d
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score + trend */}
                <div className="flex items-center gap-2 shrink-0">
                  <p className={`text-sm font-800 ${scoreTone(s)}`}>{scoreLabel(s)}</p>
                  <TrendIcon trend={s.trend} />
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
