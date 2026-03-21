// components/layout/BottomNav.jsx
import { useRouter } from 'next/router';
import { Home, Camera, Brain, Trophy, User } from 'lucide-react';

const NAV = [
  { href: '/home',        icon: Home,       label: 'Home'     },
  { href: '/quiz',        icon: Brain,      label: 'Quiz'     },
  { href: '/scan',        icon: Camera,     label: 'Scan'     },
  { href: '/leaderboard', icon: Trophy,     label: 'Rank'     },
  { href: '/profile',     icon: User,       label: 'Profile'  },
];

export default function BottomNav() {
  const router = useRouter();
  const current = router.pathname;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe">
      <div className="max-w-md mx-auto flex items-stretch">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = current === href || (href === '/scan' && current === '/result');
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`nav-item flex-1 ${active ? 'active' : ''}`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-brand-50' : ''}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-600 tracking-wide ${active ? 'text-brand-500' : 'text-slate-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
