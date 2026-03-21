// components/layout/BottomNav.jsx — Role-aware navigation
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { Home, Camera, Brain, Trophy, User, Users, BookOpen, BarChart3, FileText, Bell, LayoutDashboard, Plus } from 'lucide-react';

const STUDENT_NAV = [
  { href: '/home',        icon: Home,    label: 'Home'     },
  { href: '/quiz',        icon: Brain,   label: 'Quiz'     },
  { href: '/scan',        icon: Camera,  label: 'Scan'     },
  { href: '/leaderboard', icon: Trophy,  label: 'Rank'     },
  { href: '/profile',     icon: User,    label: 'Profile'  },
];

const TEACHER_NAV = [
  { href: '/home',                  icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/students',      icon: Users,           label: 'Students'  },
  { href: '/teacher/create-quiz',   icon: Plus,            label: 'Create'    },
  { href: '/teacher/analytics',     icon: BarChart3,       label: 'Analytics' },
  { href: '/profile',               icon: User,            label: 'Profile'   },
];

const PARENT_NAV = [
  { href: '/home',             icon: Home,      label: 'Home'     },
  { href: '/progress',         icon: BarChart3, label: 'Progress' },
  { href: '/parent/reports',   icon: FileText,  label: 'Reports'  },
  { href: '/chat',             icon: Bell,      label: 'Alerts'   },
  { href: '/profile',          icon: User,      label: 'Profile'  },
];

function getNavForRole(role) {
  if (role === 'teacher') return TEACHER_NAV;
  if (role === 'parent')  return PARENT_NAV;
  return STUDENT_NAV;
}

function getActiveColor(role) {
  if (role === 'teacher') return { text: 'text-indigo-500', bg: 'bg-indigo-50' };
  if (role === 'parent')  return { text: 'text-amber-600', bg: 'bg-amber-50' };
  return { text: 'text-brand-500', bg: 'bg-brand-50' };
}

export default function BottomNav() {
  const router = useRouter();
  const { user } = useAuth();
  const current = router.pathname;
  const role = user?.role || 'student';
  const NAV = getNavForRole(role);
  const colors = getActiveColor(role);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe">
      <div className="max-w-md mx-auto flex items-stretch">
        {NAV.map(({ href, icon: Icon, label }) => {
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
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
