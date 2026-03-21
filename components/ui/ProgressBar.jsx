// components/ui/ProgressBar.jsx
const barColors = {
  green:  'bg-brand-500',
  blue:   'bg-blue-500',
  amber:  'bg-amber-400',
  indigo: 'bg-indigo-500',
  rose:   'bg-rose-500',
};

export default function ProgressBar({ value = 0, max = 100, color = 'green', className = '' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`progress-track ${className}`}>
      <div className={`progress-fill ${barColors[color]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
