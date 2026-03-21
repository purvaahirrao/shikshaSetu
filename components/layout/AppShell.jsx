// components/layout/AppShell.jsx
import BottomNav from './BottomNav';

export default function AppShell({ children, title, right, back, onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      {title && (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex items-center gap-3">
          {back && (
            <button
              onClick={onBack}
              className="p-2 -ml-1 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}
          <h1 className="font-display font-800 text-slate-800 text-lg flex-1">{title}</h1>
          {right && <div>{right}</div>}
        </header>
      )}

      {/* Page content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
