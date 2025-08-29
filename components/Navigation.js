'use client'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import StreakDisplay from '@/components/StreakDisplay'

export default function Navigation({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const isActive = (path) => {
    return pathname === path
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/daily-intentions', label: 'Morning', icon: '☀️' },
    { href: '/nightly-wrap', label: 'Evening', icon: '🌙' },
    { href: '/team', label: 'Team', icon: '👥' },
    { href: '/achievement-wall', label: 'Achievements', icon: '🏆' },
    { href: '/metrics', label: 'Analytics', icon: '📊' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-sticky
      transition-all duration-300 ease-out
      ${isScrolled 
        ? 'glass-strong shadow-elevation-medium py-3' 
        : 'glass py-4'
      }
    `}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-title-2 font-bold text-primary-900 hidden sm:block">
              Agent Ascend
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2.5 rounded-xl font-medium
                  transition-all duration-200 ease-out
                  ${isActive(item.href)
                    ? 'text-primary-600'
                    : 'text-text-secondary hover:text-primary-500'
                  }
                  ${isActive(item.href) ? 'glass' : 'hover:glass-subtle'}
                  group
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <NotificationBell />
            </div>
            
            {/* Streak Display */}
            <div className="hidden sm:block">
              <StreakDisplay />
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-subtle">
                <div className="w-2 h-2 bg-success-light rounded-full animate-pulse" />
                <span className="text-sm font-medium text-text-secondary">
                  Level {user?.level || 1}
                </span>
                <div className="text-xs text-primary-600 font-bold bg-primary-100/50 px-2 py-0.5 rounded-full">
                  {user?.xp || 0} XP
                </div>
              </div>
              
              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="
                    hidden sm:flex items-center gap-1.5
                    px-3 py-1.5 rounded-xl
                    text-sm font-medium text-error-dark
                    glass-subtle hover:glass
                    transition-all duration-200
                    hover:shadow-elevation-low
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl glass-subtle hover:glass transition-all"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-primary-200/20 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl
                    font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'glass text-primary-600 shadow-elevation-low'
                      : 'glass-subtle text-text-secondary hover:glass hover:text-primary-500'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
            
            {/* Mobile Sign Out */}
            <button
              onClick={handleLogout}
              className="
                sm:hidden w-full mt-3 px-4 py-3 rounded-xl
                text-sm font-medium text-error-dark
                glass-subtle hover:glass
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}