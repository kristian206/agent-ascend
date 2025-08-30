'use client'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import StreakDisplay from '@/components/StreakDisplay'
import { useAuth } from '@/components/AuthProvider'
import SalesLogger from '@/components/SalesLogger'

export default function Navigation({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const { userData } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return
    
    const handleClickOutside = (e) => {
      const nav = document.querySelector('.mobile-menu-container')
      const toggleButton = document.querySelector('.mobile-menu-toggle')
      if (nav && !nav.contains(e.target) && !toggleButton.contains(e.target)) {
        setIsMobileMenuOpen(false)
      }
    }
    
    // Add small delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])
  
  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const isActive = (path) => {
    return pathname === path
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '/images/icons/menu/dashboard.svg' },
    { href: '/daily-intentions', label: 'Morning', icon: '/images/icons/menu/daily-intentions.svg' },
    { href: '/nightly-wrap', label: 'Evening', icon: '/images/icons/menu/nightly-wrap.svg' },
    { href: '/team', label: 'Team', icon: '/images/icons/menu/team.svg' },
    { href: '/achievement-wall', label: 'Achievements', icon: '/images/icons/menu/achievements.svg' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '/images/icons/menu/leaderboard.svg' },
    { href: '/profile', label: 'Profile', icon: '/images/icons/menu/profile.svg' },
    ...(userData?.role === 'god' ? [
      { href: '/admin', label: 'Admin', icon: '/images/badges/streaks/gold.svg' }
    ] : [])
  ]

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50
      transition-all duration-300 ease-out
      ${isScrolled 
        ? 'bg-black/95 backdrop-blur-xl border-b border-white/10 py-3' 
        : 'bg-black border-b border-white/5 py-4'
      }
    `}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Left Section - Logo & Log Sale Button */}
          <div className="flex items-center gap-4">
            {/* Logo/Brand */}
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/images/logo/agent-ascend-logo.svg" alt="Agent Ascend" className="w-10 h-10" />
              <span className="text-xl font-bold text-white hidden sm:block">
                Agent Ascend
              </span>
            </Link>
            
            {/* Log Sale Button with SalesLogger Modal */}
            <SalesLogger />
          </div>

          {/* Center - Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2.5 rounded-xl font-medium
                  transition-all duration-200 ease-out
                  ${isActive(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                  group
                `}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className={`w-5 h-5 ${isActive(item.href) ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
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
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              {/* Level & XP */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-300">
                  Level {user?.level || 1}
                </span>
                <div className="text-xs text-blue-400 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full">
                  {user?.xp || 0} XP
                </div>
              </div>
              
              {/* User Avatar & Actions */}
              <div className="flex items-center gap-2">
                {/* God Mode Indicator */}
                {userData?.role === 'god' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all"
                    title="Admin Panel"
                  >
                    <img src="/images/badges/streaks/gold.svg" alt="Admin" className="w-4 h-4" />
                    <span className="text-xs font-bold text-white">GOD</span>
                  </Link>
                )}
                
                {/* User Avatar */}
                <img 
                  src="/images/avatars/agent-03.svg" 
                  alt="Agent Avatar" 
                  className="w-10 h-10 rounded-xl ring-2 ring-white/20"
                />
                
                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="
                    hidden sm:flex items-center gap-1.5
                    px-3 py-1.5 rounded-xl
                    text-sm font-medium text-red-400
                    bg-red-500/10 border border-red-500/20
                    hover:bg-red-500/20 hover:text-red-300
                    transition-all duration-200
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
              className="mobile-menu-toggle lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="mobile-menu-container lg:hidden mt-4 py-4 border-t border-white/20 bg-black/95 backdrop-blur-xl animate-fade-in">
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
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-black/70 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                    }
                  `}
                >
                  <img src={item.icon} alt={item.label} className="w-5 h-5 opacity-80" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
            
            {/* Mobile Sign Out */}
            <button
              onClick={handleLogout}
              className="
                sm:hidden w-full mt-3 px-4 py-3 rounded-xl
                text-sm font-medium text-red-400
                bg-red-500/10 border border-red-500/20
                hover:bg-red-500/20 hover:text-red-300
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