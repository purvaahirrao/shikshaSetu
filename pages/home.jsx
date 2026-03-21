// pages/home.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Camera, MessageCircle, TrendingUp, Zap, BookOpen, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

// Mock streak / quick stats
const QUICK_STATS = [
  { label: 'Questions', value: 42, icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
  { label: 'Day Streak', value: 7, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Top Score', value: 98, icon: Star, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

const FEATURE_CARDS = [
  {
    href: '/scan',
    icon: '📷',
    title: 'Scan Question',
    desc: 'Photograph any textbook problem',
    accent: 'from-brand-400 to-brand-600',
    badge: 'Most Used',
    badgeColor: 'green',
    primary: true,
  },
  {
    href: '/chat',
    icon: '💬',
    title: 'Ask a Doubt',
    desc: 'Get instant answers & explanations',
    accent: 'from-blue-400 to-blue-600',
    badge: null,
    primary: false,
  },
  {
    href: '/progress',
    icon: '📊',
    title: 'My Progress',
    desc: 'Track subjects & streaks',
    accent: 'from-indigo-400 to-indigo-600',
    badge: null,
    primary: false,
  },
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

  const firstName = user.name?.split(' ')[0] || 'Learner';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 space-y-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <p className="text-slate-400 text-sm font-500">{greeting} 👋</p>
            <h2 className="font-display font-900 text-2xl text-slate-900 mt-0.5">
              {firstName}!
            </h2>
          </div>
          <button onClick={() => router.push('/profile')} className="relative">
            <Avatar src={user.photo} name={user.name} size="lg" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-brand-500 border-2 border-white rounded-full" />
          </button>
        </div>

        {/* ── Streak banner ───────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden p-5 animate-fade-up"
          style={{ animationDelay: '60ms', background: 'linear-gradient(135deg,#16a34a,#15803d)' }}
        >
          {/* BG pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-brand-100 text-sm font-600">Keep it going! 🔥</p>
              <p className="text-white font-display font-900 text-2xl mt-0.5">7-Day Streak</p>
              <p className="text-brand-200 text-xs mt-1">You're on fire! Come back tomorrow.</p>
            </div>
            <div className="text-5xl">🔥</div>
          </div>
          {/* Thin progress bar */}
          <div className="relative mt-4 bg-brand-700/50 rounded-full h-1.5">
            <div className="h-full bg-white rounded-full" style={{ width: '70%' }} />
          </div>
          <p className="relative text-brand-200 text-xs mt-1.5">7 / 10 days to next badge</p>
        </div>

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
            What do you want to do?
          </h3>

          {/* Primary large card */}
          <button
            onClick={() => router.push(FEATURE_CARDS[0].href)}
            className="w-full text-left animate-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className={`relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br ${FEATURE_CARDS[0].accent} shadow-glow active:scale-[.98] transition-transform`}>
              <div className="absolute -right-4 -top-4 text-7xl opacity-20 rotate-12 select-none">📷</div>
              <div className="relative">
                <Badge color="green" className="bg-white/20 text-white mb-3">⭐ {FEATURE_CARDS[0].badge}</Badge>
                <p className="text-white font-display font-900 text-xl">{FEATURE_CARDS[0].title}</p>
                <p className="text-white/80 text-sm mt-1">{FEATURE_CARDS[0].desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-700 px-4 py-2 rounded-xl">
                  Let's go <span>→</span>
                </div>
              </div>
            </div>
          </button>

          {/* Secondary cards grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURE_CARDS.slice(1).map(({ href, icon, title, desc, accent }, i) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="text-left animate-fade-up"
                style={{ animationDelay: `${240 + i * 60}ms` }}
              >
                <div className={`card h-full active:scale-[.97] transition-transform`}>
                  <div className={`inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br ${accent} text-2xl mb-3`}>
                    {icon}
                  </div>
                  <p className="font-display font-800 text-slate-800 text-base">{title}</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent activity ─────────────────────────────── */}
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

      </div>
    </AppShell>
  );
}
