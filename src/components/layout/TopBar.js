'use client'
import { useState } from 'react'
import Link from 'next/link'
import NotificationBell from '@/src/components/notifications/NotificationBell'
import SalesLogger from '@/src/components/sales/SalesLogger'
// CommandPalette is opened via parent component
// Theme toggles removed - always dark mode
import { signOut } from 'firebase/auth'
import { auth } from '@/src/services/firebase'
import { useRouter } from 'next/navigation'

export default function TopBar({ user, onOpenCommand }) {
  const router = useRouter()
  const [showProfile, setShowProfile] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-gray-900 border-b border-gray-700">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-semibold text-white hidden sm:block">
              Agency Max+
            </span>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-xl mx-8">
          <button
            onClick={onOpenCommand}
            className="w-full max-w-md mx-auto flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 border border-gray-700 transition-all group"
          >
            <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-gray-400 flex-1 text-left">
              Search or press ⌘K
            </span>
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-gray-900 text-xs text-gray-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Log Sale Button */}
          <SalesLogger />
          
          {/* Help */}
          <div className="relative">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Help"
            >
              <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {showHelp && (
              <div className="absolute right-0 top-12 w-64 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-3">Quick Help</h3>
                <div className="space-y-2">
                  <a href="#" className="block p-2 rounded hover:bg-gray-700 text-gray-300">
                    📚 Documentation
                  </a>
                  <a href="#" className="block p-2 rounded hover:bg-gray-700 text-gray-300">
                    🎥 Video Tutorials
                  </a>
                  <a href="#" className="block p-2 rounded hover:bg-gray-700 text-gray-300">
                    💬 Contact Support
                  </a>
                  <div className="pt-2 mt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-400">
                      Keyboard Shortcuts:
                    </div>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>Search</span>
                        <kbd className="px-1 rounded bg-gray-900">⌘K</kbd>
                      </div>
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>Create</span>
                        <kbd className="px-1 rounded bg-gray-900">⌘N</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {/* User Info */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {user?.name || 'Agent'}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {user?.userId || '------'} • Level {user?.level || 1} • {user?.xp || 0} XP
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 text-center p-2 bg-gray-900 rounded-md">
                      <div className="text-xl font-bold text-blue-400">{user?.streak || 0}</div>
                      <div className="text-xs text-gray-400">Streak</div>
                    </div>
                    <div className="flex-1 text-center p-2 bg-gray-900 rounded-md">
                      <div className="text-xl font-bold text-blue-400">{user?.todayPoints || 0}</div>
                      <div className="text-xs text-gray-400">Today</div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link href="/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300">
                    👤 My Profile
                  </Link>
                  <a href="/settings" className="block px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300">
                    ⚙️ Settings
                  </a>
                  <a href="/achievement-wall" className="block px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300">
                    🏆 Achievements
                  </a>
                  <div className="my-2 border-t border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}