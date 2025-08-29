'use client'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'

export default function Navigation({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const isActive = (path) => {
    return pathname === path
  }

  return (
    <nav className="bg-black/50 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-2">
          <Link 
            href="/dashboard" 
            className={`px-4 py-2 rounded-lg font-bold transition ${
              isActive('/dashboard') 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/daily-intentions" 
            className={`px-4 py-2 rounded-lg font-bold transition ${
              isActive('/daily-intentions') 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Morning ☀️
          </Link>
          <Link 
            href="/nightly-wrap" 
            className={`px-4 py-2 rounded-lg font-bold transition ${
              isActive('/nightly-wrap') 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Evening 🌙
          </Link>
          <Link 
            href="/team" 
            className={`px-4 py-2 rounded-lg font-bold transition ${
              isActive('/team') 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Team
          </Link>
          <Link 
            href="/leaderboard" 
            className={`px-4 py-2 rounded-lg font-bold transition ${
              isActive('/leaderboard') 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Leaderboard
          </Link>
          <Link 
            href="/profile" 
            className={`px-4 py-2 rounded-lg font-bold transition ${
              isActive('/profile') 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Profile
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell />
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/50">
            <span className="text-orange-400">🔥</span>
            <span className="text-sm font-bold text-orange-400">{user?.streak || 0} day streak</span>
          </div>
          
          <span className="text-sm text-gray-400">
            Level {user?.level || 1}
          </span>
          
          <button
            onClick={handleLogout}
            className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/30 transition border border-red-500/50 text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}