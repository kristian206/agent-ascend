'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CORE_NAVIGATION = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    href: '/dashboard',
    description: 'Overview & stats',
  },
  {
    id: 'team',
    label: 'Team',
    icon: '👥',
    href: '/team',
    description: 'Team performance',
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: '🏆',
    href: '/leaderboard',
    description: 'Rankings & competition',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    href: '/profile',
    description: 'Your stats & settings',
  },
]

const DEFAULT_SHORTCUTS = [
  { id: 'nightly-wrap', label: 'Nightly Wrap', icon: '🌙', href: '/nightly-wrap' },
  { id: 'team', label: 'Team Overview', icon: '👥', href: '/team' },
]

export default function LeftRail({ isCollapsed = false, onToggle }) {
  const pathname = usePathname()
  const [shortcuts, setShortcuts] = useState([])
  const [isPinning, setIsPinning] = useState(false)

  // Load shortcuts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nav-shortcuts')
    if (saved) {
      setShortcuts(JSON.parse(saved))
    } else {
      setShortcuts(DEFAULT_SHORTCUTS)
      localStorage.setItem('nav-shortcuts', JSON.stringify(DEFAULT_SHORTCUTS))
    }
  }, [])

  const isActive = (href) => pathname === href

  const toggleShortcut = (item) => {
    const exists = shortcuts.find(s => s.id === item.id)
    let newShortcuts
    
    if (exists) {
      newShortcuts = shortcuts.filter(s => s.id !== item.id)
    } else {
      newShortcuts = [...shortcuts, item]
    }
    
    setShortcuts(newShortcuts)
    localStorage.setItem('nav-shortcuts', JSON.stringify(newShortcuts))
  }

  const isShortcut = (id) => shortcuts.some(s => s.id === id)

  return (
    <aside className={`
      fixed left-0 top-16 bottom-0 z-20
      bg-surface-base border-r border-ink-100
      transition-all duration-300 ease-out
      ${isCollapsed ? 'w-16' : 'w-64'}
      flex flex-col
    `}>
      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-surface-ground border border-ink-100 flex items-center justify-center hover:bg-surface-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className={`w-3 h-3 text-ink-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Home/Dashboard - Always visible */}
      <div className="p-4">
        <Link
          href="/dashboard"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200
            ${isActive('/dashboard') 
              ? 'glass-brand text-brand-600 elev-1' 
              : 'hover:bg-surface-100 text-ink-700'
            }
          `}
        >
          <span className="text-xl">🏠</span>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="type-list-heading">Home</div>
              <div className="type-list-label text-ink-400">What matters now</div>
            </div>
          )}
        </Link>
      </div>

      {/* Shortcuts Section */}
      {shortcuts.length > 0 && (
        <div className="px-4 pb-4">
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-2">
              <span className="type-list-label text-ink-400">SHORTCUTS</span>
              <button
                onClick={() => setIsPinning(!isPinning)}
                className="text-xs text-brand-500 hover:text-brand-600"
              >
                {isPinning ? 'Done' : 'Edit'}
              </button>
            </div>
          )}
          <div className="space-y-1">
            {shortcuts.map(item => (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-all duration-200
                    ${isActive(item.href)
                      ? 'glass text-brand-600'
                      : 'hover:bg-surface-100 text-ink-600'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="type-list-body">{item.label}</span>
                  )}
                </Link>
                {isPinning && !isCollapsed && (
                  <button
                    onClick={() => toggleShortcut(item)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4 text-ink-400 hover:text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Modules */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {!isCollapsed && (
          <span className="type-list-label text-ink-400 block mb-2">NAVIGATION</span>
        )}
        <nav className="space-y-1">
          {CORE_NAVIGATION.map(module => (
            <div key={module.id} className="relative">
              <Link
                href={module.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive(module.href)
                    ? 'glass text-brand-600 elev-1'
                    : 'hover:bg-surface-100 text-ink-600'
                  }
                  group
                `}
              >
                <span className="text-lg">{module.icon}</span>
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="type-list-body font-medium">{module.label}</div>
                    <div className="type-detail-caption text-ink-400">{module.description}</div>
                  </div>
                )}
                {!isCollapsed && isPinning && !isShortcut(module.id) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleShortcut(module)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4 text-ink-300 hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      {/* Collapsed State Tooltip */}
      {isCollapsed && (
        <style jsx>{`
          aside:hover .tooltip {
            opacity: 1;
            visibility: visible;
          }
        `}</style>
      )}
    </aside>
  )
}