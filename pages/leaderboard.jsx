// pages/leaderboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Crown, Medal, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { buildLeaderboardRows } from '../services/rosterProgress';

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState([]);

  const refresh = useCallback(() => {
    setRows(buildLeaderboardRows(user));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    const onRoute = () => refresh();
    router.events?.on?.('routeChangeComplete', onRoute);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      router.events?.off?.('routeChangeComplete', onRoute);
    };
  }, [refresh, router.events]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <AppShell title="Leaderboard">
      <div className="px-5 pt-6 pb-8 space-y-6">

        {/* ── Empty state ──────────────────────────────── */}
        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Crown size={32} className="text-amber-400" />
            </div>
            <p className="font-display font-800 text-slate-700 text-lg mb-1">No rankings yet</p>
            <p className="text-slate-400 text-sm max-w-xs">
              Register as a student and start practising — your XP will appear here.
            </p>
          </div>
        )}

        {/* ── Podium (needs ≥ 3 players) ───────────────── */}
        {rows.length >= 3 && (
          <div className="flex items-end justify-center gap-2 sm:gap-4 h-64 mb-6 pt-4 animate-fade-up">

            {/* Silver — 2nd */}
            <div className="flex flex-col items-center z-10 w-24">
              <div className="flex flex-col items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mb-1">
                  <Medal size={18} className="text-slate-500" />
                </div>
                <Avatar name={podium[1].name} size="md" src={podium[1].avatar} />
                <p className="font-800 text-xs mt-1 truncate w-20 text-center">{podium[1].name.split(' ')[0]}</p>
                <p className="text-[10px] font-900 text-slate-500">{podium[1].score} XP</p>
              </div>
              <div className="w-full bg-slate-200 h-28 rounded-t-2xl border-t-4 border-slate-300 flex justify-center pt-3 shadow-inner">
                <span className="font-display font-900 text-slate-400 text-2xl">2</span>
              </div>
            </div>

            {/* Gold — 1st */}
            <div className="flex flex-col items-center z-20 w-28 -mx-2">
              <div
                className="flex flex-col items-center mb-2 animate-bounce-sm"
                style={{ animationIterationCount: 'infinite', animationDuration: '3s' }}
              >
                <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center mb-1">
                  <Crown size={20} className="text-amber-600" />
                </div>
                <Avatar name={podium[0].name} size="lg" src={podium[0].avatar} />
                <p className="font-900 text-sm mt-1 truncate w-24 text-center">{podium[0].name.split(' ')[0]}</p>
                <p className="text-xs font-900 text-amber-500">{podium[0].score} XP</p>
              </div>
              <div className="w-full bg-amber-300 h-36 rounded-t-2xl border-t-4 border-amber-400 flex justify-center pt-3 shadow-inner shadow-amber-500/20">
                <span className="font-display font-900 text-amber-700 text-3xl">1</span>
              </div>
            </div>

            {/* Bronze — 3rd */}
            <div className="flex flex-col items-center z-10 w-24">
              <div className="flex flex-col items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center mb-1">
                  <Award size={18} className="text-orange-600" />
                </div>
                <Avatar name={podium[2].name} size="md" src={podium[2].avatar} />
                <p className="font-800 text-xs mt-1 truncate w-20 text-center">{podium[2].name.split(' ')[0]}</p>
                <p className="text-[10px] font-900 text-orange-500">{podium[2].score} XP</p>
              </div>
              <div className="w-full bg-orange-200 h-24 rounded-t-2xl border-t-4 border-orange-300 flex justify-center pt-3 shadow-inner">
                <span className="font-display font-900 text-orange-500 text-2xl">3</span>
              </div>
            </div>
          </div>
        )}

        {/* Partial-podium hint */}
        {rows.length > 0 && rows.length < 3 && (
          <p className="text-center text-slate-400 text-xs mb-4">
            Add more student accounts on this device to unlock the full podium.
          </p>
        )}

        {/* ── Rankings list ────────────────────────────── */}
        {rows.length > 0 && (
          <div
            className="card p-0 overflow-hidden shadow-card animate-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            {(rows.length >= 3 ? rest : rows).map((r, i) => (
              <div
                key={`${r.id}-${i}`}
                className={`flex items-center gap-3 p-4 border-b border-slate-50 last:border-0 transition-colors ${r.isUser ? 'bg-brand-50' : 'bg-white hover:bg-slate-50'
                  }`}
              >
                <span className={`font-display font-900 w-6 text-center text-lg ${r.isUser ? 'text-brand-500' : 'text-slate-400'
                  }`}>
                  {rows.length >= 3 ? i + 4 : i + 1}
                </span>

                <Avatar name={r.name} size="sm" src={r.avatar} />

                <div className="flex-1 min-w-0">
                  <p className={`font-display font-800 text-sm leading-tight ${r.isUser ? 'text-brand-800' : 'text-slate-800'
                    }`}>
                    {r.name}
                    {r.isUser && (
                      <span className="text-brand-400 text-xs font-700 ml-1">(you)</span>
                    )}
                  </p>
                  <p className="text-[10px] font-700 text-slate-400 uppercase tracking-widest mt-0.5">
                    Class {r.class}
                  </p>
                </div>

                <span className={`font-900 text-sm ${r.isUser ? 'text-brand-600' : 'text-slate-600'}`}>
                  {r.score} XP
                </span>
              </div>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <p className="text-[11px] text-slate-400 text-center pb-2">
            Ranks use XP earned from solving, scanning, quizzes &amp; chat on this device.
          </p>
        )}

      </div>
    </AppShell>
  );
}
