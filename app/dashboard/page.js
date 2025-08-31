'use client'
import { useAuth } from '@/src/components/auth/AuthProvider'
import PageLayout from '@/src/components/layout/PageLayout'
import QuickStats from '@/src/components/dashboard/QuickStats'
import RecentActivity from '@/src/components/dashboard/RecentActivity'
import SalesTracker from '@/src/components/sales/SalesTracker'
import PersonalProgress from '@/src/components/dashboard/PersonalProgress'
import SalesLogger from '@/src/components/sales/SalesLogger'
import TeamCommissionOverview from '@/src/components/team/TeamCommissionOverview'
import PasswordMigration from '@/src/components/auth/PasswordMigration'

export default function Dashboard() {
  const { user, userData } = useAuth()

  if (!user) return null

  return (
    <PageLayout user={userData}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Password Migration Banner */}
          <PasswordMigration 
            user={user} 
            onComplete={() => {
              // Password updated successfully
            }}
            onDismiss={() => {
              // Password update dismissed
            }}
          />
          {/* Hero Section - What Matters Now */}
          <header className="mb-8">
            <h1 className="type-dashboard-title text-primary mb-2">
              Welcome back, {userData?.name || 'Agent'}!
            </h1>
            <p className="type-detail-body text-gray-300">
              Here&apos;s what matters today
            </p>
          </header>

          {/* Priority Cards - Instagram-style focus on action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Daily Streak Card */}
            <div className="bg-gray-800 border border-gray-700 p-6 hover:scale-105 transition-all bg-[url('/images/bg/noise.svg')]">
              <div className="flex items-center justify-between mb-4">
                <img src="/images/badges/star.svg" alt="Streak" className="w-8 h-8" />
                <span className="type-list-label text-brand-500">STREAK</span>
              </div>
              <div className="type-dashboard-metric text-primary">{userData?.streak || 0} days</div>
              <p className="type-detail-caption text-gray-400 mt-2">
                Keep your momentum going!
              </p>
            </div>

            {/* Today's Points */}
            <div className="bg-gray-800 border border-gray-700 p-6 hover:scale-105 transition-all bg-[url('/images/bg/noise.svg')]">
              <div className="flex items-center justify-between mb-4">
                <img src="/images/badges/trophy.svg" alt="Points" className="w-8 h-8" />
                <span className="type-list-label text-success">TODAY</span>
              </div>
              <div className="type-dashboard-metric text-primary">{userData?.todayPoints || 0} pts</div>
              <div className="mt-2">
                <div className="h-2 bg-gray-750 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
                    style={{ width: `${Math.min((userData?.todayPoints || 0) / 100 * 100, 100)}%` }}
                  />
                </div>
                <p className="type-detail-caption text-gray-400 mt-1">
                  {100 - (userData?.todayPoints || 0)} pts to daily goal
                </p>
              </div>
            </div>

            {/* Quick Actions - High Contrast CTA */}
            <div className="relative p-6 rounded-2xl overflow-hidden hover:scale-105 transition-all liquid-stroke" style={{ backgroundImage: "url('/images/ui/cta-bg.svg')", backgroundSize: "cover" }}>
              <div className="flex items-center justify-between mb-4">
                <img src="/images/badges/shield.svg" alt="Quick Win" className="w-8 h-8" />
                <span className="text-xs font-bold text-white/90 uppercase tracking-wider">QUICK WIN</span>
              </div>
              <p className="text-white font-medium text-lg mb-4">
                Complete your daily check-in
              </p>
              <a 
                href="/daily-intentions"
                className="liquid-stroke inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-650 transition-all font-semibold text-white"
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
            <a href="/daily-intentions" className="bg-gray-800 border border-gray-700 p-6 hover:scale-105 transition-all group bg-[url('/images/bg/noise.svg')]">
              <h3 className="type-list-heading text-primary mb-2 flex items-center gap-2">
                <img src="/images/icons/menu/daily-intentions.svg" alt="Morning" className="w-5 h-5" />
                Morning Intentions
              </h3>
              <p className="type-detail-body text-gray-300">Start your day with clarity and purpose</p>
              <div className="mt-4 text-brand-500 group-hover:translate-x-2 transition-transform">
                Set intentions →
              </div>
            </a>
            
            <a href="/nightly-wrap" className="bg-gray-800 border border-gray-700 p-6 hover:scale-105 transition-all group bg-[url('/images/bg/noise.svg')]">
              <h3 className="type-list-heading text-primary mb-2 flex items-center gap-2">
                <img src="/images/icons/menu/nightly-wrap.svg" alt="Evening" className="w-5 h-5" />
                Nightly Wrap
              </h3>
              <p className="type-detail-body text-gray-300">Reflect on your wins and plan tomorrow</p>
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