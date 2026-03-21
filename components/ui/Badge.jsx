// components/ui/Badge.jsx
const colors = {
  green:  'bg-brand-100 text-brand-700',
  blue:   'bg-blue-100 text-blue-700',
  amber:  'bg-amber-100 text-amber-700',
  rose:   'bg-rose-100 text-rose-600',
  slate:  'bg-slate-100 text-slate-600',
  indigo: 'bg-indigo-100 text-indigo-700',
};

export default function Badge({ children, color = 'green', className = '' }) {
  return (
    <span className={`badge ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}
