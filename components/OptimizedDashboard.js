'use client'
import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, getDoc, limit, orderBy } from 'firebase/firestore'
import { withCache } from '@/lib/cache'
import { withRetry, getUserMessage } from '@/lib/errorHandler'
import { canRefreshDashboard } from '@/lib/rateLimiter'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'

const CACHE_TTL = 2 * 60 * 1000 // 2 minutes for dashboard data

// Memoized metric card component
const MetricCard = memo(({ title, value, icon, trend, color = 'primary' }) => {
  return (
    <div className="glass radius-lg p-6 elev-1 hover:elev-2 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="type-list-label text-secondary mb-2">{title}</p>
          <p className={`type-dashboard-metric text-${color}`}>{value}</p>
          {trend !== undefined && (
            <p className={`type-detail-caption mt-2 ${trend >= 0 ? 'text-success' : 'text-error'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return prevProps.value === nextProps.value && 
         prevProps.trend === nextProps.trend
})

// Memoized activity item component
const ActivityItem = memo(({ activity }) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'sale': return '💰'
      case 'lead': return '👤'
      case 'follow_up': return '📞'
      case 'achievement': return '🏆'
      default: return '📋'
    }
  }

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-surface-50 rounded-lg transition-colors">
      <span className="text-2xl">{getActivityIcon(activity.type)}</span>
      <div className="flex-1">
        <p className="type-list-body text-primary">{activity.description}</p>
        <p className="type-detail-caption text-tertiary">
          {activity.timestamp?.toDate?.()?.toLocaleTimeString() || 'Just now'}
        </p>
      </div>
    </div>
  )
})

// Main dashboard component
export default function OptimizedDashboard() {
  const { user, userData } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Load dashboard data with caching
  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.uid) return

    // Check rate limit for refresh
    if (forceRefresh) {
      const rateLimit = canRefreshDashboard(user.uid)
      if (!rateLimit.allowed) {
        const seconds = Math.ceil(rateLimit.resetIn / 1000)
        setError(`Please wait ${seconds} seconds before refreshing again`)
        return
      }
    }

    setIsRefreshing(forceRefresh)
    if (!forceRefresh) setIsLoading(true)
    setError(null)

    try {
      const cacheKey = `dashboard_${user.uid}_${new Date().toISOString().slice(0, 10)}`
      
      const data = await withCache(
        forceRefresh ? null : cacheKey, // Skip cache if force refresh
        async () => {
          return await withRetry(async () => {
            const today = new Date().toISOString().split('T')[0]
            const currentMonth = new Date().toISOString().slice(0, 7)

            // Try to load from denormalized daily metrics first
            const dailyMetricsRef = doc(db, 'dailyMetrics', `${user.uid}_${today}`)
            const dailyMetricsDoc = await getDoc(dailyMetricsRef)
            
            let dashboardMetrics = {}
            
            if (dailyMetricsDoc.exists()) {
              // Use pre-aggregated data (fast)
              const dailyData = dailyMetricsDoc.data()
              dashboardMetrics = {
                salesToday: dailyData.salesToday || 0,
                commissionsToday: dailyData.commissionEarned || 0,
                leadsConverted: dailyData.leadsConverted || 0,
                activitiesCompleted: dailyData.activitiesCompleted || 0,
                pointsToday: dailyData.pointsEarned || 0
              }
            } else {
              // Fallback to calculating from raw data (slower)
              // Load today's sales
              const salesQuery = query(
                collection(db, 'sales'),
                where('userId', '==', user.uid),
                where('date', '==', today),
                limit(100)
              )
              const salesSnapshot = await getDocs(salesQuery)
              
              let totalCommission = 0
              salesSnapshot.forEach(doc => {
                const sale = doc.data()
                totalCommission += sale.totalCommission || 0
              })
              
              dashboardMetrics = {
                salesToday: salesSnapshot.size,
                commissionsToday: totalCommission,
                leadsConverted: 0, // Would need separate query
                activitiesCompleted: 0, // Would need separate query
                pointsToday: userData?.dailyPoints || 0
              }
            }

            // Load monthly totals from denormalized data
            const monthlyTotalRef = doc(db, 'monthlyTotals', `${user.uid}_${currentMonth}`)
            const monthlyTotalDoc = await getDoc(monthlyTotalRef)
            
            if (monthlyTotalDoc.exists()) {
              const monthlyData = monthlyTotalDoc.data()
              dashboardMetrics.monthlyCommission = monthlyData.totalCommission || 0
              dashboardMetrics.monthlyRevenue = monthlyData.totalRevenue || 0
              dashboardMetrics.monthlySales = monthlyData.salesCount || 0
            }

            // Load recent activities
            const activitiesQuery = query(
              collection(db, 'activities'),
              where('userId', '==', user.uid),
              orderBy('timestamp', 'desc'),
              limit(5)
            )
            const activitiesSnapshot = await getDocs(activitiesQuery)
            const recentActivities = []
            activitiesSnapshot.forEach(doc => {
              recentActivities.push({ id: doc.id, ...doc.data() })
            })

            return {
              metrics: dashboardMetrics,
              activities: recentActivities,
              userData: userData || {}
            }
          }, 3, 1000)
        },
        forceRefresh ? 0 : CACHE_TTL
      )

      setMetrics(data.metrics)
      setActivities(data.activities)
      setLastRefresh(new Date())
      
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError(getUserMessage(err))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [user, userData])

  // Initial load
  useEffect(() => {
    loadDashboardData()
  }, [user?.uid])

  // Memoized calculations
  const monthlyGoalProgress = useMemo(() => {
    if (!metrics?.monthlyCommission) return 0
    const goal = userData?.monthlyGoal || 10000
    return Math.min(100, Math.round((metrics.monthlyCommission / goal) * 100))
  }, [metrics?.monthlyCommission, userData?.monthlyGoal])

  const conversionRate = useMemo(() => {
    if (!metrics?.leadsConverted || !userData?.totalLeads) return 0
    return Math.round((metrics.leadsConverted / userData.totalLeads) * 100)
  }, [metrics?.leadsConverted, userData?.totalLeads])

  // Handlers
  const handleRefresh = useCallback(() => {
    loadDashboardData(true)
  }, [loadDashboardData])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} height="120px" />
          ))}
        </div>
        <SkeletonCard height="300px" />
      </div>
    )
  }

  return (
    <ErrorBoundary area="dashboard">
      <div className="space-y-6">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="type-dashboard-title text-primary">Dashboard</h1>
            <p className="type-detail-body text-secondary mt-1">
              Welcome back, {userData?.name || 'Agent'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-lg glass hover:bg-surface-100 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full"></span>
                Refreshing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                🔄 Refresh
              </span>
            )}
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Monthly Goal"
            value={`${monthlyGoalProgress}%`}
            icon="🎯"
            trend={monthlyGoalProgress > 50 ? 10 : -5}
            color="brand-600"
          />
          <MetricCard
            title="Sales Today"
            value={metrics?.salesToday || 0}
            icon="💰"
            color="success"
          />
          <MetricCard
            title="Commission Today"
            value={`$${metrics?.commissionsToday || 0}`}
            icon="💵"
            color="success"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            icon="📈"
            trend={conversionRate > 20 ? 5 : -3}
          />
        </div>

        {/* Activity Feed */}
        <div className="glass radius-xl p-6 elev-1">
          <h2 className="type-list-heading text-primary mb-4">Recent Activity</h2>
          {activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-ink-400">No recent activity</p>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="glass radius-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="type-list-body text-primary">
                {userData?.streak || 0} day streak
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="type-list-body text-primary">
                Level {userData?.level || 1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="type-list-body text-primary">
                {userData?.lifetimePoints || 0} points
              </span>
            </div>
          </div>
          <p className="type-detail-caption text-tertiary">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Export memoized version
export const MemoizedDashboard = memo(OptimizedDashboard)