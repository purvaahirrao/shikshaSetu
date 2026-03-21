// components/layout/BottomNav.jsx — Role-aware navigation
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { Home, Camera, Brain, Trophy, User, Users, BookOpen, BarChart3, FileText, Bell, LayoutDashboard, Plus } from 'lucide-react';

const STUDENT_NAV = [
  { href: '/home', icon: Home, tkey: 'nav_home' },
  { href: '/quiz', icon: Brain, tkey: 'nav_quiz' },
  { href: '/scan', icon: Camera, tkey: 'nav_scan' },
  { href: '/leaderboard', icon: Trophy, tkey: 'nav_rank' },
  { href: '/profile', icon: User, tkey: 'nav_profile' },
];

const TEACHER_NAV = [
  { href: '/home', icon: LayoutDashboard, tkey: 'nav_dashboard' },
  { href: '/teacher/students', icon: Users, tkey: 'nav_students' },
  { href: '/teacher/create-quiz', icon: Plus, tkey: 'nav_create' },
  { href: '/teacher/analytics', icon: BarChart3, tkey: 'nav_analytics' },
  { href: '/profile', icon: User, tkey: 'nav_profile' },
];

const PARENT_NAV = [
  { href: '/home', icon: Home, tkey: 'nav_home' },
  { href: '/progress', icon: BarChart3, tkey: 'nav_progress' },
  { href: '/parent/reports', icon: FileText, tkey: 'nav_reports' },
  { href: '/chat', icon: Bell, tkey: 'nav_alerts' },
  { href: '/profile', icon: User, tkey: 'nav_profile' },
];

function getNavForRole(role) {
  if (role === 'teacher') return TEACHER_NAV;
  if (role === 'parent') return PARENT_NAV;
  return STUDENT_NAV;
}

function getActiveColor(role) {
  if (role === 'teacher') return { text: 'text-indigo-500', bg: 'bg-indigo-50' };
  if (role === 'parent') return { text: 'text-amber-600', bg: 'bg-amber-50' };
  return { text: 'text-brand-500', bg: 'bg-brand-50' };
}

export default function BottomNav() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const current = router.pathname;
  const role = user?.role || 'student';
  const NAV = getNavForRole(role);
  const colors = getActiveColor(role);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe">
      <div className="max-w-md mx-auto flex items-stretch">
        {NAV.map(({ href, icon: Icon, tkey }) => {
          const active = current === href || current.startsWith(href + '/') || (href === '/scan' && current === '/result');
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`nav-item flex-1 ${active ? 'active' : ''}`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${active ? colors.bg : ''}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className={active ? colors.text : ''} />
              </div>
              <span className={`text-[10px] font-600 tracking-wide ${active ? colors.text : 'text-slate-400'}`}>
                {t(tkey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
