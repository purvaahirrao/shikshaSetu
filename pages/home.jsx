// pages/home.jsx — Role-based gamified dashboard
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Camera, MessageCircle, BookOpen, Brain, Trophy, Flame, ArrowRight, Users, BarChart3, ClipboardList, GraduationCap, Sparkles, AlertTriangle, CheckCircle2, Target, TrendingUp, Zap, Star, Award, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { useStudentProgress } from '../hooks/useStudentProgress';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import {
  getTeacherStudentSummaries,
  teacherOverviewStats,
  findLinkedStudentForParent,
  progressSnapshotForUserRecord,
  weakSubjectsFromProgress,
} from '../services/rosterProgress';
import { accuracyPercent, subjectRowsFromProgress } from '../services/userProgress';
import { translateSubjectDisplayName } from '../services/subjectI18n';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const st = useStudentProgress(user);
  const [tData, setTData] = useState({
    summaries: [],
    overview: { totalStudents: 0, avgScorePct: null, active: 0 },
  });
  const [pData, setPData] = useState({ linked: null, progress: null });

  const refreshRoster = useCallback(() => {
    if (typeof window === 'undefined') return;
    const summaries = getTeacherStudentSummaries();
    setTData({ summaries, overview: teacherOverviewStats(summaries) });
    if (user?.role === 'parent') {
      const linked = findLinkedStudentForParent(user);
      setPData({
        linked,
        progress: linked ? progressSnapshotForUserRecord(linked) : null,
      });
    } else {
      setPData({ linked: null, progress: null });
    }
  }, [user]);

  useEffect(() => {
    refreshRoster();
  }, [refreshRoster]);

  useEffect(() => {
    window.addEventListener('focus', refreshRoster);
    window.addEventListener('storage', refreshRoster);
    return () => {
      window.removeEventListener('focus', refreshRoster);
      window.removeEventListener('storage', refreshRoster);
    };
  }, [refreshRoster]);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const role = user.role || 'student';
  const firstName = user.name?.split(' ')[0] || 'Learner';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('greet_morning') : hour < 17 ? t('greet_afternoon') : t('greet_evening');

  // ════════════════════════════════════════════════
  // STUDENT DASHBOARD
  // ════════════════════════════════════════════════
  if (role === 'student') {
    return (
      <AppShell>
        <div className="px-5 pt-6 pb-4 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-up">
            <div>
              <p className="text-slate-400 text-sm font-500">{greeting},</p>
              <h2 className="font-display font-900 text-2xl text-slate-900 mt-0.5">{firstName}!</h2>
              <span className="inline-block text-[10px] font-800 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md bg-brand-100 text-brand-600">{t('home_roleStudent')}</span>
            </div>
            <button onClick={() => router.push('/profile')} className="relative">
              <Avatar src={user.photo} name={user.name} size="lg" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-brand-500 border-2 border-white rounded-full" />
            </button>
          </div>

          {/* Chatbot + Daily Quiz Row */}
          <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
            <button onClick={() => router.push('/chat')} className="text-left">
              <div className="rounded-2xl p-4 bg-gradient-to-br from-brand-400 to-brand-600 shadow-card h-full active:scale-[.97] transition-transform">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <p className="text-white font-display font-800 text-base">{t('home_askDoubts')}</p>
                <p className="text-white/70 text-xs mt-1">{t('home_askDoubtsSub')}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-white/80 text-xs font-700">
                  {t('home_open')} <ArrowRight size={12} />
                </div>
              </div>
            </button>

            <button onClick={() => router.push('/quiz?mode=daily')} className="text-left">
              <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-400 to-purple-600 shadow-card h-full active:scale-[.97] transition-transform">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Brain size={20} className="text-white" />
                </div>
                <p className="text-white font-display font-800 text-base">{t('home_dailyQuiz')}</p>
                <p className="text-white/70 text-xs mt-1">{t('home_dailyQuizSub')}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-white/80 text-xs font-700">
                  {t('home_start')} <ArrowRight size={12} />
                </div>
              </div>
            </button>
          </div>

          {/* XP Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-400/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={22} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-display font-900 text-xl">{st.xp} XP</p>
                  <p className="text-slate-400 text-xs font-600">{t('home_level')} {st.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-400 text-xs font-800">{st.xpForNextLevel - st.xp} XP</p>
                <p className="text-slate-500 text-[10px]">{t('home_xpToNext')}</p>
              </div>
            </div>
            <div className="bg-slate-700 rounded-full h-2.5">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${st.xpProgress}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-slate-500 text-[10px]">{t('home_level')} {st.level}</span>
              <span className="text-slate-500 text-[10px]">{t('home_level')} {st.level + 1}</span>
            </div>
          </div>

          {/* Streak Card */}
          <div className="rounded-2xl p-5 overflow-hidden relative animate-fade-up" style={{ animationDelay: '160ms', background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-600">{t('home_keepGoing')}</p>
                <p className="text-white font-display font-900 text-2xl mt-0.5">
                  {st.streak}
                  {t('home_dayStreak')}
                </p>
                <p className="text-white/60 text-xs mt-1">{t('home_streakSub')}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Flame size={32} className="text-white" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {[
              { labelKey: 'home_statQuestions', value: st.questionsSolved, icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
              { labelKey: 'home_statQuizzes', value: st.quizSessions, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-50' },
              { labelKey: 'home_statStreak', value: st.streak, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(({ labelKey, value, icon: Icon, color, bg }) => (
              <div key={labelKey} className="card text-center py-4">
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                  <Icon size={18} className={color} />
                </div>
                <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t(labelKey)}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base">{t('home_explore')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/quiz', icon: Brain, titleKey: 'home_tileQuiz', accent: 'from-purple-400 to-purple-600' },
                { href: '/scan', icon: Camera, titleKey: 'home_tileScan', accent: 'from-brand-400 to-brand-600' },
                { href: '/leaderboard', icon: Trophy, titleKey: 'home_tileLeader', accent: 'from-amber-400 to-amber-600' },
                { href: '/progress', icon: BarChart3, titleKey: 'home_tileProgress', accent: 'from-indigo-400 to-indigo-600' },
              ].map(({ href, icon: Icon, titleKey, accent }) => (
                <button key={titleKey} onClick={() => router.push(href)} className="text-left">
                  <div className="card active:scale-[.97] hover:-translate-y-0.5 transition-all duration-200 h-full">
                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${accent} mb-2`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <p className="font-display font-800 text-slate-800 text-sm">{t(titleKey)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ════════════════════════════════════════════════
  // TEACHER DASHBOARD
  // ════════════════════════════════════════════════
  if (role === 'teacher') {
    const { summaries, overview } = tData;
    const topStudents = [...summaries].sort((a, b) => b.xp - a.xp).slice(0, 5);
    const avgLabel = overview.avgScorePct != null ? `${overview.avgScorePct}%` : '—';

    return (
      <AppShell>
        <div className="px-5 pt-6 pb-4 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-up">
            <div>
              <p className="text-slate-400 text-sm font-500">{greeting},</p>
              <h2 className="font-display font-900 text-2xl text-slate-900 mt-0.5">{firstName}!</h2>
              <span className="inline-block text-[10px] font-800 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-600">{t('home_roleTeacher')}</span>
            </div>
            <button onClick={() => router.push('/profile')} className="relative">
              <Avatar src={user.photo} name={user.name} size="lg" />
            </button>
          </div>

          {/* Overview Banner */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-indigo-700 animate-fade-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm font-600">{t('home_teacherDash')}</p>
                <p className="text-white font-display font-900 text-xl mt-0.5">
                  {translateSubjectDisplayName(user.subject || 'General', t)}
                </p>
                <p className="text-indigo-200 text-xs mt-1">{user.school || t('home_school')}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap size={32} className="text-white" />
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
            {[
              { labelKey: 'home_statStudents', value: overview.totalStudents, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { labelKey: 'home_statAvgQuiz', value: avgLabel, icon: BarChart3, color: 'text-brand-500', bg: 'bg-brand-50' },
              { labelKey: 'home_statActive', value: overview.active, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map(({ labelKey, value, icon: Icon, color, bg }) => (
              <div key={labelKey} className="card text-center py-4">
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                  <Icon size={18} className={color} />
                </div>
                <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t(labelKey)}</p>
              </div>
            ))}
          </div>

          {/* Student List */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base">{t('home_studentsHeading')}</h3>
            {topStudents.length === 0 && (
              <p className="text-sm text-slate-500">{t('home_noStudentsDevice')}</p>
            )}
            <div className="card p-0 overflow-hidden">
              {topStudents.map((s, i) => {
                const pct = s.scorePct;
                const label = pct != null ? `${pct}%` : s.xp > 0 ? `${s.xp} XP` : '—';
                const tone =
                  pct != null
                    ? pct >= 80
                      ? 'text-brand-500'
                      : pct >= 60
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    : s.xp > 0
                      ? 'text-indigo-500'
                      : 'text-slate-400';
                const active = s.streak > 0;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => router.push(`/teacher/student/${encodeURIComponent(s.id)}`)}
                    className={`w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 ${i < topStudents.length - 1 ? 'border-b border-slate-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-800 text-sm">{(s.name || '?').charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-700 text-slate-800">{s.name}</p>
                        <p className="text-[11px] text-slate-400 font-500">
                          {t('home_class')} {s.cls}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`text-sm font-800 ${tone}`}>{label}</span>
                      <span className={`w-2 h-2 rounded-full ${active ? 'bg-brand-500' : 'bg-slate-300'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <button onClick={() => router.push('/teacher/create-quiz')} className="text-left">
              <div className="card active:scale-[.97] transition-all h-full">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 mb-2">
                  <ClipboardList size={20} className="text-white" />
                </div>
                <p className="font-display font-800 text-slate-800 text-sm">{t('home_createQuiz')}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t('home_createQuizSub')}</p>
              </div>
            </button>
            <button onClick={() => router.push('/teacher/analytics')} className="text-left">
              <div className="card active:scale-[.97] transition-all h-full">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 mb-2">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <p className="font-display font-800 text-slate-800 text-sm">{t('home_analytics')}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t('home_analyticsSub')}</p>
              </div>
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ════════════════════════════════════════════════
  // PARENT DASHBOARD
  // ════════════════════════════════════════════════
  const { linked: pLinked, progress: cp } = pData;
  const parentAcc = cp ? accuracyPercent(cp) : null;
  const parentSubjects = cp
    ? subjectRowsFromProgress(cp).filter((r) => ['Mathematics', 'Science', 'English'].includes(r.name))
    : [];
  const weakP = cp ? weakSubjectsFromProgress(cp) : [];
  const bannerScore = parentAcc != null ? String(parentAcc) : cp && cp.xp > 0 ? String(Math.round(cp.xp)) : '—';
  const bannerUnit =
    parentAcc != null ? t('home_quizAvg') : cp && cp.xp > 0 ? t('home_xpShort') : t('home_score');

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <p className="text-slate-400 text-sm font-500">{greeting},</p>
            <h2 className="font-display font-900 text-2xl text-slate-900 mt-0.5">{firstName}!</h2>
            <span className="inline-block text-[10px] font-800 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-600">{t('home_roleParent')}</span>
          </div>
          <button onClick={() => router.push('/profile')} className="relative">
            <Avatar src={user.photo} name={user.name} size="lg" />
          </button>
        </div>

        {/* Child Overview */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-amber-600 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-600">{t('home_yourChild')}</p>
              <p className="text-white font-display font-900 text-xl mt-0.5">{user.childName || t('home_child')}</p>
              <p className="text-amber-100 text-xs mt-1">
                {t('home_class')} {user.childClass || '?'} • {user.school || t('home_school')}
              </p>
              {!pLinked && (
                <p className="text-amber-100/90 text-[11px] mt-2 leading-snug">{t('home_linkHint')}</p>
              )}
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <p className="text-white font-display font-900 text-2xl">{bannerScore}</p>
                <p className="text-white/60 text-[10px]">{bannerUnit}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          {[
            {
              labelKey: 'home_solved',
              value: cp?.questionsSolved ?? 0,
              icon: BookOpen,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            { labelKey: 'home_statStreak', value: cp?.streak ?? 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
            {
              labelKey: 'home_statQuizzes',
              value: cp?.quizSessions ?? 0,
              icon: ClipboardList,
              color: 'text-indigo-500',
              bg: 'bg-indigo-50',
            },
          ].map(({ labelKey, value, icon: Icon, color, bg }) => (
            <div key={labelKey} className="card text-center py-4">
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{t(labelKey)}</p>
            </div>
          ))}
        </div>

        {/* Performance Overview */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">{t('home_subjectPerf')}</h3>
          <div className="card space-y-4">
            {!cp || parentSubjects.length === 0 ? (
              <p className="text-sm text-slate-400">{t('home_noSubjectYet')}</p>
            ) : (
              parentSubjects.map((row) => {
                const color =
                  row.name === 'Mathematics' ? 'bg-brand-500' : row.name === 'Science' ? 'bg-indigo-500' : 'bg-purple-500';
                return (
                  <div key={row.name}>
                    <div className="flex justify-between mb-1.5">
                      <p className="text-sm font-700 text-slate-700">{row.name}</p>
                      <p
                        className={`text-sm font-800 ${row.pct >= 30 ? 'text-brand-500' : row.pct >= 15 ? 'text-amber-500' : 'text-slate-400'
                          }`}
                      >
                        {row.pct}% {t('home_shareQ', { q: row.questions })}
                      </p>
                    </div>
                    <div className="progress-track h-2">
                      <div className={`progress-fill ${color}`} style={{ width: `${Math.min(100, row.pct)}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">{t('home_alerts')}</h3>
          <div className="space-y-2">
            {!pLinked && (
              <div className="card flex items-start gap-3 border-l-4 border-amber-400">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-700 text-slate-800">{t('home_linkChildTitle')}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t('home_linkChildBody')}</p>
                </div>
              </div>
            )}
            {pLinked && weakP.length > 0 && (
              <div className="card flex items-start gap-3 border-l-4 border-amber-400">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-700 text-slate-800">{t('home_extraPractice')}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('home_fewerIn')} {weakP.join(', ')}
                  </p>
                </div>
              </div>
            )}
            {pLinked && cp && (cp.questionsSolved > 0 || cp.quizSessions > 0) && cp.streak === 0 && (
              <div className="card flex items-start gap-3 border-l-4 border-rose-400">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Flame size={16} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-700 text-slate-800">{t('home_streakReset')}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t('home_streakResetBody')}</p>
                </div>
              </div>
            )}
            {pLinked &&
              weakP.length === 0 &&
              !(cp && cp.streak === 0 && (cp.questionsSolved > 0 || cp.quizSessions > 0)) && (
                <p className="text-sm text-slate-400 py-2">{t('home_noAlerts')}</p>
              )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
          <button onClick={() => router.push('/progress')} className="text-left">
            <div className="card active:scale-[.97] transition-all h-full">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 mb-2">
                <BarChart3 size={20} className="text-white" />
              </div>
              <p className="font-display font-800 text-slate-800 text-sm">{t('home_fullProgress')}</p>
            </div>
          </button>
          <button onClick={() => router.push('/chat')} className="text-left">
            <div className="card active:scale-[.97] transition-all h-full">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 mb-2">
                <MessageCircle size={20} className="text-white" />
              </div>
              <p className="font-display font-800 text-slate-800 text-sm">{t('home_askTeacher')}</p>
            </div>
          </button>
        </div>
      </div>
    </AppShell>
  );
}