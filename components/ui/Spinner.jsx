// components/ui/Spinner.jsx
export default function Spinner({ size = 'md', color = 'brand' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  const colors = { brand: 'border-brand-500', white: 'border-white', slate: 'border-slate-400' };
  return (
    <div className={`${sizes[size]} rounded-full border-2 border-slate-200 ${colors[color]} border-t-transparent animate-spin`} />
  );
}
