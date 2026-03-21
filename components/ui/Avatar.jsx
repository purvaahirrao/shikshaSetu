// components/ui/Avatar.jsx
export default function Avatar({ src, name = '', size = 'md' }) {
  const sizes  = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-700 ring-2 ring-white`}>
      {initials}
    </div>
  );
}
