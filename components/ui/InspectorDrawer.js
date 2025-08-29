'use client'
import { useEffect, useRef } from 'react'

export default function InspectorDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  width = '480px',
  children
}) {
  const drawerRef = useRef(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return

    const focusableElements = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink-900/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 z-50 glass-xl border-l border-ink-100 animate-slide-in-right"
        style={{ width }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass-lg border-b border-ink-100 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="type-list-heading text-primary truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="type-detail-caption text-ink-400 truncate mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto pb-20">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

// Drawer section component for consistent spacing
export function DrawerSection({ title, children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-ink-50 ${className}`}>
      {title && (
        <h3 className="type-list-label text-ink-400 mb-3">{title}</h3>
      )}
      {children}
    </div>
  )
}

// Quick info component for key-value pairs
export function DrawerInfo({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="type-list-body text-ink-600">{label}</span>
      </div>
      <span className="type-list-body text-primary font-medium">
        {value}
      </span>
    </div>
  )
}

// Action buttons for drawer
export function DrawerActions({ actions, className = '' }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      <div className="flex flex-col gap-2">
        {actions.map((action, index) => (
          <button
            key={action.id || index}
            onClick={action.onClick}
            className={`
              w-full px-4 py-2.5 rounded-lg
              flex items-center justify-center gap-2
              type-list-body font-medium
              transition-all
              ${action.variant === 'primary' 
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg' 
                : action.variant === 'danger'
                ? 'bg-error/10 text-error hover:bg-error/20'
                : 'glass hover:glass-brand text-ink-700'
              }
            `}
          >
            {action.icon && <span className="text-lg">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}