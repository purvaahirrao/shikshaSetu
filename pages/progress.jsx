// pages/progress.jsx — stats from local activity (+ Postgres when API + UUID available)
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Flame, BookOpen, Target, TrendingUp,
  Calculator, FlaskConical, Globe, Star,
  Trophy, Rocket, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { useStudentProgress } from '../hooks/useStudentProgress';
import AppShell from '../components/layout/AppShell';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import {
  weekChartData,
  subjectRowsFromProgress,
  badgesFromProgress,
  accuracyPercent,
  activeDaysThisWeek,
} from '../services/userProgress';

const SUBJECT_META = {
  Mathematics: { icon: Calculator, color: 'blue', iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  Science: { icon: FlaskConical, color: 'green', iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
  English: { icon: BookOpen, color: 'indigo', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
  'Social Science': { icon: Globe, color: 'amber', iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  General: { icon: BookOpen, color: 'slate', iconColor: 'text-slate-500', iconBg: 'bg-slate-100' },
};

const BADGE_ICONS = [
  { icon: Star, iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  { icon: Flame, iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
  { icon: Trophy, iconColor: 'text-purple-500', iconBg: 'bg-purple-50' },
  { icon: Rocket, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  { icon: Target, iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
  { icon: Star, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
];

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const st = useStudentProgress(user);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  const role = user.role || 'student';
  const pageTitle =
    role === 'teacher'
      ? t('page_progress_teacher')
      : role === 'parent'
        ? t('page_progress_parent')
        : t('page_progress_student');

  const p = st.progress;
  const acc = accuracyPercent(p);
  const weeklyGoalDays = 7;
  const weeklyDone = activeDaysThisWeek(p);
  const weekBars = weekChartData(p);
  const subjectRows = subjectRowsFromProgress(p);
  const badgeList = badgesFromProgress(p).map((b, i) => ({
    ...b,
    ...(BADGE_ICONS[i] ?? BADGE_ICONS[0]),
  }));

  const subjectLabel = (name) => {
    const k = `pro_subj_${name.replace(/ /g, '_')}`;
    const s = t(k);
    return s !== k ? s : name;
  };

  const statCards = [
    {
      key: 'q',
      icon: BookOpen,
      label: t('prog_qLabel'),
      value: p.questionsSolved,
      unit: t('prog_qUnit'),
      color: 'text-brand-500',
      bg: 'bg-brand-50',
    },
    {
      key: 'streak',
      icon: Flame,
      label: t('prog_streakLabel'),
      value: p.streak,
      unit: t('prog_streakUnit'),
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      key: 'acc',
      icon: Target,
      label: t('prog_accLabel'),
      value: acc == null ? '—' : `${acc}%`,
      unit: acc == null ? t('prog_accNone') : t('prog_accUnit'),
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      key: 'week',
      icon: TrendingUp,
      label: t('prog_weekLabel'),
      value: weeklyDone,
      unit: t('prog_weekUnit', { n: weeklyGoalDays }),
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <AppShell title={pageTitle}>
      <div className="px-5 pt-5 space-y-5 pb-8">

        {/* ── Stat Cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(({ key: cardKey, icon: Icon, label, value, unit, color, bg }, i) => (
            <div
              key={cardKey}
              className="card animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`inline-flex h-10 w-10 rounded-xl ${bg} items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-900 text-2xl ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{unit}</p>
              <p className="text-slate-400 text-[11px] mt-0.5 uppercase tracking-wide font-600">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Activity Chart ──────────────────────────── */}
        <div className="card animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="font-display font-800 text-slate-700 text-base mb-4">{t('prog_chartTitle')}</p>

          <div className="flex items-end justify-between h-32 mb-4 pt-4 border-b border-slate-100 pb-2">
            {weekBars.map(({ dayIndex, count, heightPct, done }, i) => (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                <div
                  className={`w-6 sm:w-8 rounded-t-xl transition-all relative group ${done
                      ? 'bg-brand-500 hover:bg-brand-400 cursor-pointer shadow-glow'
                      : 'bg-slate-100'
                    }`}
                  style={{ height: `${heightPct}%`, minHeight: done ? 8 : 4 }}
                >
                  {done && count > 0 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-700 py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      {t('prog_actions', { n: count })}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-800 ${done ? 'text-brand-500' : 'text-slate-400'}`}>
                  {t(`prog_wd${dayIndex}`)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-600 text-slate-500">{t('prog_weeklyGoal')}</span>
              <span className="font-800 text-brand-600">
                {t('prog_daysActive', { done: weeklyDone, total: weeklyGoalDays })}
              </span>
            </div>
            <ProgressBar value={weeklyDone} max={weeklyGoalDays} color="green" />
          </div>
        </div>

        {/* ── Course Progress ─────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="font-display font-800 text-slate-700 text-base">{t('prog_courseTitle')}</p>
          </div>

          {subjectRows.length === 0 ? (
            <div className="card text-center py-8 text-slate-400 text-sm font-600">
              {t('prog_noSubject')}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {subjectRows.map(({ name, questions, pct }) => {
                const meta = SUBJECT_META[name] ?? SUBJECT_META.General;
                const Icon = meta.icon;
                return (
                  <div
                    key={name}
                    className="card p-4 hover:-translate-y-1 transition-all cursor-pointer border-b-4 border-slate-100 pb-3 active:border-b-0 active:translate-y-0"
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${meta.iconBg} mb-3 shadow-inner`}>
                      <Icon size={22} className={meta.iconColor} />
                    </div>
                    <h4 className="font-display font-900 text-slate-800 text-xs sm:text-sm leading-tight">
                      {subjectLabel(name)}
                    </h4>
                    <p className="text-[10px] font-800 text-slate-400 mt-1 mb-3 uppercase tracking-wider">
                      {t('prog_qShare', { q: questions, pct })}
                    </p>
                    <ProgressBar value={pct} max={100} color={meta.color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Badges ──────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-800 text-slate-700 text-base">{t('prog_badgesTitle')}</p>
            <Badge color="green">
              {t('prog_earned', { n: badgeList.filter(b => b.earned).length })}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {badgeList.map(({ icon: Icon, id, titleKey, descKey, earned, iconColor, iconBg }) => (
              <div
                key={id}
                className={`card flex items-center gap-4 py-4 transition-opacity ${!earned ? 'opacity-50' : ''}`}
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${earned ? `${iconBg} shadow-card` : 'bg-slate-100'
                  }`}>
                  <Icon size={22} className={earned ? iconColor : 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-800 text-slate-800 text-sm">{t(titleKey)}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{t(descKey)}</p>
                </div>
                {earned && (
                  <div className="h-6 w-6 bg-brand-500 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Motivational footer ─────────────────────── */}
        <div
          className="rounded-3xl p-6 text-center animate-fade-up"
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            animationDelay: '260ms',
          }}
        >
          <div className="mx-auto w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3">
            <TrendingUp size={24} className="text-white" />
          </div>
          <p className="font-display font-900 text-white text-lg">
            {role === 'student' && user.name?.split(' ')?.[0]
              ? t('prog_keepUpYou', { name: user.name.split(' ')[0] })
              : t('prog_keepUp')}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {role === 'parent'
              ? t('prog_footerParent')
              : role === 'teacher'
                ? t('prog_footerTeacher')
                : t('prog_footerStudent')}
          </p>
        </div>

      </div>
    </AppShell>
  );
}
