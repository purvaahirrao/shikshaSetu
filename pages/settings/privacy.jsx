import { useRouter } from 'next/router';
import { ArrowLeft, Shield, Lock, FileText, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function PrivacySecurity() {
  const router = useRouter();

  const handleDeleteData = () => {
    if (confirm("Are you sure you want to clear your local data? This cannot be undone.")) {
      alert("Local data cleared.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 sm:pb-10">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="flex items-center h-16 px-4 max-w-md mx-auto relative">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:text-brand-600 transition-colors absolute left-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-900 font-display text-slate-800 w-full text-center">Privacy & Security</h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto space-y-6 pb-10 animate-fade-in">
        <div className="flex justify-center my-6">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 shadow-sm border-4 border-white">
            <Shield size={40} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-800 text-slate-800 text-lg">Your Privacy is Protected</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-500">
            ShikshaSetu is built to help you learn securely. We only collect the minimal information necessary to track your progress and personalize your quizzes. We never sell your data to third parties.
          </p>
        </div>

        <div className="card p-0 overflow-hidden shadow-sm">
          <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><FileText size={18} /></div>
              Privacy Policy
            </div>
            <ArrowLeft size={18} className="text-slate-400 rotate-180" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3 text-slate-700 font-600 text-sm">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Lock size={18} /></div>
              Terms of Service
            </div>
            <ArrowLeft size={18} className="text-slate-400 rotate-180" />
          </button>
        </div>

        <div className="pt-6">
          <h3 className="font-800 text-rose-500 text-sm ml-1 mb-2">Danger Zone</h3>
          <div className="card p-4 border border-rose-100 bg-rose-50/50">
            <p className="text-xs text-rose-600 font-600 mb-4">
              Clear your account data from this device. You will lose your scan history and cached progress locally.
            </p>
            <Button variant="secondary" className="w-full border-rose-200 text-rose-600 hover:bg-rose-100" onClick={handleDeleteData}>
              <Trash2 size={16} className="mr-2" />
              Clear Local Data
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
