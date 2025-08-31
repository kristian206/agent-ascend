'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CORE_NAVIGATION = [
  {
    id: 'season',
    label: 'Season',
    icon: '🎯',
    href: '/season',
    description: 'Competitive ranking',
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

export default function LeftRail({ isCollapsed = false, onToggle }) {
  const pathname = usePathname()

  const isActive = (href) => pathname === href

  return (
    <aside className={`
      fixed left-0 top-16 bottom-0 z-20
      bg-black border-r border-gray-700
      transition-all duration-300 ease-out
      ${isCollapsed ? 'w-16' : 'w-64'}
      flex flex-col
    `}>
      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-gray-900 border border-gray-600 flex items-center justify-center hover:bg-gray-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className={`w-3 h-3 text-white transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Dashboard - Always visible */}
      <div className="p-4">
        <Link
          href="/dashboard"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200
            ${isActive('/dashboard') 
              ? 'bg-gray-750 text-white' 
              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }
          `}
        >
          <span className="text-xl">📊</span>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="font-medium">Dashboard</div>
              <div className="text-xs text-gray-400">Overview & stats</div>
            </div>
          )}
        </Link>
      </div>

      {/* Core Modules - No Shortcuts Section */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {!isCollapsed && (
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">Navigation</span>
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
                    ? 'bg-gray-750 text-white'
                    : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }
                  group
                `}
              >
                <span className="text-lg">{module.icon}</span>
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="font-medium">{module.label}</div>
                    <div className="text-xs text-gray-400">{module.description}</div>
                  </div>
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