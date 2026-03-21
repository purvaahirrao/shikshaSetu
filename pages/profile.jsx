import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { LogOut, Settings, User, Bell, Shield, ChevronRight } from 'lucide-react';

const CLASSES = ['1','2','3','4','5','6','7','8','9','10'];
const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi',   label: 'हिंदी'   },
  { value: 'marathi', label: 'मराठी'   },
];

export default function ProfilePage() {
  const { user, loading, logout, setManualUser } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [cls, setCls] = useState('');
  const [lang, setLang] = useState('english');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    } else if (user) {
      setName(user.name || '');
      setCls(user.class || '');
      setLang(user.language || 'english');
      
      // Load preferences for Google users from local storage if needed
      if (user.source === 'google') {
        const prefs = localStorage.getItem(`ss_prefs_${user.uid}`);
        if (prefs) {
          const parsed = JSON.parse(prefs);
          if (parsed.class) setCls(parsed.class);
          if (parsed.language) setLang(parsed.language);
        }
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleSaveProfile = () => {
    if (user.source === 'manual') {
      setManualUser({ ...user, name, class: cls, language: lang });
    } else {
      // Save preferences for Google user
      localStorage.setItem(`ss_prefs_${user.uid}`, JSON.stringify({ class: cls, language: lang }));
    }
    setIsEditing(false);
  };

  return (
    <AppShell title="My Profile">
      <div className="px-5 py-6 space-y-8 animate-fade-in">

        {/* ── User Info Section ────────────────────────────── */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar src={user.photo} name={name} size="xl" />
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 h-8 w-8 bg-white rounded-full shadow-card flex items-center justify-center text-slate-600 hover:text-brand-500 transition-colors"
            >
              <User size={16} />
            </button>
          </div>
          <h2 className="font-display font-800 text-2xl text-slate-900">{name}</h2>
          <p className="text-slate-500 text-sm mt-1">{user.email || 'Manual Account'}</p>
          
          <div className="flex gap-2 mt-4">
            <div className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-700 rounded-full">
              Class {cls || '?'}
            </div>
            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-700 rounded-full capitalize">
              {LANGUAGES.find(l => l.value === lang)?.label || lang}
            </div>
          </div>
        </div>

        {/* ── Edit Profile Form ────────────────────────────── */}
        {isEditing && (
          <div className="card space-y-4 border-2 border-brand-100 animate-slide-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-800 text-slate-800">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 text-sm font-600">Cancel</button>
            </div>
            
            {user.source === 'manual' && (
              <div>
                <label className="block text-xs font-600 text-slate-500 mb-1.5">Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-600 text-slate-500 mb-2">Class</label>
              <div className="flex flex-wrap gap-2">
                {CLASSES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCls(c)}
                    className={`h-9 w-9 rounded-xl text-sm font-700 transition-all ${
                      cls === c
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-500 mb-2">Language</label>
              <div className="flex gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLang(l.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-600 transition-all ${
                      lang === l.value
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="primary" className="w-full mt-2" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </div>
        )}

        {/* ── Settings Section ─────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="font-display font-800 text-slate-700 text-base px-1">Settings</h3>
          
          <div className="card p-0 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Bell size={18} /></div>
                Notifications
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Settings size={18} /></div>
                App Preferences
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Shield size={18} /></div>
                Privacy & Security
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* ── Logout Section ───────────────────────────────── */}
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-700 text-sm text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut size={18} />
            Log Out Account
          </button>
          
          <p className="mt-6 text-center text-xs text-slate-400 font-500 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {/* Logo placeholder - The user will upload a new logo here */}
            <span className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded text-[10px] tracking-wider uppercase">
              ShikshaSetu v1.0
            </span>
          </p>
        </div>

      </div>
    </AppShell>
  );
}
