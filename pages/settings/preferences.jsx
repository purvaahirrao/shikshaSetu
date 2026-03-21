import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Moon, Type, Volume2 } from 'lucide-react';

export default function AppPreferences() {
  const router = useRouter();
  
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 sm:pb-10">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="flex items-center h-16 px-4 max-w-md mx-auto relative">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:text-brand-600 transition-colors absolute left-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-900 font-display text-slate-800 w-full text-center">App Preferences</h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto space-y-6 pb-10 animate-fade-in">
        <p className="text-sm font-600 text-slate-500 mb-2">Customize your learning experience.</p>

        <div className="card p-0 overflow-hidden shadow-sm">
          {/* Sound Effects */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Volume2 size={20} />
              </div>
              <div>
                <h3 className="font-800 text-sm text-slate-800">Sound Effects</h3>
                <p className="text-xs font-500 text-slate-500 mt-0.5">Play cheers for correct answers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={soundEffects} onChange={() => setSoundEffects(!soundEffects)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Moon size={20} />
              </div>
              <div>
                <h3 className="font-800 text-sm text-slate-800">Dark Mode (Beta)</h3>
                <p className="text-xs font-500 text-slate-500 mt-0.5">Easier on the eyes at night</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Type size={20} />
              </div>
              <div>
                <h3 className="font-800 text-sm text-slate-800">High Contrast Text</h3>
                <p className="text-xs font-500 text-slate-500 mt-0.5">Make words easier to read</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>

      </main>
    </div>
  );
}
