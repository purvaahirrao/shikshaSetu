// pages/teacher/content.jsx — Teacher's question bank management
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import {
  ArrowLeft, Plus, Trash2, BookOpen,
  Search, CheckCircle2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { translateTeacherSubjectSlug } from '../../services/subjectI18n';

const SUBJECT_COLORS = {
  math: { pill: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-200' },
  science: { pill: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200' },
  english: { pill: 'bg-purple-50 text-purple-600', border: 'border-purple-200' },
  'social science': { pill: 'bg-amber-50 text-amber-600', border: 'border-amber-200' },
};

function getSubjectStyle(sub) {
  return SUBJECT_COLORS[sub?.toLowerCase()] ?? { pill: 'bg-slate-100 text-slate-500', border: 'border-slate-200' };
}

export default function ContentPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadBank = useCallback(() => {
    try {
      setQuestions(JSON.parse(localStorage.getItem('ss_teacher_questions') || '[]'));
    } catch { setQuestions([]); }
  }, []);

  useEffect(() => { loadBank(); }, [loadBank]);

  useEffect(() => {
    window.addEventListener('focus', loadBank);
    window.addEventListener('storage', loadBank);
    return () => {
      window.removeEventListener('focus', loadBank);
      window.removeEventListener('storage', loadBank);
    };
  }, [loadBank]);

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

  // Derived filter lists
  const subjects = [...new Set(questions.map(q => q.subject?.toLowerCase()).filter(Boolean))];
  const classes = [...new Set(questions.map(q => q.class).filter(Boolean))].sort((a, b) => +a - +b);

  // Filtered questions
  const filtered = questions.filter(q => {
    const matchS = filterSubject === 'all' || q.subject?.toLowerCase() === filterSubject;
    const matchC = filterClass === 'all' || q.class === filterClass;
    const matchQ = !search || q.question.toLowerCase().includes(search.toLowerCase());
    return matchS && matchC && matchQ;
  });

  const handleDelete = (id) => {
    if (!confirm(t('tc_delete_confirm'))) return;
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    localStorage.setItem('ss_teacher_questions', JSON.stringify(updated));
    if (expandedId === id) setExpandedId(null);
  };

  const handleDeleteAll = () => {
    if (!confirm(t('tc_delete_all_confirm', { n: questions.length }))) return;
    setQuestions([]);
    localStorage.removeItem('ss_teacher_questions');
    setExpandedId(null);
  };

  return (
    <AppShell
      title={t('page_question_bank')}
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

        {/* ── Hero banner ─────────────────────────────── */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-500 to-purple-700 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-xs font-600 uppercase tracking-wide mb-1">
                {t('tc_your_q')}
              </p>
              <p className="text-white font-display font-900 text-2xl leading-none">
                {questions.length}
              </p>
              <p className="text-purple-200 text-xs mt-1.5">
                {subjects.length === 1 ? t('tc_n_subjects_one') : t('tc_n_subjects_many', { n: subjects.length })}
                {' · '}
                {classes.length === 1 ? t('tc_n_classes_one') : t('tc_n_classes_many', { n: classes.length })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/teacher/create-quiz')}
              className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label={t('tc_add_q')}
            >
              <Plus size={24} className="text-white" />
            </button>
          </div>

          {/* Mini subject breakdown */}
          {subjects.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {subjects.map(sub => {
                const count = questions.filter(q => q.subject?.toLowerCase() === sub).length;
                return (
                  <div key={sub} className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
                    <span className="text-white text-xs font-700 capitalize">
                      {translateTeacherSubjectSlug(sub, t)}
                    </span>
                    <span className="text-purple-200 text-[10px] ml-1.5">×{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Search ──────────────────────────────────── */}
        <div className="relative animate-fade-up" style={{ animationDelay: '40ms' }}>
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder={t('tc_search_ph')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Subject filter ───────────────────────────── */}
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar animate-fade-up"
          style={{ animationDelay: '60ms' }}
        >
          {['all', ...subjects].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterSubject(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap capitalize transition-all ${filterSubject === s
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
                }`}
            >
              {s === 'all' ? t('tc_all_subjects') : translateTeacherSubjectSlug(s, t)}
            </button>
          ))}
        </div>

        {/* ── Class filter ─────────────────────────────── */}
        {classes.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto no-scrollbar animate-fade-up"
            style={{ animationDelay: '70ms' }}
          >
            {['all', ...classes].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterClass(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all ${filterClass === c
                    ? 'bg-slate-700 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                  }`}
              >
                {c === 'all' ? t('tc_all_classes') : t('quiz_classN', { n: c })}
              </button>
            ))}
          </div>
        )}

        {/* ── Results count + clear all ────────────────── */}
        {questions.length > 0 && (
          <div className="flex items-center justify-between px-0.5">
            <p className="text-xs text-slate-400 font-600">
              {t('tc_shown', { shown: filtered.length, total: questions.length })}
            </p>
            <button
              type="button"
              onClick={handleDeleteAll}
              className="text-xs text-rose-400 hover:text-rose-600 font-700 transition-colors"
            >
              {t('tc_clear_all')}
            </button>
          </div>
        )}

        {/* ── Question cards ───────────────────────────── */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          {filtered.length === 0 && questions.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-700 mb-1">{t('tc_no_questions')}</p>
              <p className="text-slate-400 text-sm mb-5">{t('tc_no_questions_sub')}</p>
              <button
                type="button"
                onClick={() => router.push('/teacher/create-quiz')}
                className="inline-flex items-center gap-1.5 bg-purple-500 text-white text-sm font-700 px-5 py-2.5 rounded-xl hover:bg-purple-600 transition-colors"
              >
                <Plus size={16} /> {t('tc_create_first')}
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">
              {t('tc_no_match_filter')}
            </p>
          ) : (
            filtered.map((q, i) => {
              const style = getSubjectStyle(q.subject);
              const expanded = expandedId === q.id;
              return (
                <div
                  key={q.id}
                  className={`card overflow-hidden border transition-all animate-fade-up ${expanded ? style.border : 'border-transparent'}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Header row — always visible */}
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpandedId(expanded ? null : q.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setExpandedId(expanded ? null : q.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-700 text-slate-800 leading-snug line-clamp-2">
                        {q.question}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-700 capitalize ${style.pill}`}>
                          {translateTeacherSubjectSlug(q.subject, t)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 font-700 rounded-md">
                          {t('quiz_classN', { n: q.class })}
                        </span>
                        {q.createdBy && (
                          <span className="text-[10px] text-slate-400 font-600">
                            {t('tc_by_author', { name: q.createdBy.split(' ')[0] })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleDelete(q.id); }}
                        className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        aria-label={t('tc_delete_aria')}
                      >
                        <Trash2 size={14} />
                      </button>
                      {expanded
                        ? <ChevronUp size={16} className="text-slate-400" />
                        : <ChevronDown size={16} className="text-slate-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded options */}
                  {expanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      {q.options.map((opt, j) => {
                        const correct = opt === q.answer;
                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-2.5 text-xs px-3 py-2 rounded-lg ${correct
                                ? 'bg-emerald-50 text-emerald-700 font-700'
                                : 'bg-slate-50 text-slate-600'
                              }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-800 shrink-0 ${correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>
                              {String.fromCharCode(65 + j)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {correct && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── FAB ─────────────────────────────────────── */}
        {questions.length > 0 && (
          <button
            type="button"
            onClick={() => router.push('/teacher/create-quiz')}
            className="fixed bottom-24 right-5 w-14 h-14 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 z-40"
            aria-label={t('tc_add_q')}
          >
            <Plus size={26} />
          </button>
        )}

      </div>
    </AppShell>
  );
}