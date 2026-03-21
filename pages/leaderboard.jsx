import { Trophy, Crown, Medal, Award } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';

const LEADERBOARD_DATA = [
  { id: 1, name: 'Aarav S.',    class: '5', score: 2840, avatar: null },
  { id: 2, name: 'Priya K.',    class: '5', score: 2750, avatar: null },
  { id: 3, name: 'Rahul V.',    class: '5', score: 2610, avatar: null },
  { id: 4, name: 'Sneha M.',    class: '5', score: 2490, avatar: null },
  { id: 5, name: 'You',         class: '5', score: 2350, avatar: null, isUser: true },
  { id: 6, name: 'Vikram A.',   class: '5', score: 2100, avatar: null },
  { id: 7, name: 'Anjali D.',   class: '5', score: 1950, avatar: null },
];

export default function LeaderboardPage() {
  return (
    <AppShell title="Leaderboard">
      <div className="px-5 pt-6 pb-8 space-y-6">

        {/* ── Top 3 Podium ─────────────────────────────── */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 h-64 mb-6 pt-4 animate-fade-up">
          {/* Silver - 2nd */}
          <div className="flex flex-col items-center z-10 w-24">
            <div className="flex flex-col items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mb-1">
                <Medal size={18} className="text-slate-500" />
              </div>
              <Avatar name={LEADERBOARD_DATA[1].name} size="md" />
              <p className="font-800 text-xs mt-1 truncate w-20 text-center">{LEADERBOARD_DATA[1].name.split(' ')[0]}</p>
              <p className="text-[10px] font-900 text-slate-500">{LEADERBOARD_DATA[1].score} XP</p>
            </div>
            <div className="w-full bg-slate-200 h-28 rounded-t-2xl border-t-4 border-slate-300 flex justify-center pt-3 shadow-inner">
              <span className="font-display font-900 text-slate-400 text-2xl">2</span>
            </div>
          </div>

          {/* Gold - 1st */}
          <div className="flex flex-col items-center z-20 w-28 -mx-2">
            <div className="flex flex-col items-center mb-2 animate-bounce-sm" style={{ animationIterationCount: 'infinite', animationDuration: '3s' }}>
              <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center mb-1">
                <Crown size={20} className="text-amber-600" />
              </div>
              <Avatar name={LEADERBOARD_DATA[0].name} size="lg" />
              <p className="font-900 text-sm mt-1 truncate w-24 text-center">{LEADERBOARD_DATA[0].name.split(' ')[0]}</p>
              <p className="text-xs font-900 text-amber-500">{LEADERBOARD_DATA[0].score} XP</p>
            </div>
            <div className="w-full bg-amber-300 h-36 rounded-t-2xl border-t-4 border-amber-400 flex justify-center pt-3 shadow-inner shadow-amber-500/20">
              <span className="font-display font-900 text-amber-700 text-3xl">1</span>
            </div>
          </div>

          {/* Bronze - 3rd */}
          <div className="flex flex-col items-center z-10 w-24">
            <div className="flex flex-col items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center mb-1">
                <Award size={18} className="text-orange-600" />
              </div>
              <Avatar name={LEADERBOARD_DATA[2].name} size="md" />
              <p className="font-800 text-xs mt-1 truncate w-20 text-center">{LEADERBOARD_DATA[2].name.split(' ')[0]}</p>
              <p className="text-[10px] font-900 text-orange-500">{LEADERBOARD_DATA[2].score} XP</p>
            </div>
            <div className="w-full bg-orange-200 h-24 rounded-t-2xl border-t-4 border-orange-300 flex justify-center pt-3 shadow-inner">
              <span className="font-display font-900 text-orange-500 text-2xl">3</span>
            </div>
          </div>
        </div>

        {/* ── List ───────────────────────────────────────── */}
        <div className="card p-0 overflow-hidden animate-fade-up shadow-card" style={{ animationDelay: '100ms' }}>
          {LEADERBOARD_DATA.slice(3).map((user, i) => (
            <div 
              key={user.id} 
              className={`flex items-center gap-3 p-4 border-b border-slate-50 last:border-0 transition-colors ${user.isUser ? 'bg-brand-50' : 'bg-white hover:bg-slate-50'}`}
            >
              <span className={`font-display font-900 w-6 text-center text-lg ${user.isUser ? 'text-brand-500' : 'text-slate-400'}`}>
                {i + 4}
              </span>
              <Avatar name={user.name} size="sm" />
              <div className="flex-1">
                <p className={`font-display font-800 text-sm leading-tight ${user.isUser ? 'text-brand-800' : 'text-slate-800'}`}>
                  {user.name}
                </p>
                <p className="text-[10px] font-700 text-slate-400 uppercase tracking-widest mt-0.5">Class {user.class}</p>
              </div>
              <span className={`font-900 text-sm ${user.isUser ? 'text-brand-600' : 'text-slate-600'}`}>
                {user.score} XP
              </span>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  );
}
