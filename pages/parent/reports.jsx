// pages/parent/reports.jsx — Child stats when a matching student account exists on this device
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import {
  ArrowLeft, TrendingUp, TrendingDown, BookOpen,
  Brain, Target, Calendar, CheckCircle2,
} from 'lucide-react';
import {
  findLinkedStudentForParent,
  progressSnapshotForUserRecord,
} from '../../services/rosterProgress';
import {
  accuracyPercent,
  subjectRowsFromProgress,
  weekChartData,
} from '../../services/userProgress';
import { translateSubjectDisplayName } from '../../services/subjectI18n';

export default function ParentReportsPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  // Re-derive stats whenever another tab/window updates localStorage
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Derive everything from the linked student account (if any)
  void tick; // consumed only to trigger re-render on storage changes
  const linked = findLinkedStudentForParent(user);
  const p = linked ? progressSnapshotForUserRecord(linked) : null;
  const acc = p ? accuracyPercent(p) : null;
  const subjectRows = p
    ? subjectRowsFromProgress(p).filter(r => r.name !== 'General')
    : [];
  const weekBars = p
    ? weekChartData(p)
    : [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => ({
        day: '',
        dayIndex,
        count: 0,
        heightPct: 12,
        done: false,
      }));
  const maxBar = Math.max(1, ...weekBars.map(b => b.count));
  const totalQuestions = p?.questionsSolved ?? 0;
  const totalQuizzes = p?.quizSessions ?? 0;

  const STAT_CARDS = [
    {
      k: 'acc',
      label: t('pr_label_accuracy'),
      value: acc != null ? `${acc}%` : '—',
      icon: Target,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      k: 'sol',
      label: t('home_solved'),
      value: linked ? totalQuestions : 0,
      icon: BookOpen,
      color: 'text-brand-500',
      bg: 'bg-brand-50',
    },
    {
      k: 'qz',
      label: t('home_statQuizzes'),
      value: linked ? totalQuizzes : 0,
      icon: Brain,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  const recentActivity = (p?.recentActivity ?? []).slice(0, 6);

  return (
    <AppShell
      title={t('page_reports')}
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
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 animate-fade-up">
          <p className="text-amber-100 text-sm font-600">{t('pr_perf_title')}</p>
          <p className="text-white font-display font-900 text-xl mt-1">
            {user.childName || t('pa_child_placeholder')}
          </p>
          <p className="text-amber-100 text-xs mt-1">
            {t('pr_class_device', { cls: user.childClass || '?' })}
          </p>
        </div>

        {/* ── No linked account notice ─────────────────── */}
        {!linked && (
          <div className="card border border-amber-100 bg-amber-50/80 text-amber-900 text-sm leading-relaxed">
            {t('pr_link_notice')}
          </div>
        )}

        {/* ── Quick stats ──────────────────────────────── */}
        <div
          className="grid grid-cols-3 gap-3 animate-fade-up"
          style={{ animationDelay: '60ms' }}
        >
          {STAT_CARDS.map(({ k, label, value, icon: Icon, color, bg }) => (
            <div key={k} className="card text-center py-4">
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Weekly activity chart ─────────────────────── */}
        <div
          className="space-y-3 animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          <h3 className="font-display font-800 text-slate-700 text-base flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            {t('pr_week_activity')}
          </h3>
          <div className="card">
            <div className="flex items-end justify-between gap-2 h-28 mb-3">
              {weekBars.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end h-20">
                    <div
                      className={`w-full rounded-t-lg transition-all ${b.done ? 'bg-amber-400' : 'bg-slate-100'
                        }`}
                      style={{
                        height: `${b.done ? Math.max(8, (b.count / maxBar) * 100) : 4}%`,
                        minHeight: b.count > 0 ? 6 : 2,
                      }}
                    />
                  </div>
                  <span className={`text-[10px] font-700 ${b.done ? 'text-amber-500' : 'text-slate-400'}`}>
                    {t(`prog_wd${b.dayIndex}`)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              {t('pr_week_hint')}
            </p>
          </div>
        </div>

        {/* ── Subject breakdown ────────────────────────── */}
        <div
          className="space-y-3 animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          <h3 className="font-display font-800 text-slate-700 text-base">
            {t('pr_subject_title')}
          </h3>

          {!linked || subjectRows.length === 0 ? (
            <p className="text-sm text-slate-400">
              {t('pr_no_subject_yet')}
            </p>
          ) : (
            <div className="space-y-3">
              {subjectRows.map(s => {
                const trendUp = s.pct >= 25;
                const scoreColor =
                  s.questions >= 5 ? 'text-emerald-500' :
                    s.questions >= 1 ? 'text-amber-500' :
                      'text-slate-400';
                return (
                  <div key={s.name} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-700 text-slate-800">
                          {translateSubjectDisplayName(s.name, t)}
                        </p>
                        {trendUp
                          ? <TrendingUp size={14} className="text-emerald-500" />
                          : <TrendingDown size={14} className="text-rose-400" />
                        }
                      </div>
                      <span className={`text-sm font-800 ${scoreColor}`}>
                        {s.questions === 1
                          ? t('pr_questions_one')
                          : t('pr_questions_many', { n: s.questions })}
                      </span>
                    </div>
                    <div className="progress-track h-2">
                      <div
                        className={`progress-fill ${trendUp ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, s.pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent activity ──────────────────────────── */}
        <div
          className="space-y-3 animate-fade-up"
          style={{ animationDelay: '200ms' }}
        >
          <h3 className="font-display font-800 text-slate-700 text-base">
            {t('pr_recent_title')}
          </h3>
          <div className="card p-0 overflow-hidden">
            {recentActivity.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">
                {t('pr_no_recent')}
              </p>
            ) : (
              recentActivity.map((r, i) => (
                <div
                  key={`${r.time}-${i}`}
                  className={`flex items-center justify-between gap-3 p-4 ${i < recentActivity.length - 1 ? 'border-b border-slate-50' : ''
                    }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-700 text-slate-800">
                      {translateSubjectDisplayName(r.subject, t)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {r.q}
                    </p>
                  </div>
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
