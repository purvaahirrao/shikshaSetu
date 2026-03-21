import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { LogOut, Settings, User, Bell, Shield, ChevronRight, Zap, Star, Award, GraduationCap, BookOpen, Users } from 'lucide-react';

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

          {/* Role badge */}
          <span className={`inline-block mt-2 text-[10px] font-800 uppercase tracking-wider px-2.5 py-1 rounded-md ${
            (user.role || 'student') === 'teacher' ? 'bg-indigo-100 text-indigo-600' :
            (user.role || 'student') === 'parent' ? 'bg-amber-100 text-amber-600' :
            'bg-brand-100 text-brand-600'
          }`}>
            {(() => {
              const r = user.role || 'student';
              const I = r === 'teacher' ? BookOpen : r === 'parent' ? Users : GraduationCap;
              return <><I size={12} className="inline-block mr-1 -mt-0.5" />{r.charAt(0).toUpperCase() + r.slice(1)}</>;
            })()}
          </span>
          
          <div className="flex gap-2 mt-3">
            {(user.role || 'student') === 'student' && (
              <>
                <div className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-700 rounded-full">Class {cls || '?'}</div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-700 rounded-full capitalize">{LANGUAGES.find(l => l.value === lang)?.label || lang}</div>
              </>
            )}
            {(user.role || 'student') === 'teacher' && (
              <>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-700 rounded-full">{user.subject || 'Teacher'}</div>
                <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-700 rounded-full">{user.experience || 'Experienced'}</div>
              </>
            )}
            {(user.role || 'student') === 'parent' && (
              <>
                <div className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-700 rounded-full">Child: {user.childName || 'N/A'}</div>
                <div className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-700 rounded-full">Class {user.childClass || '?'}</div>
              </>
            )}
          </div>
        </div>

        {/* ── Stats Section ─────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-500">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-2xl font-display font-900 text-slate-800">7</p>
              <p className="text-[10px] font-800 text-slate-400 uppercase tracking-wider">Day Streak</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-500">
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-2xl font-display font-900 text-slate-800">1,240</p>
              <p className="text-[10px] font-800 text-slate-400 uppercase tracking-wider">Total XP</p>
            </div>
          </div>
        </div>

        {/* ── Achievements Section ─────────────────────────────── */}
        <div className="space-y-3 mb-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base px-1">Achievements</h3>
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2.5 rounded-2xl flex items-center justify-center"><Award size={24} className="text-amber-500" /></div>
                <div>
                  <h4 className="font-display font-800 text-slate-800">Early Bird</h4>
                  <p className="text-xs font-600 text-slate-500 mt-0.5">Complete 5 morning quizzes</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-800 text-brand-500">3/5</span>
              </div>
            </div>
            <div className="progress-track h-2.5">
              <div className="progress-fill bg-brand-500" style={{ width: '60%' }} />
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
            <Link href="/settings/notifications" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Bell size={18} /></div>
                Notifications
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
            
            <Link href="/settings/preferences" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Settings size={18} /></div>
                App Preferences
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
            
            <Link href="/settings/privacy" className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Shield size={18} /></div>
                Privacy & Security
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
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
            <img 
              src="https://user5301.na.imgto.link/public/20260321/az0pmpqr3wttpr2cmzwy7w-az0pmpqrar-qd1us4ehj7a-1.avif" 
              alt="Logo" 
              className="h-8 w-auto mx-auto mb-2 opacity-60 grayscale hover:grayscale-0 transition-all duration-300"
            />
            <span className="inline-block px-3 py-1 bg-slate-100 rounded text-[10px] tracking-wider uppercase">
              ShikshaSetu v1.1
            </span>
          </p>
        </div>

      </div>
    </AppShell>
  );
}
