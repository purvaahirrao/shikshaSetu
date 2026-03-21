// pages/settings/preferences.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Moon, Type, Volume2, Globe, Zap } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

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

const SECTION_DEFS = [
  {
    headingKey: 'prefs_section_display',
    items: [
      { key: 'darkMode', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-100', titleKey: 'prefs_dark_title', descKey: 'prefs_dark_desc', default: false },
      { key: 'highContrast', icon: Type, color: 'text-slate-700', bg: 'bg-slate-100', titleKey: 'prefs_contrast_title', descKey: 'prefs_contrast_desc', default: false },
    ],
  },
  {
    headingKey: 'prefs_section_audio',
    items: [
      { key: 'soundEffects', icon: Volume2, color: 'text-emerald-600', bg: 'bg-emerald-100', titleKey: 'prefs_sound_title', descKey: 'prefs_sound_desc', default: true },
    ],
  },
  {
    headingKey: 'prefs_section_learning',
    items: [
      { key: 'animations', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100', titleKey: 'prefs_anim_title', descKey: 'prefs_anim_desc', default: true },
      { key: 'autoLanguage', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100', titleKey: 'prefs_autolang_title', descKey: 'prefs_autolang_desc', default: false },
    ],
  },
];

export default function AppPreferences() {
  const router = useRouter();
  const { t } = useI18n();
  const [settings, setSettings] = useState(
    Object.fromEntries(
      SECTION_DEFS.flatMap(s => s.items).map(item => [item.key, item.default]),
    ),
  );

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="flex items-center h-16 px-4 max-w-md mx-auto relative">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-600 hover:text-brand-600 transition-colors absolute left-4"
            aria-label={t('common_goBack')}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-900 font-display text-slate-800 w-full text-center">
            {t('settings_prefs_title')}
          </h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto space-y-6 animate-fade-in">
        <p className="text-sm font-600 text-slate-500 px-1">{t('settings_prefs_subtitle')}</p>

        {SECTION_DEFS.map(({ headingKey, items }) => (
          <div key={headingKey}>
            <p className="text-xs font-800 text-slate-400 uppercase tracking-widest px-1 mb-2">
              {t(headingKey)}
            </p>
            <div className="card p-0 overflow-hidden shadow-sm">
              {items.map(({ key, icon: Icon, color, bg, titleKey, descKey }, i) => (
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
                      <h3 className="font-800 text-sm text-slate-800">{t(titleKey)}</h3>
                      <p className="text-xs font-500 text-slate-500 mt-0.5">{t(descKey)}</p>
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
            {t('prefs_dark_beta_note')}
          </div>
        )}
      </main>
    </div>
  );
}
