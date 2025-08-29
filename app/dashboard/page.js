'use client'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import QuickStats from '@/components/QuickStats'
import DailyCheckIn from '@/components/DailyCheckIn'
import RecentActivity from '@/components/RecentActivity'
import SalesTracker from '@/components/SalesTracker'
import PersonalProgress from '@/components/PersonalProgress'
import { useState } from 'react'

export default function Dashboard() {
  const { user, userData } = useAuth()
  const [activeTab, setActiveTab] = useState('home')

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navigation user={userData} />
      
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-black text-white">
            Welcome back, {userData?.name || 'Agent'}!
          </h1>
          <p className="text-gray-400 mt-1">
            Level {userData?.level || 1} • {userData?.xp || 0} XP
          </p>
        </header>

        <QuickStats userData={userData} />
        
        {/* Personal Progress and Sales Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <PersonalProgress />
          <SalesTracker />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <a href="/daily-intentions" className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/50 transition group">
            <h3 className="text-xl font-bold text-white mb-2">☀️ Morning Intentions</h3>
            <p className="text-gray-400">Start your day with clarity and purpose</p>
            <div className="mt-4 text-yellow-400 group-hover:translate-x-2 transition-transform">
              Set intentions →
            </div>
          </a>
          
          <a href="/nightly-wrap" className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition group">
            <h3 className="text-xl font-bold text-white mb-2">🌙 Nightly Wrap</h3>
            <p className="text-gray-400">Reflect on your wins and plan tomorrow</p>
            <div className="mt-4 text-purple-400 group-hover:translate-x-2 transition-transform">
              Complete your day →
            </div>
          </a>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <DailyCheckIn />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}