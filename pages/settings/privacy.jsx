// pages/settings/privacy.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Shield, Lock, FileText, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';

export default function PrivacySecurity() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  const handleDeleteData = () => {
    if (!confirm('Are you sure you want to clear your local data? This will remove your progress, quiz history, and cached profile from this device. It cannot be undone.')) return;

    // Remove all ShikshaSetu keys from localStorage
    try {
      const keysToRemove = Object.keys(localStorage).filter(k =>
        k.startsWith('ss_') || k.startsWith('vidyaai_')
      );
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch { }

    setCleared(true);
    setTimeout(() => router.replace('/'), 2000);
  };

  const INFO_ITEMS = [
    {
      icon: Lock,
      title: 'End-to-End Safe',
      desc: 'Your answers and questions stay on your device. Nothing is shared without your permission.',
    },
    {
      icon: Shield,
      title: 'No Third-Party Ads',
      desc: 'We never sell your data to advertisers or marketing companies.',
    },
    {
      icon: FileText,
      title: 'Minimal Data Collection',
      desc: 'We only store what is needed to track your progress and personalise quizzes.',
    },
  ];

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
            Privacy &amp; Security
          </h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto space-y-6 animate-fade-in">

        {/* Hero */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 shadow-sm border-4 border-white mb-4">
            <Shield size={40} />
          </div>
          <h2 className="font-display font-800 text-slate-800 text-xl text-center">
            Your Privacy is Protected
          </h2>
          <p className="text-sm text-slate-500 text-center mt-2 max-w-xs leading-relaxed font-500">
            ShikshaSetu stores your progress locally on this device and uses it only to improve your learning experience.
          </p>
        </div>

        {/* Info cards */}
        <div className="card p-0 overflow-hidden shadow-sm">
          {INFO_ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className={`flex items-start gap-3 p-4 bg-white ${i < INFO_ITEMS.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 shrink-0 mt-0.5">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-800 text-sm text-slate-800">{title}</h3>
                <p className="text-xs font-500 text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legal links */}
        <div className="card p-0 overflow-hidden shadow-sm">
          {[
            { label: 'Privacy Policy', icon: FileText },
            { label: 'Terms of Service', icon: Lock },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Icon size={18} /></div>
                {label}
              </div>
              <ExternalLink size={16} className="text-slate-400" />
            </button>
          ))}
        </div>

        {/* Danger zone */}
        <div>
          <h3 className="font-800 text-rose-500 text-sm ml-1 mb-2">Danger Zone</h3>
          <div className="card border border-rose-100 bg-rose-50/50 space-y-3">
            <p className="text-xs text-rose-600 font-600 leading-relaxed">
              This will permanently clear your progress, quiz history, and profile data from this device.
              You will be signed out automatically.
            </p>

            {cleared ? (
              <div className="flex items-center gap-2 text-brand-600 text-sm font-700 py-2">
                <CheckCircle2 size={18} />
                Data cleared. Redirecting…
              </div>
            ) : (
              <button
                onClick={handleDeleteData}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-200 text-rose-600 font-700 text-sm bg-white hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={16} />
                Clear Local Data
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
