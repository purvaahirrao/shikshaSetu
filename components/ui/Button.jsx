// components/ui/Button.jsx
export default function Button({
  children, variant = 'primary', size = 'md', className = '', loading = false, ...props
}) {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    ghost:     'btn-ghost',
    google:    'btn-google',
    danger:    'btn bg-rose-50 text-rose-600 border border-rose-200 px-6 py-3.5 hover:bg-rose-100',
  };
  const sizes = {
    sm: 'text-sm px-4 py-2.5 rounded-xl',
    md: '',
    lg: 'text-lg px-8 py-4 rounded-2xl',
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
        </svg>
      )}
      {children}
    </button>
  );
}
