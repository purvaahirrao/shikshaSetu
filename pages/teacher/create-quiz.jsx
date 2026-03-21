// pages/teacher/create-quiz.jsx — Teacher's quiz creation page
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ArrowLeft, Plus, CheckCircle2, Trash2, BookOpen } from 'lucide-react';

const SUBJECTS = ['math', 'science', 'english', 'social science', 'hindi', 'computer science'];
const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const EMPTY_FORM = {
  question: '',
  options: ['', '', '', ''],
  correctIdx: 0,
  subject: 'math',
  cls: '5',
};

export default function CreateQuizPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ ...EMPTY_FORM, options: ['', '', '', ''] });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [bankLen, setBankLen] = useState(0);
  const questionRef = useRef(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/home');
  }, [user, loading, router]);

  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem('ss_teacher_questions') || '[]');
      setBankLen(b.length);
    } catch { setBankLen(0); }
  }, [saved]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const updateOption = (idx, val) =>
    setForm(f => {
      const opts = [...f.options];
      opts[idx] = val;
      return { ...f, options: opts };
    });

  const addOption = () => {
    if (form.options.length >= 6) return;
    setForm(f => ({ ...f, options: [...f.options, ''] }));
  };

  const removeOption = (idx) => {
    if (form.options.length <= 2) return;
    setForm(f => {
      const opts = f.options.filter((_, i) => i !== idx);
      const ci = f.correctIdx >= opts.length ? opts.length - 1 : f.correctIdx;
      return { ...f, options: opts, correctIdx: ci };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.question.trim()) e.question = 'Question is required';
    if (form.options.some(o => !o.trim())) e.options = 'All options must be filled in';
    const dupes = form.options.map(o => o.trim().toLowerCase());
    if (new Set(dupes).size !== dupes.length) e.options = 'Options must be unique';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const newQ = {
      id: Date.now().toString(),
      question: form.question.trim(),
      options: form.options.map(o => o.trim()),
      answer: form.options[form.correctIdx].trim(),
      subject: form.subject,
      class: form.cls,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
    };

    try {
      const bank = JSON.parse(localStorage.getItem('ss_teacher_questions') || '[]');
      bank.push(newQ);
      localStorage.setItem('ss_teacher_questions', JSON.stringify(bank));
    } catch { }

    setSaved(true);
    setErrors({});
    setTimeout(() => {
      setSaved(false);
      setForm({ ...EMPTY_FORM, options: ['', '', '', ''], subject: form.subject, cls: form.cls });
      questionRef.current?.focus();
    }, 1600);
  };

  return (
    <AppShell
      title="Create Question"
      left={
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
      }
    >
      <div className="px-5 pt-5 pb-8 space-y-5">

        {/* ── Success banner ───────────────────────────── */}
        {saved && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 animate-fade-up">
            <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-700 text-emerald-700">Question saved!</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Your bank now has {bankLen} question{bankLen !== 1 ? 's' : ''}. Form cleared for the next one.
              </p>
            </div>
          </div>
        )}

        {/* ── Class + Subject ──────────────────────────── */}
        <div className="animate-fade-up">
          <p className="text-xs font-800 text-slate-400 uppercase tracking-widest mb-2">Target</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-slate-500 mb-1.5">Class</label>
              <select
                className="input text-sm"
                value={form.cls}
                onChange={e => setForm(f => ({ ...f, cls: e.target.value }))}
              >
                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-slate-500 mb-1.5">Subject</label>
              <select
                className="input text-sm capitalize"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Question ─────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: '40ms' }}>
          <label className="block text-xs font-600 text-slate-500 mb-1.5">Question *</label>
          <textarea
            ref={questionRef}
            className={`input min-h-[96px] resize-none ${errors.question ? 'border-rose-400' : ''}`}
            placeholder="e.g. What is the square root of 144?"
            value={form.question}
            onChange={e => {
              setForm(f => ({ ...f, question: e.target.value }));
              if (errors.question) setErrors(er => ({ ...er, question: undefined }));
            }}
          />
          {errors.question && (
            <p className="text-xs text-rose-500 mt-1 font-600">{errors.question}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1 text-right">{form.question.length} / 300</p>
        </div>

        {/* ── Options ──────────────────────────────────── */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-600 text-slate-500">
              Answer options * &nbsp;
              <span className="text-slate-400 font-500">(tap circle to mark correct)</span>
            </label>
            {form.options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="text-xs text-purple-500 font-700 hover:text-purple-700 transition-colors"
              >
                + Add option
              </button>
            )}
          </div>

          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Correct toggle */}
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, correctIdx: i }))}
                className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${form.correctIdx === i
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 text-slate-400 hover:border-emerald-300'
                  }`}
                aria-label={`Mark option ${String.fromCharCode(65 + i)} as correct`}
              >
                {form.correctIdx === i
                  ? <CheckCircle2 size={15} />
                  : <span className="text-xs font-800">{String.fromCharCode(65 + i)}</span>
                }
              </button>

              <input
                className={`input flex-1 ${errors.options ? 'border-rose-300' : ''}`}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={e => {
                  updateOption(i, e.target.value);
                  if (errors.options) setErrors(er => ({ ...er, options: undefined }));
                }}
              />

              {form.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-400 transition-colors"
                  aria-label="Remove option"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {errors.options && (
            <p className="text-xs text-rose-500 font-600">{errors.options}</p>
          )}
          <p className="text-[11px] text-slate-400">
            Green circle = correct answer. Students see options in the order you write them.
          </p>
        </div>

        {/* ── Preview ──────────────────────────────────── */}
        {form.question.trim() && form.options.some(o => o.trim()) && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 space-y-2 animate-fade-up">
            <p className="text-[10px] font-800 text-slate-400 uppercase tracking-wider mb-3">Preview</p>
            <p className="text-sm font-700 text-slate-800">{form.question}</p>
            <div className="space-y-1.5 mt-2">
              {form.options.filter(o => o.trim()).map((opt, i) => {
                const correct = i === form.correctIdx;
                return (
                  <div
                    key={i}
                    className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${correct ? 'bg-emerald-50 text-emerald-700 font-700' : 'bg-slate-50 text-slate-600'
                      }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-800 shrink-0 ${correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {correct && <CheckCircle2 size={12} className="ml-auto text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Save button ──────────────────────────────── */}
        <Button
          variant="primary"
          className="w-full text-base mt-2"
          onClick={handleSave}
          disabled={saved}
        >
          <Plus size={18} className="mr-1.5" />
          {saved ? 'Saved!' : 'Save to Question Bank'}
        </Button>

        {/* ── Navigate to bank ─────────────────────────── */}
        <button
          type="button"
          onClick={() => router.push('/teacher/content')}
          className="w-full text-center text-sm font-700 text-indigo-500 hover:underline py-2 flex items-center justify-center gap-1.5"
        >
          <BookOpen size={14} />
          View Question Bank ({bankLen})
        </button>

      </div>
    </AppShell>
  );
}
