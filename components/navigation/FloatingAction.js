'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const QUICK_ACTIONS = [
  { id: 'sale', label: 'Log Sale', icon: '💰', color: 'from-green-500 to-green-600', action: 'log-sale' },
  { id: 'checkin', label: 'Daily Check-in', icon: '☀️', color: 'from-yellow-500 to-yellow-600', href: '/daily-intentions' },
  { id: 'team', label: 'View Team', icon: '👥', color: 'from-blue-500 to-blue-600', href: '/team' },
  { id: 'bell', label: 'Ring Bell', icon: '🔔', color: 'from-purple-500 to-purple-600', action: 'ring-bell' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', color: 'from-pink-500 to-pink-600', href: '/leaderboard' },
]

export default function FloatingAction() {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleAction = (action) => {
    if (action.href) {
      router.push(action.href)
    } else if (action.action) {
      // Dispatch custom events for modals
      window.dispatchEvent(new CustomEvent(action.action))
    }
    setIsExpanded(false)
  }

  const toggleExpanded = () => {
    if (isExpanded) {
      setIsAnimating(true)
      setTimeout(() => {
        setIsExpanded(false)
        setIsAnimating(false)
      }, 200)
    } else {
      setIsExpanded(true)
    }
  }

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Quick Actions */}
        {isExpanded && (
          <div className={`
            absolute bottom-16 right-0 space-y-3
            ${isAnimating ? 'animate-fade-out' : 'animate-fade-in'}
          `}>
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="flex items-center gap-3 group"
                style={{
                  animation: `slideInRight ${100 + index * 50}ms ease-out`
                }}
              >
                <span className="opacity-0 group-hover:opacity-100 bg-ink-900/90 text-white px-3 py-1.5 rounded-lg type-list-body whitespace-nowrap transition-opacity duration-200 mr-2">
                  {action.label}
                </span>
                <div className={`
                  w-12 h-12 rounded-full
                  bg-gradient-to-br ${action.color}
                  flex items-center justify-center
                  text-white text-xl
                  elev-2 hover:elev-3
                  transform hover:scale-110
                  transition-all duration-200
                `}>
                  {action.icon}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={toggleExpanded}
          className={`
            w-14 h-14 rounded-full
            bg-gradient-to-br from-brand-500 to-brand-600
            flex items-center justify-center
            text-white
            elev-3 hover:elev-4
            transform transition-all duration-300
            ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-110'}
          `}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Keyboard shortcut hint */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <kbd className="px-2 py-1 rounded bg-ink-900/90 text-white type-detail-caption whitespace-nowrap">
            ⌘N
          </kbd>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .animate-fade-out {
          animation: fadeOut 200ms ease-out forwards;
        }
      `}</style>
    </>
  )
}