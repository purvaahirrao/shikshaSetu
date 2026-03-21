// pages/teacher/students.jsx — Teacher's student management page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { Search, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DUMMY_STUDENTS = [
  { id: '1', name: 'Aarav Sharma',   cls: '8', score: 92, quizzes: 12, streak: 7,  trend: 'up' },
  { id: '2', name: 'Priya Patel',    cls: '7', score: 85, quizzes: 9,  streak: 5,  trend: 'up' },
  { id: '3', name: 'Rohan Gupta',    cls: '9', score: 78, quizzes: 6,  streak: 3,  trend: 'down' },
  { id: '4', name: 'Sneha Verma',    cls: '8', score: 95, quizzes: 15, streak: 12, trend: 'up' },
  { id: '5', name: 'Arjun Singh',    cls: '10', score: 63, quizzes: 4, streak: 0,  trend: 'down' },
  { id: '6', name: 'Diya Mehta',     cls: '6', score: 88, quizzes: 10, streak: 8,  trend: 'flat' },
  { id: '7', name: 'Kabir Joshi',    cls: '7', score: 71, quizzes: 7,  streak: 2,  trend: 'down' },
  { id: '8', name: 'Ananya Reddy',   cls: '9', score: 90, quizzes: 11, streak: 9,  trend: 'up' },
];

export default function TeacherStudentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const filtered = DUMMY_STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === 'all' || s.cls === filterClass;
    return matchSearch && matchClass;
  });

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  return (
    <AppShell title="My Students">
      <div className="px-5 pt-5 pb-4 space-y-5">
        {/* Search + Filter */}
        <div className="space-y-3 animate-fade-up">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['all', '6', '7', '8', '9', '10'].map(c => (
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

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="card text-center py-3">
            <p className="text-xl font-display font-900 text-indigo-500">{DUMMY_STUDENTS.length}</p>
            <p className="text-[10px] text-slate-400 font-700 uppercase">Total</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xl font-display font-900 text-emerald-500">{DUMMY_STUDENTS.filter(s => s.score >= 80).length}</p>
            <p className="text-[10px] text-slate-400 font-700 uppercase">Above 80%</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xl font-display font-900 text-rose-500">{DUMMY_STUDENTS.filter(s => s.streak === 0).length}</p>
            <p className="text-[10px] text-slate-400 font-700 uppercase">Inactive</p>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-2 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">
            {filtered.length} Student{filtered.length !== 1 ? 's' : ''}
          </h3>
          <div className="card p-0 overflow-hidden">
            {filtered.map((s, i) => (
              <button
                key={s.id}
                onClick={() => router.push(`/teacher/student/${s.id}`)}
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
                    <p className={`text-sm font-800 ${s.score >= 80 ? 'text-emerald-500' : s.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {s.score}%
                    </p>
                  </div>
                  <TrendIcon trend={s.trend} />
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-8 text-slate-400 text-sm">No students found</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
