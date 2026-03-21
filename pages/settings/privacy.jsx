// pages/settings/privacy.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Shield, Lock, FileText, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

const INFO_DEFS = [
  { icon: Lock, titleKey: 'privacy_safe_title', descKey: 'privacy_safe_desc' },
  { icon: Shield, titleKey: 'privacy_ads_title', descKey: 'privacy_ads_desc' },
  { icon: FileText, titleKey: 'privacy_minimal_title', descKey: 'privacy_minimal_desc' },
];

export default function PrivacySecurity() {
  const router = useRouter();
  const { t } = useI18n();
  const [cleared, setCleared] = useState(false);

  const handleDeleteData = () => {
    if (!window.confirm(t('privacy_confirm_clear'))) return;

    try {
      const keysToRemove = Object.keys(localStorage).filter(k =>
        k.startsWith('ss_') || k.startsWith('vidyaai_'),
      );
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }

    setCleared(true);
    setTimeout(() => router.replace('/'), 2000);
  };

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
            {t('settings_privacy_title')}
          </h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto space-y-6 animate-fade-in">

        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 shadow-sm border-4 border-white mb-4">
            <Shield size={40} />
          </div>
          <h2 className="font-display font-800 text-slate-800 text-xl text-center">
            {t('privacy_hero_title')}
          </h2>
          <p className="text-sm text-slate-500 text-center mt-2 max-w-xs leading-relaxed font-500">
            {t('privacy_hero_sub')}
          </p>
        </div>

        <div className="card p-0 overflow-hidden shadow-sm">
          {INFO_DEFS.map(({ icon: Icon, titleKey, descKey }, i) => (
            <div
              key={titleKey}
              className={`flex items-start gap-3 p-4 bg-white ${i < INFO_DEFS.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 shrink-0 mt-0.5">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-800 text-sm text-slate-800">{t(titleKey)}</h3>
                <p className="text-xs font-500 text-slate-500 mt-0.5 leading-relaxed">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-0 overflow-hidden shadow-sm">
          {[
            { labelKey: 'privacy_policy', icon: FileText },
            { labelKey: 'privacy_terms', icon: Lock },
          ].map(({ labelKey, icon: Icon }) => (
            <button
              key={labelKey}
              type="button"
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Icon size={18} /></div>
                {t(labelKey)}
              </div>
              <ExternalLink size={16} className="text-slate-400" />
            </button>
          ))}
        </div>

        <div>
          <h3 className="font-800 text-rose-500 text-sm ml-1 mb-2">{t('privacy_danger_title')}</h3>
          <div className="card border border-rose-100 bg-rose-50/50 space-y-3">
            <p className="text-xs text-rose-600 font-600 leading-relaxed">
              {t('privacy_danger_body')}
            </p>

            {cleared ? (
              <div className="flex items-center gap-2 text-brand-600 text-sm font-700 py-2">
                <CheckCircle2 size={18} />
                {t('privacy_clearing')}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDeleteData}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-200 text-rose-600 font-700 text-sm bg-white hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={16} />
                {t('privacy_clear_btn')}
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
