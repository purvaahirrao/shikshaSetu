// pages/home.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Camera, MessageCircle, TrendingUp, Zap, BookOpen, Star, Brain, Trophy, Target, Flame, ArrowRight, Users, BarChart3, FileText, ClipboardList, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

// Mock streak / quick stats
const STUDENT_STATS = [
  { label: 'Questions', value: 42, icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
  { label: 'Day Streak', value: 7, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Top Score', value: 98, icon: Star, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

const TEACHER_STATS = [
  { label: 'Students', value: 34, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { label: 'Quizzes', value: 12, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Avg Score', value: '78%', icon: BarChart3, color: 'text-brand-500', bg: 'bg-brand-50' },
];

const PARENT_STATS = [
  { label: 'Child Score', value: 85, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Streak', value: 5, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Quizzes', value: 18, icon: ClipboardList, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

const STUDENT_CARDS = [
  { href: '/quiz',            icon: Brain,   title: 'Quiz Mode',       desc: 'Test your knowledge & earn XP',   accent: 'from-purple-400 to-purple-600', badge: 'Popular', primary: true },
  { href: '/scan',            icon: Camera,  title: 'Scan Question',   desc: 'Photograph any textbook problem', accent: 'from-brand-400 to-brand-600', badge: null },
  { href: '/leaderboard',     icon: Trophy,  title: 'Leaderboard',     desc: 'See top ranking students',        accent: 'from-amber-400 to-amber-600', badge: null },
  { href: '/quiz?mode=daily', icon: Target,  title: 'Daily Challenge', desc: "Solve today's 3 questions",       accent: 'from-rose-400 to-rose-600',   badge: 'New' },
];

const TEACHER_CARDS = [
  { href: '/progress',      icon: BarChart3,     title: 'Class Overview',   desc: 'View student performance',       accent: 'from-indigo-400 to-indigo-600', badge: null, primary: true },
  { href: '/quiz',          icon: ClipboardList, title: 'Quiz Builder',     desc: 'Create & assign quizzes',        accent: 'from-purple-400 to-purple-600', badge: null },
  { href: '/leaderboard',   icon: Trophy,        title: 'Leaderboard',      desc: 'Top performing students',        accent: 'from-amber-400 to-amber-600',  badge: null },
  { href: '/chat',          icon: MessageCircle, title: 'Student Doubts',   desc: 'Answer student questions',       accent: 'from-brand-400 to-brand-600',  badge: null },
];

const PARENT_CARDS = [
  { href: '/progress',      icon: BarChart3,     title: 'Child Progress',   desc: "See your child's learning stats", accent: 'from-amber-400 to-amber-600', badge: null, primary: true },
  { href: '/leaderboard',   icon: Trophy,        title: 'Class Ranking',    desc: 'How your child compares',         accent: 'from-indigo-400 to-indigo-600', badge: null },
  { href: '/quiz',          icon: Brain,         title: 'Practice Quiz',    desc: 'Help your child practice',        accent: 'from-purple-400 to-purple-600', badge: null },
  { href: '/chat',          icon: MessageCircle, title: 'Ask Teacher',      desc: 'Get help from AI teacher',       accent: 'from-brand-400 to-brand-600',  badge: null },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const role = user.role || 'student';
  const firstName = user.name?.split(' ')[0] || 'Learner';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const QUICK_STATS   = role === 'teacher' ? TEACHER_STATS : role === 'parent' ? PARENT_STATS : STUDENT_STATS;
  const FEATURE_CARDS = role === 'teacher' ? TEACHER_CARDS : role === 'parent' ? PARENT_CARDS : STUDENT_CARDS;

  const roleLabel = role === 'teacher' ? 'Teacher' : role === 'parent' ? 'Parent' : 'Student';

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 space-y-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <p className="text-slate-400 text-sm font-500">{greeting},</p>
            <h2 className="font-display font-900 text-2xl text-slate-900 mt-0.5">
              {firstName}!
            </h2>
            <span className={`inline-block text-[10px] font-800 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md ${
              role === 'teacher' ? 'bg-indigo-100 text-indigo-600' : role === 'parent' ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'
            }`}>
              {roleLabel}
            </span>
          </div>
          <button onClick={() => router.push('/profile')} className="relative">
            <Avatar src={user.photo} name={user.name} size="lg" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-brand-500 border-2 border-white rounded-full" />
          </button>
        </div>

        {/* ── Streak banner (Student/Parent only) ─────────── */}
        {role !== 'teacher' && (
          <div
            className="relative rounded-3xl overflow-hidden p-5 animate-fade-up"
            style={{ animationDelay: '60ms', background: role === 'parent' ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#16a34a,#15803d)' }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-600">{role === 'parent' ? "Your child's streak" : 'Keep it going!'}</p>
                <p className="text-white font-display font-900 text-2xl mt-0.5">{role === 'parent' ? '5-Day Streak' : '7-Day Streak'}</p>
                <p className="text-white/60 text-xs mt-1">{role === 'parent' ? 'Encourage them to keep going!' : "You're doing great! Come back tomorrow."}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Flame size={32} className="text-white" />
              </div>
            </div>
            <div className="relative mt-4 bg-white/20 rounded-full h-1.5">
              <div className="h-full bg-white rounded-full" style={{ width: role === 'parent' ? '50%' : '70%' }} />
            </div>
            <p className="relative text-white/60 text-xs mt-1.5">{role === 'parent' ? '5 / 10 days' : '7 / 10 days to next badge'}</p>
          </div>
        )}

        {/* ── Teacher welcome card ────────────────────────── */}
        {role === 'teacher' && (
          <div className="relative rounded-3xl overflow-hidden p-5 animate-fade-up bg-gradient-to-br from-indigo-500 to-indigo-700" style={{ animationDelay: '60ms' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm font-600">Teacher Dashboard</p>
                <p className="text-white font-display font-900 text-xl mt-0.5">34 Active Students</p>
                <p className="text-indigo-200 text-xs mt-1">Monitor performance & create quizzes</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap size={32} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* ── Quick stats ─────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          {QUICK_STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card text-center py-4">
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Feature cards ───────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="font-display font-800 text-slate-700 text-base animate-fade-up" style={{ animationDelay: '160ms' }}>
            {role === 'teacher' ? 'Teaching Tools' : role === 'parent' ? "Your Child's Learning" : 'What do you want to do?'}
          </h3>

          {/* Primary large card */}
          <button
            onClick={() => router.push(FEATURE_CARDS[0].href)}
            className="w-full text-left animate-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className={`relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br ${FEATURE_CARDS[0].accent} shadow-card-hover active:scale-[.98] transition-transform hover:-translate-y-0.5`}>
              <div className="absolute -right-4 -top-4 opacity-15 select-none">
                {(() => { const I = FEATURE_CARDS[0].icon; return <I size={80} className="text-white rotate-12" />; })()}
              </div>
              <div className="relative">
                {FEATURE_CARDS[0].badge && (
                  <Badge className="bg-white/20 text-white mb-3 border-0">
                    <Star size={12} className="mr-1" /> {FEATURE_CARDS[0].badge}
                  </Badge>
                )}
                <p className="text-white font-display font-900 text-xl mt-1">{FEATURE_CARDS[0].title}</p>
                <p className="text-white/80 text-sm mt-1">{FEATURE_CARDS[0].desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-700 px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                  Open <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </button>

          {/* Secondary cards grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURE_CARDS.slice(1).map(({ href, icon: Icon, title, desc, accent, badge }, i) => (
              <button
                key={title}
                onClick={() => router.push(href)}
                className="text-left animate-fade-up"
                style={{ animationDelay: `${240 + i * 60}ms` }}
              >
                <div className="card h-full active:scale-[.97] hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br ${accent} mb-2.5`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  {badge && (
                    <div className="mb-1 text-[10px] font-800 tracking-wider text-brand-600 uppercase bg-brand-50 inline-block px-1.5 py-0.5 rounded">
                      {badge}
                    </div>
                  )}
                  <p className="font-display font-800 text-slate-800 text-base leading-tight mt-1">{title}</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent activity (student only) ─────────────── */}
        {role === 'student' && (
          <div className="animate-fade-up" style={{ animationDelay: '360ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base mb-3">Recent Activity</h3>
            <div className="card">
              {[
                { subject: 'Mathematics', q: 'What is photosynthesis?', time: '2h ago', color: 'green' },
                { subject: 'Science', q: 'Solve 3x + 5 = 14', time: '1d ago', color: 'blue' },
                { subject: 'English', q: 'Explain the water cycle', time: '2d ago', color: 'indigo' },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-3 ${i < 2 ? 'pb-3 mb-3 border-b border-slate-50' : ''}`}>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0
                    ${item.color === 'green' ? 'bg-brand-100' :
                      item.color === 'blue' ? 'bg-blue-100' : 'bg-indigo-100'}`}>
                    <BookOpen size={15} className={
                      item.color === 'green' ? 'text-brand-600' :
                        item.color === 'blue' ? 'text-blue-600' : 'text-indigo-600'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-600 text-slate-400">{item.subject}</p>
                    <p className="text-sm text-slate-700 font-500 truncate">{item.q}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
