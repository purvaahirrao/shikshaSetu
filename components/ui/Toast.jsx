// components/ui/Toast.jsx
import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    info:    'bg-slate-800 text-white',
    success: 'bg-brand-500 text-white',
    error:   'bg-rose-500 text-white',
  };

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-600 animate-fade-up ${styles[type]}`}>
      {message}
    </div>
  );
}
