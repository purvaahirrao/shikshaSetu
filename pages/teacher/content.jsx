// pages/teacher/content.jsx — Teacher's question bank management
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { ArrowLeft, Plus, Trash2, Edit3, BookOpen, Filter } from 'lucide-react';

export default function ContentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/home');
  }, [user, loading, router]);

  useEffect(() => {
    const bank = JSON.parse(localStorage.getItem('ss_teacher_questions') || '[]');
    setQuestions(bank);
  }, []);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const filtered = questions.filter(q => {
    const matchS = filterSubject === 'all' || q.subject === filterSubject;
    const matchC = filterClass === 'all' || q.class === filterClass;
    return matchS && matchC;
  });

  const handleDelete = (id) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    localStorage.setItem('ss_teacher_questions', JSON.stringify(updated));
  };

  const subjects = [...new Set(questions.map(q => q.subject))];
  const classes = [...new Set(questions.map(q => q.class))].sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <AppShell
      title="Question Bank"
      left={<button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><ArrowLeft size={20} /></button>}
    >
      <div className="px-5 pt-5 pb-4 space-y-5">
        {/* Summary */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-500 to-purple-700 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-600">Your Questions</p>
              <p className="text-white font-display font-900 text-2xl mt-0.5">{questions.length}</p>
              <p className="text-purple-200 text-xs mt-1">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} covered</p>
            </div>
            <button
              onClick={() => router.push('/teacher/create-quiz')}
              className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Plus size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar animate-fade-up" style={{ animationDelay: '60ms' }}>
          <button
            onClick={() => setFilterSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all ${
              filterSubject === 'all' ? 'bg-purple-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >All Subjects</button>
          {subjects.map(s => (
            <button key={s} onClick={() => setFilterSubject(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap capitalize transition-all ${
                filterSubject === s ? 'bg-purple-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >{s}</button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-700 mb-2">No questions yet</p>
              <p className="text-slate-400 text-sm mb-4">Create your first question to build your bank</p>
              <button
                onClick={() => router.push('/teacher/create-quiz')}
                className="inline-flex items-center gap-1 text-sm font-700 text-indigo-500"
              >
                <Plus size={16} /> Create Question
              </button>
            </div>
          ) : (
            filtered.map((q, i) => (
              <div key={q.id} className="card relative animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-700 text-slate-800 flex-1 leading-relaxed">{q.question}</p>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-1.5 mb-3">
                  {q.options.map((opt, j) => (
                    <div key={j} className={`text-xs px-3 py-1.5 rounded-lg ${opt === q.answer ? 'bg-emerald-50 text-emerald-700 font-700' : 'bg-slate-50 text-slate-600'}`}>
                      {String.fromCharCode(65 + j)}. {opt} {opt === q.answer && '✓'}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 font-700 rounded-md capitalize">{q.subject}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 font-700 rounded-md">Class {q.class}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
