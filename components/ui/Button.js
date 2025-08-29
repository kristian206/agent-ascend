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
      bg-gradient-to-r from-primary-500 to-primary-600
      text-white font-medium
      hover:from-primary-600 hover:to-primary-700
      active:from-primary-700 active:to-primary-800
      shadow-elevation-low hover:shadow-elevation-medium
      disabled:from-gray-400 disabled:to-gray-500
    `,
    secondary: `
      glass hover:glass-strong
      text-primary-700 font-medium
      border border-primary-200/30
      hover:border-primary-300/50
      active:scale-95
    `,
    ghost: `
      text-text-secondary hover:text-primary-600
      hover:glass-subtle
      font-medium
    `,
    danger: `
      bg-gradient-to-r from-error to-error-dark
      text-white font-medium
      hover:from-error-dark hover:to-red-700
      shadow-elevation-low hover:shadow-elevation-medium
    `,
    success: `
      bg-gradient-to-r from-success to-success-dark
      text-white font-medium
      hover:from-success-dark hover:to-green-700
      shadow-elevation-low hover:shadow-elevation-medium
    `,
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl',
    xl: 'px-8 py-4 text-xl rounded-2xl',
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