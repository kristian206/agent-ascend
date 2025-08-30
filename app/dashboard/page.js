'use client'
import { useAuth } from '@/components/AuthProvider'
import PageLayout from '@/components/PageLayout'
import QuickStats from '@/components/QuickStats'
import RecentActivity from '@/components/RecentActivity'
import SalesTracker from '@/components/SalesTracker'
import PersonalProgress from '@/components/PersonalProgress'
// Removed unused useState import
import { useSearchParams } from 'next/navigation'
import SalesLogger from '@/components/SalesLogger'
import TeamCommissionOverview from '@/components/TeamCommissionOverview'

export default function Dashboard() {
  const { user, userData } = useAuth()
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

  // Use PageLayout which handles both UI versions
  return (
    <PageLayout user={userData}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
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
          
          <div className="mt-8">
            <RecentActivity />
          </div>
      </div>
    </PageLayout>
  )
}