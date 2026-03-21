// pages/settings/notifications.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Bell, Flame, MessageSquare, BookOpen, Trophy } from 'lucide-react';

const NOTIFICATION_ITEMS = [
  {
    key: 'quiz',
    icon: Bell,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    title: 'Daily Quiz Reminder',
    desc: "Don't forget to practice",
    default: true,
  },
  {
    key: 'streak',
    icon: Flame,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    title: 'Streak Saver Alerts',
    desc: "When you're about to lose your streak",
    default: true,
  },
  {
    key: 'lessons',
    icon: BookOpen,
    color: 'text-brand-600',
    bg: 'bg-brand-100',
    title: 'New Lessons Available',
    desc: 'When fresh content is added for your class',
    default: true,
  },
  {
    key: 'achievements',
    icon: Trophy,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    title: 'Badge Earned',
    desc: 'Celebrate when you unlock an achievement',
    default: true,
  },
  {
    key: 'updates',
    icon: MessageSquare,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    title: 'New Features & Updates',
    desc: 'Be the first to know about improvements',
    default: false,
  },
];

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-slate-200 rounded-full peer
        peer-checked:bg-brand-500
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:border after:border-slate-300 after:rounded-full
        after:h-5 after:w-5 after:transition-all
        peer-checked:after:translate-x-full peer-checked:after:border-white
        peer-focus:outline-none" />
    </label>
  );
}

export default function NotificationsSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState(
    Object.fromEntries(NOTIFICATION_ITEMS.map(n => [n.key, n.default]))
  );

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="flex items-center h-16 px-4 max-w-md mx-auto relative">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-600 hover:text-brand-600 transition-colors absolute left-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-900 font-display text-slate-800 w-full text-center">
            Notifications
          </h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto space-y-5 animate-fade-in">

        {/* Summary pill */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-600 text-slate-500">Choose what we notify you about.</p>
          <span className="text-xs font-800 bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full">
            {enabledCount} on
          </span>
        </div>

        {/* Toggle list */}
        <div className="card p-0 overflow-hidden shadow-sm">
          {NOTIFICATION_ITEMS.map(({ key, icon: Icon, color, bg, title, desc }, i) => (
            <div
              key={key}
              className={`flex items-center justify-between p-4 bg-white transition-colors hover:bg-slate-50 ${i < NOTIFICATION_ITEMS.length - 1 ? 'border-b border-slate-50' : ''
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-800 text-sm text-slate-800">{title}</h3>
                  <p className="text-xs font-500 text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
              <Toggle checked={settings[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>

        {/* Info note */}
        <p className="text-xs text-slate-400 text-center px-4 leading-relaxed">
          Notifications require your device's browser notification permission. They remind you to study even when the app is closed.
        </p>

      </main>
    </div>
  );
}
