// pages/parent/index.jsx — Parent dashboard
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Users, BarChart3, BookOpen, Flame,
  ChevronRight, Target, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useRequireRole } from '../../hooks/useRequireRole';
import { useI18n } from '../../hooks/useI18n';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import {
  findLinkedStudentForParent,
  progressSnapshotForUserRecord,
} from '../../services/rosterProgress';
import { accuracyPercent, weekChartData } from '../../services/userProgress';
import { translateSubjectDisplayName } from '../../services/subjectI18n';

export default function ParentHomePage() {
  const { user, loading } = useRequireRole('parent');
  const { t } = useI18n();
  const router = useRouter();

  // Refresh when another tab updates localStorage
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

  void tick;
  const linked = findLinkedStudentForParent(user);
  const p = linked ? progressSnapshotForUserRecord(linked) : null;
  const acc = p ? accuracyPercent(p) : null;
  const weekBars = p ? weekChartData(p) : [];
  const activeDaysThisWeek = weekBars.filter(b => b.done).length;
  const firstName = user?.name?.split(' ')[0] ?? t('pa_parent_placeholder');
  const childName = user?.childName || t('pa_child_placeholder');

  // Derive a simple health signal
  const healthColor =
    !linked ? 'text-slate-400' :
      activeDaysThisWeek >= 5 ? 'text-emerald-500' :
        activeDaysThisWeek >= 3 ? 'text-amber-500' :
          'text-rose-500';
  const healthLabel =
    !linked ? t('pa_health_unlinked') :
      activeDaysThisWeek >= 5 ? t('pa_health_great') :
        activeDaysThisWeek >= 3 ? t('pa_health_ok') :
          t('pa_health_low');

  const QUICK_ACTIONS = useMemo(
    () => [
      {
        key: 'report',
        label: t('pa_quick_report'),
        sub: t('pa_quick_report_sub'),
        icon: BarChart3,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        href: '/parent/reports',
      },
      {
        key: 'prog',
        label: t('pa_quick_progress'),
        sub: t('pa_quick_progress_sub'),
        icon: Target,
        iconBg: 'bg-brand-100',
        iconColor: 'text-brand-600',
        href: '/progress',
      },
      {
        key: 'lb',
        label: t('pa_quick_lb'),
        sub: t('pa_quick_lb_sub'),
        icon: Users,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        href: '/leaderboard',
      },
    ],
    [t],
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AppShell title={t('page_parent_home')}>
      <div className="px-5 pt-6 pb-24 space-y-5">

        {/* ── Greeting ────────────────────────────────── */}
        <div className="animate-fade-up">
          <h1 className="font-display font-900 text-2xl text-slate-800 leading-tight">
            {t('pa_hi', { name: firstName })}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('pa_child_doing_prefix')}
            <strong>{childName}</strong>
            {t('pa_child_doing_suffix')}
          </p>
        </div>

        {/* ── No linked account banner ─────────────────── */}
        {!linked && (
          <div
            className="card border border-amber-100 bg-amber-50 flex items-start gap-3 animate-fade-up"
            style={{ animationDelay: '40ms' }}
          >
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-700 text-amber-900">{t('pa_no_linked_title')}</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                {t('pa_no_linked_body')}
              </p>
            </div>
          </div>
        )}

        {/* ── Child summary card ───────────────────────── */}
        <div
          className="rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-fade-up"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-100 text-xs font-600 uppercase tracking-wide mb-1">
                {t('pa_linked_student')}
              </p>
              <p className="font-display font-900 text-xl leading-tight">{childName}</p>
              <p className="text-amber-100 text-xs mt-1">
                {t('quiz_classN', { n: user.childClass || '?' })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
          </div>

          {linked && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { k: 'q', label: t('home_statQuestions'), value: p?.questionsSolved ?? 0 },
                { k: 'a', label: t('home_quizAvg'), value: acc != null ? `${acc}%` : '—' },
                { k: 's', label: t('home_statStreak'), value: p?.streak != null ? t('ta_top_streak_val', { n: p.streak }) : '—' },
              ].map(({ k, label, value }) => (
                <div key={k} className="bg-white/15 rounded-xl p-2.5 text-center">
                  <p className="font-display font-900 text-lg leading-none">{value}</p>
                  <p className="text-amber-100 text-[10px] font-600 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Weekly health signal ─────────────────────── */}
        <div
          className="card flex items-center gap-4 animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
            <Flame size={20} className={healthColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-700 text-sm text-slate-800">{t('pa_this_week')}</p>
            <p className={`text-sm font-800 mt-0.5 ${healthColor}`}>{healthLabel}</p>
          </div>
          {linked && (
            <div className="flex gap-1">
              {weekBars.slice(0, 7).map((b, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-full ${b.done ? 'bg-amber-400' : 'bg-slate-200'}`}
                  style={{ height: b.done ? 24 : 12, alignSelf: 'flex-end' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Quick actions ────────────────────────────── */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: '140ms' }}
        >
          <p className="text-xs font-800 text-slate-400 uppercase tracking-widest px-1 mb-2">
            {t('home_explore')}
          </p>
          <div className="card p-0 overflow-hidden">
            {QUICK_ACTIONS.map(({ key, label, sub, icon: Icon, iconBg, iconColor, href }, i) => (
              <button
                key={key}
                type="button"
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-left ${i < QUICK_ACTIONS.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
              >
                <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-700 text-sm text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent activity preview ───────────────────── */}
        {linked && (p?.recentActivity ?? []).length > 0 && (
          <div
            className="animate-fade-up"
            style={{ animationDelay: '180ms' }}
          >
            <p className="text-xs font-800 text-slate-400 uppercase tracking-widest px-1 mb-2">
              {t('pa_recent_questions')}
            </p>
            <div className="card p-0 overflow-hidden">
              {(p.recentActivity ?? []).slice(0, 3).map((r, i) => (
                <div
                  key={`${r.time}-${i}`}
                  className={`flex items-center gap-3 p-4 ${i < 2 ? 'border-b border-slate-50' : ''}`}
                >
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-700 text-slate-500">
                      {translateSubjectDisplayName(r.subject, t)}
                    </p>
                    <p className="text-sm text-slate-800 line-clamp-1 mt-0.5">{r.q}</p>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => router.push('/parent/reports')}
                className="w-full p-3 text-xs font-700 text-brand-500 hover:bg-brand-50 transition-colors text-center"
              >
                {t('pa_view_full')}
              </button>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
