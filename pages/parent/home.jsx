import { useRequireRole } from '../../hooks/useRequireRole';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { Users } from 'lucide-react';

export default function ParentHomePage() {
  const { user, loading } = useRequireRole('parent');

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AppShell title="Parent">
      <div className="px-5 pt-6 pb-24 space-y-6">
        <div className="card flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
            <Users className="text-violet-600" size={24} />
          </div>
          <div>
            <p className="font-display font-800 text-slate-800 text-lg">Welcome, {user.name?.split(' ')[0]}</p>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
              Parent dashboard is coming next: linked students, progress summaries, and notifications will appear here.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
