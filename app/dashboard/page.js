'use client'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import AppShell from '@/components/navigation/AppShell'
import QuickStats from '@/components/QuickStats'
import DailyCheckIn from '@/components/DailyCheckIn'
import RecentActivity from '@/components/RecentActivity'
import SalesTracker from '@/components/SalesTracker'
import PersonalProgress from '@/components/PersonalProgress'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SalesLogger from '@/components/SalesLogger'
import TeamCommissionOverview from '@/components/TeamCommissionOverview'

export default function Dashboard() {
  const { user, userData } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const searchParams = useSearchParams()
  
  // Check UI version preference (default to new UI)
  const uiVersion = searchParams.get('ui')
  const useClassicUI = uiVersion === 'v1'
  
  // Redirect to v2 dashboard if explicitly requested
  if (uiVersion === 'v2' && typeof window !== 'undefined') {
    window.location.href = '/dashboard/v2'
    return null
  }

  if (!user) return null

  // Use new UI by default, classic UI only if explicitly requested
  if (!useClassicUI) {
    return (
      <AppShell user={userData}>
        <div className="max-w-7xl mx-auto">
          {/* Hero Section - What Matters Now */}
          <header className="mb-8">
            <h1 className="type-dashboard-title text-primary mb-2">
              Welcome back, {userData?.name || 'Agent'}!
            </h1>
            <p className="type-detail-body text-secondary">
              Here&apos;s what matters today
            </p>
          </header>

          {/* Priority Cards - Instagram-style focus on action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Daily Streak Card */}
            <div className="glass radius-xl p-6 elev-1 hover:elev-2 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🔥</span>
                <span className="type-list-label text-brand-500">STREAK</span>
              </div>
              <div className="type-dashboard-metric text-primary">{userData?.streak || 0} days</div>
              <p className="type-detail-caption text-tertiary mt-2">
                Keep your momentum going!
              </p>
            </div>

            {/* Today's Points */}
            <div className="glass radius-xl p-6 elev-1 hover:elev-2 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">⚡</span>
                <span className="type-list-label text-success">TODAY</span>
              </div>
              <div className="type-dashboard-metric text-primary">{userData?.todayPoints || 0} pts</div>
              <div className="mt-2">
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
                    style={{ width: `${Math.min((userData?.todayPoints || 0) / 100 * 100, 100)}%` }}
                  />
                </div>
                <p className="type-detail-caption text-tertiary mt-1">
                  {100 - (userData?.todayPoints || 0)} pts to daily goal
                </p>
              </div>
            </div>

            {/* Quick Actions - TikTok-style prominent CTA */}
            <div className="glass-brand radius-xl p-6 elev-1 hover:elev-2 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎯</span>
                <span className="type-list-label text-ink-0">QUICK WIN</span>
              </div>
              <p className="type-list-body text-ink-0 mb-4">
                Complete your daily check-in
              </p>
              <a 
                href="/daily-intentions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors type-list-body font-medium text-white"
              >
                Start Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Sales Actions Bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            <SalesLogger onSaleLogged={() => window.location.reload()} />
            <a 
              href="/leads"
              className="glass radius-lg px-6 py-3 flex items-center gap-3 hover:scale-105 transition-all group"
            >
              <span className="text-2xl">📋</span>
              <div className="text-left">
                <div className="type-list-heading text-primary">View Leads</div>
                <div className="type-detail-caption text-secondary">Manage pipeline</div>
              </div>
              <svg className="w-5 h-5 text-ink-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <QuickStats userData={userData} />
          
          {/* Team Commission Overview - Only for Leaders */}
          {userData?.isLeader && (
            <div className="mt-8">
              <TeamCommissionOverview />
            </div>
          )}
          
          {/* Personal Progress and Sales Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <PersonalProgress />
            <SalesTracker />
          </div>
          
          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <a href="/daily-intentions" className="glass radius-xl p-6 hover:glass-brand transition-all group">
              <h3 className="type-list-heading text-primary mb-2">☀️ Morning Intentions</h3>
              <p className="type-detail-body text-secondary">Start your day with clarity and purpose</p>
              <div className="mt-4 text-brand-500 group-hover:translate-x-2 transition-transform">
                Set intentions →
              </div>
            </a>
            
            <a href="/nightly-wrap" className="glass radius-xl p-6 hover:glass-brand transition-all group">
              <h3 className="type-list-heading text-primary mb-2">🌙 Nightly Wrap</h3>
              <p className="type-detail-body text-secondary">Reflect on your wins and plan tomorrow</p>
              <div className="mt-4 text-brand-500 group-hover:translate-x-2 transition-transform">
                Complete wrap →
              </div>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <DailyCheckIn />
            <RecentActivity />
          </div>
        </div>
      </AppShell>
    )
  }

  // Original UI (fallback)
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

        {/* Sales Actions Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <SalesLogger onSaleLogged={() => window.location.reload()} />
        </div>

        <QuickStats userData={userData} />
        
        {/* Team Commission Overview - Only for Leaders */}
        {userData?.isLeader && (
          <div className="mt-8">
            <TeamCommissionOverview />
          </div>
        )}
        
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
              Complete wrap →
            </div>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <DailyCheckIn />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}