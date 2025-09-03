'use client'
import { useCallback, useMemo, useReducer } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRealtimeUser } from '@/src/hooks/useRealtimeUser'
import PageLayout from '@/src/components/layout/PageLayout'
import QuickStats from '@/src/components/dashboard/QuickStats'
import PasswordMigration from '@/src/components/auth/PasswordMigration'
import StreakDisplay from '@/src/components/dashboard/StreakDisplay'

// Lazy load heavy components
const UserBanner = dynamic(() => import('@/src/components/banner/UserBanner'), {
  loading: () => <div className="h-32 bg-gray-800 rounded-xl animate-pulse" />
})

const RecentActivity = dynamic(() => import('@/src/components/dashboard/RecentActivity'), {
  loading: () => <div className="h-64 bg-gray-800 rounded-xl animate-pulse" />
})

const PersonalProgress = dynamic(() => import('@/src/components/dashboard/PersonalProgress'))
const TeamCommissionOverview = dynamic(() => import('@/src/components/team/TeamCommissionOverview'))

// Dashboard state reducer for complex state
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_DATA':
      return { ...state, ...action.payload, loading: false }
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } }
    default:
      return state
  }
}

export default function DashboardClient({ initialData, userId }) {
  const { userData, isRealtime } = useRealtimeUser()
  const [state, dispatch] = useReducer(dashboardReducer, {
    loading: false,
    ...initialData
  })
  
  // Memoized values to prevent re-renders
  const displayData = useMemo(() => userData || initialData?.userData, [userData, initialData])
  
  // Memoized callbacks
  const handleBannerClick = useCallback(() => {
    // Navigation logic
  }, [])
  
  return (
    <PageLayout user={displayData}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Password Migration - Only if needed */}
        {displayData?.needsPasswordMigration && (
          <PasswordMigration user={{ uid: userId }} />
        )}
        
        {/* ROW 1 - BANNERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UserBanner 
            user={{ uid: userId }}
            userData={displayData} 
            variant="compact"
            showCheer={false}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
          />
          
          <TeamBanner teamData={state.teamData} />
        </div>

        {/* ROW 2 - QUICK STATS */}
        <QuickStatsOptimized userData={displayData} />

        {/* ROW 3 - STREAKS */}
        <div className="mb-8">
          <StreakDisplay />
        </div>

        {/* ROW 4 - PROGRESS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PersonalProgress />
          <CommissionTracker userData={displayData} />
        </div>
        
        {/* Team Overview - Conditional */}
        {displayData?.isLeader && (
          <div className="mb-8">
            <TeamCommissionOverview />
          </div>
        )}

        {/* ROW 5 - ACTIVITY */}
        <RecentActivity expanded={true} />
      </div>
    </PageLayout>
  )
}

// Optimized Quick Stats with memo
const QuickStatsOptimized = ({ userData }) => {
  const stats = useMemo(() => ({
    todayPoints: userData?.todayPoints || 0,
    seasonPoints: userData?.seasonPoints || 0,
    achievements: userData?.achievements?.length || 0,
    seasonRank: userData?.seasonRank || '—'
  }), [userData])
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard title="Today" value={stats.todayPoints} icon="📊" />
      <StatCard title="Season" value={stats.seasonPoints} icon="🏆" rank={stats.seasonRank} />
      <StatCard title="Achievements" value={stats.achievements} icon="🎯" />
    </div>
  )
}

const StatCard = ({ title, value, icon, rank }) => (
  <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs text-gray-400 uppercase tracking-wider">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold text-white mb-2">{value}</div>
    {rank && <div className="text-xs text-green-400">Rank #{rank}</div>}
  </div>
)

const TeamBanner = ({ teamData }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-white">Team Performance</h3>
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {teamData?.name || 'No Team'}
      </span>
    </div>
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-300">Team Rank</span>
        <span className="text-xl font-bold text-blue-400">#{teamData?.rank || '—'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-300">Total Points</span>
        <span className="text-xl font-bold text-green-400">{teamData?.points || 0}</span>
      </div>
      <Link href="/team" className="mt-4 text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1">
        View Team →
      </Link>
    </div>
  </div>
)

const CommissionTracker = ({ userData }) => (
  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-black text-white">Commission Tracker</h2>
        <p className="text-sm text-gray-300">Monthly totals</p>
      </div>
      <div className="text-2xl">💰</div>
    </div>
    
    <div className="space-y-4">
      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">This Month</span>
          <span className="text-xs text-green-400">+{userData?.monthSales || 0} sales</span>
        </div>
        <div className="text-2xl font-bold text-white">
          ${userData?.monthCommission || 0}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Year to Date</span>
          <span className="text-xl font-bold text-blue-400">
            ${userData?.yearCommission || 0}
          </span>
        </div>
      </div>
    </div>
  </div>
)