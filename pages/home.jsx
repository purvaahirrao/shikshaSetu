// pages/home.jsx — Role-based gamified dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Camera, MessageCircle, TrendingUp, Zap, BookOpen, Star, Brain, Trophy, Target, Flame, ArrowRight, Users, BarChart3, FileText, ClipboardList, GraduationCap, Sparkles, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGameSystem, getLevel } from '../hooks/useGameSystem';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const game = useGameSystem();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const role = user.role || 'student';
  const firstName = user.name?.split(' ')[0] || 'Learner';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
              <span className="inline-block text-[10px] font-800 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md bg-brand-100 text-brand-600">Student</span>
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
                <p className="text-white font-display font-800 text-base">Ask Doubts</p>
                <p className="text-white/70 text-xs mt-1">Chat with AI tutor</p>
                <div className="mt-3 inline-flex items-center gap-1 text-white/80 text-xs font-700">
                  Open <ArrowRight size={12} />
                </div>
              </div>
            </button>

            <button onClick={() => router.push('/quiz?mode=daily')} className="text-left">
              <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-400 to-purple-600 shadow-card h-full active:scale-[.97] transition-transform">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Brain size={20} className="text-white" />
                </div>
                <p className="text-white font-display font-800 text-base">Daily Quiz</p>
                <p className="text-white/70 text-xs mt-1">3 Questions</p>
                <div className="mt-3 inline-flex items-center gap-1 text-white/80 text-xs font-700">
                  Start <ArrowRight size={12} />
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
                  <p className="text-white font-display font-900 text-xl">{game.xp} XP</p>
                  <p className="text-slate-400 text-xs font-600">Level {game.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-400 text-xs font-800">{game.xpForNextLevel - game.xp} XP</p>
                <p className="text-slate-500 text-[10px]">to next level</p>
              </div>
            </div>
            <div className="bg-slate-700 rounded-full h-2.5">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${game.xpProgress}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-slate-500 text-[10px]">Lvl {game.level}</span>
              <span className="text-slate-500 text-[10px]">Lvl {game.level + 1}</span>
            </div>
          </div>

          {/* Streak Card */}
          <div className="rounded-2xl p-5 overflow-hidden relative animate-fade-up" style={{ animationDelay: '160ms', background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-600">Keep it going!</p>
                <p className="text-white font-display font-900 text-2xl mt-0.5">{game.streak}-Day Streak</p>
                <p className="text-white/60 text-xs mt-1">Come back tomorrow to continue</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Flame size={32} className="text-white" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {[
              { label: 'Questions', value: game.questionsAnswered, icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
              { label: 'Quizzes', value: game.quizzesCompleted, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Streak', value: game.streak, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card text-center py-4">
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                  <Icon size={18} className={color} />
                </div>
                <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base">Explore</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/quiz', icon: Brain, title: 'Full Quiz', accent: 'from-purple-400 to-purple-600' },
                { href: '/scan', icon: Camera, title: 'Scan Question', accent: 'from-brand-400 to-brand-600' },
                { href: '/leaderboard', icon: Trophy, title: 'Leaderboard', accent: 'from-amber-400 to-amber-600' },
                { href: '/progress', icon: BarChart3, title: 'My Progress', accent: 'from-indigo-400 to-indigo-600' },
              ].map(({ href, icon: Icon, title, accent }) => (
                <button key={title} onClick={() => router.push(href)} className="text-left">
                  <div className="card active:scale-[.97] hover:-translate-y-0.5 transition-all duration-200 h-full">
                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${accent} mb-2`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <p className="font-display font-800 text-slate-800 text-sm">{title}</p>
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
    const dummyStudents = [
      { name: 'Aarav Sharma', score: 92, cls: '8', status: 'active' },
      { name: 'Priya Patel', score: 85, cls: '7', status: 'active' },
      { name: 'Rohan Gupta', score: 78, cls: '9', status: 'inactive' },
      { name: 'Sneha Verma', score: 95, cls: '8', status: 'active' },
      { name: 'Arjun Singh', score: 63, cls: '10', status: 'inactive' },
    ];

    return (
      <AppShell>
        <div className="px-5 pt-6 pb-4 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-up">
            <div>
              <p className="text-slate-400 text-sm font-500">{greeting},</p>
              <h2 className="font-display font-900 text-2xl text-slate-900 mt-0.5">{firstName}!</h2>
              <span className="inline-block text-[10px] font-800 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-600">Teacher</span>
            </div>
            <button onClick={() => router.push('/profile')} className="relative">
              <Avatar src={user.photo} name={user.name} size="lg" />
            </button>
          </div>

          {/* Overview Banner */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-indigo-700 animate-fade-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm font-600">Teacher Dashboard</p>
                <p className="text-white font-display font-900 text-xl mt-0.5">{user.subject || 'General'}</p>
                <p className="text-indigo-200 text-xs mt-1">{user.school || 'School'}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap size={32} className="text-white" />
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
            {[
              { label: 'Students', value: 34, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'Avg Score', value: '82%', icon: BarChart3, color: 'text-brand-500', bg: 'bg-brand-50' },
              { label: 'Active', value: 28, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card text-center py-4">
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                  <Icon size={18} className={color} />
                </div>
                <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Student List */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base">Students</h3>
            <div className="card p-0 overflow-hidden">
              {dummyStudents.map((s, i) => (
                <div key={i} className={`flex items-center justify-between p-4 ${i < dummyStudents.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-800 text-sm">{s.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-700 text-slate-800">{s.name}</p>
                      <p className="text-[11px] text-slate-400 font-500">Class {s.cls}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className={`text-sm font-800 ${s.score >= 80 ? 'text-brand-500' : s.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{s.score}%</span>
                    <span className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-brand-500' : 'bg-slate-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <button onClick={() => router.push('/teacher/create-quiz')} className="text-left">
              <div className="card active:scale-[.97] transition-all h-full">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 mb-2">
                  <ClipboardList size={20} className="text-white" />
                </div>
                <p className="font-display font-800 text-slate-800 text-sm">Create Quiz</p>
                <p className="text-slate-400 text-xs mt-0.5">Build assessments</p>
              </div>
            </button>
            <button onClick={() => router.push('/teacher/analytics')} className="text-left">
              <div className="card active:scale-[.97] transition-all h-full">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 mb-2">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <p className="font-display font-800 text-slate-800 text-sm">Analytics</p>
                <p className="text-slate-400 text-xs mt-0.5">View performance</p>
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
  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <p className="text-slate-400 text-sm font-500">{greeting},</p>
            <h2 className="font-display font-900 text-2xl text-slate-900 mt-0.5">{firstName}!</h2>
            <span className="inline-block text-[10px] font-800 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-600">Parent</span>
          </div>
          <button onClick={() => router.push('/profile')} className="relative">
            <Avatar src={user.photo} name={user.name} size="lg" />
          </button>
        </div>

        {/* Child Overview */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-amber-600 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-600">Your Child</p>
              <p className="text-white font-display font-900 text-xl mt-0.5">{user.childName || 'Child'}</p>
              <p className="text-amber-100 text-xs mt-1">Class {user.childClass || '?'} • {user.school || 'School'}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <p className="text-white font-display font-900 text-2xl">85</p>
                <p className="text-white/60 text-[10px]">Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          {[
            { label: 'Solved', value: 42, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Streak', value: 5, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Quizzes', value: 8, icon: ClipboardList, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card text-center py-4">
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Performance Overview */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Subject Performance</h3>
          <div className="card space-y-4">
            {[
              { subject: 'Mathematics', score: 88, color: 'bg-brand-500' },
              { subject: 'Science', score: 72, color: 'bg-indigo-500' },
              { subject: 'English', score: 91, color: 'bg-purple-500' },
            ].map(({ subject, score, color }) => (
              <div key={subject}>
                <div className="flex justify-between mb-1.5">
                  <p className="text-sm font-700 text-slate-700">{subject}</p>
                  <p className={`text-sm font-800 ${score >= 80 ? 'text-brand-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{score}%</p>
                </div>
                <div className="progress-track h-2">
                  <div className={`progress-fill ${color}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Alerts</h3>
          <div className="space-y-2">
            <div className="card flex items-start gap-3 border-l-4 border-amber-400">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-700 text-slate-800">Science needs attention</p>
                <p className="text-xs text-slate-500 mt-0.5">Score dropped below 75% this week</p>
              </div>
            </div>
            <div className="card flex items-start gap-3 border-l-4 border-rose-400">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Flame size={16} className="text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-700 text-slate-800">Streak at risk</p>
                <p className="text-xs text-slate-500 mt-0.5">No activity in the last 2 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
          <button onClick={() => router.push('/progress')} className="text-left">
            <div className="card active:scale-[.97] transition-all h-full">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 mb-2">
                <BarChart3 size={20} className="text-white" />
              </div>
              <p className="font-display font-800 text-slate-800 text-sm">Full Progress</p>
            </div>
          </button>
          <button onClick={() => router.push('/chat')} className="text-left">
            <div className="card active:scale-[.97] transition-all h-full">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 mb-2">
                <MessageCircle size={20} className="text-white" />
              </div>
              <p className="font-display font-800 text-slate-800 text-sm">Ask Teacher</p>
            </div>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
