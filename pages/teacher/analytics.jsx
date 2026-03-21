// pages/teacher/analytics.jsx — Aggregates from registered students on this device
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import {
  ArrowLeft, TrendingUp, Users, BarChart3,
  Target, BookOpen, Brain, Award, Flame,
} from 'lucide-react';
import {
  getTeacherStudentSummaries,
  aggregateClassRows,
  aggregateSubjectAverages,
  topStudentsByXp,
  teacherOverviewStats,
} from '../../services/rosterProgress';
import { translateSubjectDisplayName } from '../../services/subjectI18n';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
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
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  void tick;
  const summaries = getTeacherStudentSummaries();
  const overview = teacherOverviewStats(summaries);
  const classRows = aggregateClassRows(summaries);
  const subjectPerf = aggregateSubjectAverages(summaries);
  const top = topStudentsByXp(summaries, 5);

  const avgLabel = overview.avgScorePct != null ? `${overview.avgScorePct}%` : '—';
  const totalXP = summaries.reduce((s, st) => s + (st.xp ?? 0), 0);
  const topStreak = summaries.reduce((max, st) => Math.max(max, st.streak ?? 0), 0);
  const hasData = summaries.length > 0;

  // Activity heat — how many students were active each weekday
  const heatByDay = Array(7).fill(0);
  summaries.forEach(st => {
    (st.weekBars ?? []).forEach((b, i) => { if (b?.done) heatByDay[i]++; });
  });
  const maxHeat = Math.max(1, ...heatByDay);

  return (
    <AppShell
      title={t('nav_analytics')}
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
      <div className="px-5 pt-5 pb-8 space-y-6">

        {/* ── Hero banner ─────────────────────────────── */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white animate-fade-up">
          <p className="text-indigo-200 text-xs font-600 uppercase tracking-wide mb-1">{t('ta_hero')}</p>
          <p className="font-display font-900 text-2xl leading-tight">
            {hasData
              ? summaries.length === 1
                ? t('ta_students_one')
                : t('ta_students_many', { n: summaries.length })
              : t('ta_no_students_hero')}
          </p>
          <p className="text-indigo-200 text-xs mt-1">
            {hasData
              ? t('ta_hero_line_data', {
                  active: overview.active,
                  pct: overview.avgScorePct ?? '—',
                })
              : t('ta_hero_line_empty')}
          </p>
          {hasData && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { k: 'xp', label: t('ta_total_xp'), value: totalXP.toLocaleString() },
                { k: 'st', label: t('ta_top_streak'), value: t('ta_top_streak_val', { n: topStreak }) },
                { k: 'cl', label: t('ta_classes'), value: classRows.length },
              ].map(({ k, label, value }) => (
                <div key={k} className="bg-white/15 rounded-xl p-2.5 text-center">
                  <p className="font-display font-900 text-lg leading-none">{value}</p>
                  <p className="text-indigo-200 text-[10px] font-600 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Empty state ──────────────────────────────── */}
        {!hasData && (
          <div className="card border border-indigo-100 bg-indigo-50/60 text-indigo-900 text-sm leading-relaxed">
            {t('ta_register_1')}
            <strong>{t('ta_register_strong')}</strong>
            {t('ta_register_2')}
          </div>
        )}

        {/* ── Overview stat cards ───────────────────────── */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          {[
            { k: 'st', label: t('ta_card_students'), value: overview.totalStudents, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { k: 'avg', label: t('ta_card_avg_quiz'), value: avgLabel, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { k: 'ac', label: t('ta_card_active'), value: hasData ? overview.active : 0, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
            { k: 'qz', label: t('ta_card_sessions'), value: summaries.reduce((s, st) => s + (st.quizzes ?? 0), 0), icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(({ k, label, value, icon: Icon, color, bg }) => (
            <div key={k} className="card flex items-center gap-3 py-4">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${bg} shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Class-wise performance ───────────────────── */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">{t('ta_class_perf')}</h3>
          <div className="card p-0 overflow-hidden">
            <div className="grid grid-cols-4 p-3 bg-slate-50 text-[10px] font-800 text-slate-400 uppercase tracking-wider">
              <span>{t('ta_col_class')}</span>
              <span className="text-center">{t('ta_col_students')}</span>
              <span className="text-center">{t('ta_col_avg')}</span>
              <span className="text-center">{t('ta_col_active')}</span>
            </div>
            {classRows.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">{t('ta_no_class')}</p>
            ) : (
              classRows.map((c, i) => {
                const scoreColor =
                  c.avg == null ? 'text-slate-400' :
                    c.avg >= 80 ? 'text-emerald-500' :
                      c.avg >= 65 ? 'text-amber-500' :
                        'text-rose-500';
                return (
                  <div
                    key={c.cls}
                    className={`grid grid-cols-4 p-3 items-center ${i < classRows.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <span className="text-sm font-700 text-slate-800">{t('quiz_classN', { n: c.cls })}</span>
                    <span className="text-center text-sm font-600 text-slate-600">{c.students}</span>
                    <span className={`text-center text-sm font-800 ${scoreColor}`}>
                      {c.avg != null ? `${c.avg}%` : '—'}
                    </span>
                    <span className="text-center text-sm font-600 text-slate-600">{c.active}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Subject mix ──────────────────────────────── */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '140ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">{t('ta_subject_eng')}</h3>
          <div className="card space-y-4">
            {subjectPerf.length === 0 ? (
              <p className="text-sm text-slate-400">{t('ta_no_subject')}</p>
            ) : (
              subjectPerf.map(({ subject, avg, color }) => (
                <div key={subject}>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-sm font-700 text-slate-700">{translateSubjectDisplayName(subject, t)}</p>
                    <p className={`text-sm font-800 ${avg >= 25 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {hasData ? `${avg}%` : '—'}
                    </p>
                  </div>
                  <div className="progress-track h-2.5">
                    <div
                      className={`progress-fill ${color}`}
                      style={{ width: `${Math.min(100, avg)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Weekly activity heatmap ───────────────────── */}
        {hasData && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base">
              {t('ta_week_title')}
            </h3>
            <div className="card">
              <div className="flex items-end justify-between gap-2 h-24 mb-3">
                {heatByDay.map((count, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex flex-col justify-end h-16">
                      <div
                        className="w-full rounded-t-lg transition-all bg-indigo-400"
                        style={{
                          height: `${count > 0 ? Math.max(8, (count / maxHeat) * 100) : 4}%`,
                          minHeight: count > 0 ? 6 : 2,
                          opacity: count > 0 ? 1 : 0.2,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-700 text-slate-400">{t(`prog_wd${i}`)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                {t('ta_bar_hint')}
              </p>
            </div>
          </div>
        )}

        {/* ── Top students by XP ───────────────────────── */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '180ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">{t('ta_top_xp')}</h3>
          <div className="card p-0 overflow-hidden">
            {top.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">{t('ta_no_top')}</p>
            ) : (
              top.map((s, i) => {
                const medalBg =
                  i === 0 ? 'bg-amber-100 text-amber-600' :
                    i === 1 ? 'bg-slate-200 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-500';
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => router.push(`/teacher/student/${encodeURIComponent(s.id)}`)}
                    className={`w-full flex items-center justify-between gap-3 p-4 hover:bg-slate-50 transition-colors ${i < top.length - 1 ? 'border-b border-slate-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-800 shrink-0 ${medalBg}`}>
                        {i + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-700 text-slate-800">{s.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t('quiz_classN', { n: s.cls })} ·{' '}
                          {s.quizzes === 1
                            ? `1 ${t('ta_quiz_one')}`
                            : `${s.quizzes} ${t('ta_quiz_many')}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-800 text-indigo-600">{t('lb_xp', { n: s.xp })}</p>
                      {s.scorePct != null && (
                        <p className={`text-[11px] font-700 ${s.scorePct >= 80 ? 'text-emerald-500' : s.scorePct >= 60 ? 'text-amber-500' : 'text-rose-400'}`}>
                          {t('ta_avg_suffix', { pct: s.scorePct })}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── At-risk students ─────────────────────────── */}
        {hasData && (() => {
          const atRisk = summaries.filter(s =>
            (s.scorePct != null && s.scorePct < 50) || (s.streak === 0 && s.quizzes > 0)
          );
          if (atRisk.length === 0) return null;
          return (
            <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <h3 className="font-display font-800 text-slate-700 text-base flex items-center gap-2">
                <Flame size={16} className="text-rose-400" /> {t('th_needs_attention')}
              </h3>
              <div className="card p-0 overflow-hidden border border-rose-100">
                {atRisk.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => router.push(`/teacher/student/${encodeURIComponent(s.id)}`)}
                    className={`w-full flex items-center justify-between gap-3 p-4 bg-rose-50/40 hover:bg-rose-50 transition-colors ${i < atRisk.length - 1 ? 'border-b border-rose-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <span className="text-rose-600 font-800 text-sm">{(s.name || '?').charAt(0)}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-700 text-slate-800">{s.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {s.scorePct != null && s.scorePct < 50
                            ? t('th_low_quiz', { pct: s.scorePct })
                            : t('ta_no_recent')}
                        </p>
                      </div>
                    </div>
                    <Award size={14} className="text-rose-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pb-2">
          <BarChart3 size={12} />
          {t('ta_footer')}
        </p>

      </div>
    </AppShell>
  );
}
