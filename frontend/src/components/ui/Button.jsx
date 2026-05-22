const variants = {
  primary: 'bg-[#6B1D3A] text-white hover:bg-[#4F1529] disabled:bg-[#6B1D3A]/40 shadow-sm',
  secondary: 'bg-white text-[#6B1D3A] border-2 border-[#6B1D3A] hover:bg-[#FBF7F4]',
  gold: 'bg-gradient-to-r from-[#C9A962] to-[#E8D5A8] text-[#4F1529] hover:from-[#B8984F] hover:to-[#D4C090] font-semibold shadow-md',
  whatsapp: 'bg-[#25D366] text-white border-2 border-white hover:bg-[#20BD5A] shadow-lg shadow-[#25D366]/40 font-semibold',
  ghost: 'bg-transparent text-gray-700 hover:bg-[#F3EBE4]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
}
