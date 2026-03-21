// pages/settings/preferences.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Moon, Type, Volume2, Globe, Zap } from 'lucide-react';

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
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

const SECTIONS = [
  {
    heading: 'Display',
    items: [
      { key: 'darkMode', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-100', title: 'Dark Mode (Beta)', desc: 'Easier on the eyes at night', default: false },
      { key: 'highContrast', icon: Type, color: 'text-slate-700', bg: 'bg-slate-100', title: 'High Contrast Text', desc: 'Make words easier to read', default: false },
    ],
  },
  {
    heading: 'Audio',
    items: [
      { key: 'soundEffects', icon: Volume2, color: 'text-emerald-600', bg: 'bg-emerald-100', title: 'Sound Effects', desc: 'Play cheers for correct answers', default: true },
    ],
  },
  {
    heading: 'Learning',
    items: [
      { key: 'animations', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100', title: 'Animations', desc: 'Smooth transitions and effects', default: true },
      { key: 'autoLanguage', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100', title: 'Auto-detect Language', desc: 'Match questions to your profile lang', default: false },
    ],
  },
];

export default function AppPreferences() {
  const router = useRouter();
  const [settings, setSettings] = useState(
    Object.fromEntries(
      SECTIONS.flatMap(s => s.items).map(item => [item.key, item.default])
    )
  );

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="flex items-center h-16 px-4 max-w-md mx-auto relative">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-600 hover:text-brand-600 transition-colors absolute left-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-900 font-display text-slate-800 w-full text-center">
            App Preferences
          </h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto space-y-6 animate-fade-in">
        <p className="text-sm font-600 text-slate-500 px-1">Customize your learning experience.</p>

        {SECTIONS.map(({ heading, items }) => (
          <div key={heading}>
            <p className="text-xs font-800 text-slate-400 uppercase tracking-widest px-1 mb-2">
              {heading}
            </p>
            <div className="card p-0 overflow-hidden shadow-sm">
              {items.map(({ key, icon: Icon, color, bg, title, desc }, i) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors ${i < items.length - 1 ? 'border-b border-slate-50' : ''
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
          </div>
        ))}

        {settings.darkMode && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 font-600 animate-fade-up">
            🌙 Dark mode is in beta. Some screens may not be fully styled yet.
          </div>
        )}
      </main>
    </div>
  );
}
