// pages/teacher/create-quiz.jsx — Teacher's quiz creation page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ArrowLeft, Plus, CheckCircle2, X } from 'lucide-react';

const SUBJECTS = ['math', 'science', 'english'];
const CLASSES = ['1','2','3','4','5','6','7','8','9','10'];

export default function CreateQuizPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [subject, setSubject] = useState('math');
  const [cls, setCls] = useState('5');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const updateOption = (idx, val) => {
    setOptions(prev => { const n = [...prev]; n[idx] = val; return n; });
  };

  const handleSave = () => {
    if (!question.trim()) return;
    if (options.some(o => !o.trim())) return;

    const newQ = {
      id: Date.now().toString(),
      question: question.trim(),
      options: options.map(o => o.trim()),
      answer: options[correctIdx].trim(),
      subject,
      class: cls,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage question bank
    const bank = JSON.parse(localStorage.getItem('ss_teacher_questions') || '[]');
    bank.push(newQ);
    localStorage.setItem('ss_teacher_questions', JSON.stringify(bank));

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectIdx(0);
    }, 1500);
  };

  return (
    <AppShell
      title="Create Quiz"
      left={<button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><ArrowLeft size={20} /></button>}
    >
      <div className="px-5 pt-5 pb-4 space-y-5">
        {/* Success Banner */}
        {saved && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 animate-fade-up">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <p className="text-sm font-700 text-emerald-700">Question saved to your bank!</p>
          </div>
        )}

        {/* Class + Subject */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up">
          <div>
            <label className="block text-xs font-600 text-slate-500 mb-1.5">Class</label>
            <select className="input text-sm" value={cls} onChange={e => setCls(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-600 text-slate-500 mb-1.5">Subject</label>
            <select className="input text-sm capitalize" value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* Question */}
        <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
          <label className="block text-xs font-600 text-slate-500 mb-1.5">Question</label>
          <textarea
            className="input min-h-[100px] resize-none"
            placeholder="Type your question here..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <label className="block text-xs font-600 text-slate-500">Options (tap to mark correct)</label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => setCorrectIdx(i)}
                className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  correctIdx === i ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-slate-300 hover:border-emerald-300'
                }`}
              >
                {correctIdx === i ? <CheckCircle2 size={16} /> : <span className="text-xs font-700">{String.fromCharCode(65 + i)}</span>}
              </button>
              <input
                className="input flex-1"
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
              />
            </div>
          ))}
          <p className="text-[11px] text-slate-400">Green circle = correct answer</p>
        </div>

        {/* Save */}
        <Button variant="primary" className="w-full text-base mt-2" onClick={handleSave}>
          <Plus size={18} className="mr-1" /> Save Question
        </Button>

        {/* Link to Content */}
        <button
          onClick={() => router.push('/teacher/content')}
          className="w-full text-center text-sm font-700 text-indigo-500 hover:underline py-2"
        >
          View Question Bank
        </button>
      </div>
    </AppShell>
  );
}
