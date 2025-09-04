'use client'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) {
  const variants = {
    primary: `
      bg-gradient-to-r from-brand-500 to-brand-600
      text-white font-medium
      hover:from-brand-600 hover:to-brand-700
      active:from-brand-700 active:to-brand-800
      elev-1 hover:elev-2
      disabled:from-ink-400 disabled:to-ink-500
      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-black
    `,
    secondary: `
      glass hover:glass-strong
      text-brand-600 font-medium
      border border-brand-200/30
      hover:border-brand-300/50 hover:text-brand-700
      active:scale-95
      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-black
    `,
    ghost: `
      text-ink-400 hover:text-brand-600
      hover:glass-subtle
      font-medium
      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-black
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      text-white font-medium
      hover:from-red-600 hover:to-red-700
      elev-1 hover:elev-2
      focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600
      text-white font-medium
      hover:from-green-600 hover:to-green-700
      elev-1 hover:elev-2
      focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black
    `,
    brand: `
      glass-brand
      text-white font-medium
      hover:glass-brand-subtle hover:text-brand-100
      elev-1 hover:elev-2
      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-black
    `,
  }

  const sizes = {
    sm: 'px-3 py-1.5 type-list-body radius-lg',
    md: 'p-space-3 type-detail-body radius-xl',
    lg: 'p-space-4 type-detail-title radius-xl',
    xl: 'p-space-5 type-dashboard-metric radius-2xl',
  }

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    transition-all duration-200 ease-out
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `

  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle 
        className="opacity-25" 
        cx="12" cy="12" r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && iconPosition === 'left' && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
      {loading && iconPosition === 'right' && <LoadingSpinner />}
    </button>
  )
}

export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}