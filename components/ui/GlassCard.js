'use client'

export default function GlassCard({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'md',
  blur = 'md',
  onClick,
  ...props 
}) {
  const variants = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'glass-subtle',
    dark: 'glass-dark',
    gradient: 'gradient-border',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }

  const blurs = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  }

  const baseClasses = `
    rounded-2xl
    ${variants[variant] || variants.default}
    ${paddings[padding]}
    ${blurs[blur]}
    ${hover ? 'glass-hover transition-all duration-300' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlassCardHeader({ children, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  )
}

export function GlassCardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-title-2 font-bold text-primary-900 ${className}`}>
      {children}
    </h3>
  )
}

export function GlassCardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-text-secondary mt-1 ${className}`}>
      {children}
    </p>
  )
}

export function GlassCardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function GlassCardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-6 border-t border-primary-200/20 ${className}`}>
      {children}
    </div>
  )
}