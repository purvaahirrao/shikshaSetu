import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Bell, MessageSquare, Flame } from 'lucide-react';

export default function NotificationsSettings() {
  const router = useRouter();
  
  const [notifyQuiz, setNotifyQuiz] = useState(true);
  const [notifyStreak, setNotifyStreak] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 sm:pb-10">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="flex items-center h-16 px-4 max-w-md mx-auto relative">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:text-brand-600 transition-colors absolute left-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-900 font-display text-slate-800 w-full text-center">Notifications</h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto space-y-6 pb-10 animate-fade-in">
        <p className="text-sm font-600 text-slate-500 mb-2">Choose what we notify you about.</p>

        <div className="card p-0 overflow-hidden shadow-sm">
          {/* Daily Quiz Reminder */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-800 text-sm text-slate-800">Daily Quiz Reminder</h3>
                <p className="text-xs font-500 text-slate-500 mt-0.5">Don't forget to practice</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifyQuiz} onChange={() => setNotifyQuiz(!notifyQuiz)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Streak Saver */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Flame size={20} />
              </div>
              <div>
                <h3 className="font-800 text-sm text-slate-800">Streak Saver Alerts</h3>
                <p className="text-xs font-500 text-slate-500 mt-0.5">When you're about to lose it</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifyStreak} onChange={() => setNotifyStreak(!notifyStreak)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* App Updates */}
          <div className="flex items-center justify-between p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-800 text-sm text-slate-800">New Features & Updates</h3>
                <p className="text-xs font-500 text-slate-500 mt-0.5">Be the first to know</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifyUpdates} onChange={() => setNotifyUpdates(!notifyUpdates)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>
      </main>
    </div>
  );
}
