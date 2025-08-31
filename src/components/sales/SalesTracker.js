'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { SkeletonStats, SkeletonListItem } from '@/src/components/common/Skeleton'
import ErrorBoundary from '@/src/components/common/ErrorBoundary'
// SalesLogger component is opened from parent

export default function SalesTracker() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    todayCommission: 0,
    todayRevenue: 0,
    todaySales: 0,
    monthCommission: 0,
    monthRevenue: 0,
    monthSales: 0,
    weekCommission: 0
  })
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const month = new Date().toISOString().slice(0, 7)
      
      // Get week start date (Sunday)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      // Query user's sales
      const salesQuery = query(
        collection(db, 'sales'),
        where('userId', '==', user.uid)
      )
      const salesSnapshot = await getDocs(salesQuery)
      
      let todayCommission = 0
      let todayRevenue = 0
      let todaySales = 0
      let monthCommission = 0
      let monthRevenue = 0
      let monthSales = 0
      let weekCommission = 0
      const recent = []
      
      salesSnapshot.forEach(doc => {
        const sale = { id: doc.id, ...doc.data() }
        
        // Month stats
        if (sale.month === month) {
          monthCommission += sale.totalCommission || 0
          monthRevenue += sale.totalRevenue || 0
          monthSales++
          
          // Today stats
          if (sale.date === today) {
            todayCommission += sale.totalCommission || 0
            todayRevenue += sale.totalRevenue || 0
            todaySales++
          }
          
          // Week stats
          const saleDate = new Date(sale.date)
          if (saleDate >= weekStart) {
            weekCommission += sale.totalCommission || 0
          }
          
          recent.push(sale)
        }
      })
      
      // Sort recent sales by timestamp
      recent.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
        return timeB - timeA
      })
      
      setStats({
        todayCommission,
        todayRevenue,
        todaySales,
        monthCommission,
        monthRevenue,
        monthSales,
        weekCommission
      })
      setRecentSales(recent.slice(0, 5)) // Show last 5 sales
      
    } catch (error) {
      // Handle Firestore index errors gracefully
      if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        // Firestore index is being created. Sales data will be available soon.
      }
      // Set default empty state on error
      setStats({
        todayCommission: 0,
        todayRevenue: 0,
        todaySales: 0,
        monthCommission: 0,
        monthRevenue: 0,
        monthSales: 0,
        weekCommission: 0
      })
      setRecentSales([])
    }
    setLoading(false)
  }

  // Sales logging handled by parent component

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="glass radius-xl p-6 elev-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="type-dashboard-title text-primary flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Commission Tracker
          </h2>
          <p className="type-detail-body text-gray-300 mt-1">
            Track your earnings and performance
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      {loading ? (
        <div>
          {/* Loading Skeletons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <SkeletonStats key={i} />
            ))}
          </div>
          <div className="space-y-3">
            <h3 className="type-list-heading text-primary mb-3">Recent Sales</h3>
            {[1, 2, 3].map(i => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Today's Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass radius-lg p-4 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="type-list-label text-gray-300">TODAY</span>
                <span className="text-xl">📅</span>
              </div>
              <div className="type-dashboard-metric text-success">${stats.todayCommission}</div>
              <div className="type-detail-caption text-gray-400">
                {stats.todaySales} {stats.todaySales === 1 ? 'sale' : 'sales'} • ${stats.todayRevenue} revenue
              </div>
            </div>
            
            <div className="glass radius-lg p-4 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="type-list-label text-gray-300">THIS WEEK</span>
                <span className="text-xl">📊</span>
              </div>
              <div className="type-dashboard-metric text-brand-600">${stats.weekCommission}</div>
              <div className="type-detail-caption text-gray-400">
                ${Math.round(stats.weekCommission / 7)} daily avg
              </div>
            </div>
            
            <div className="glass radius-lg p-4 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="type-list-label text-gray-300">THIS MONTH</span>
                <span className="text-xl">📈</span>
              </div>
              <div className="type-dashboard-metric text-primary">${stats.monthCommission}</div>
              <div className="type-detail-caption text-gray-400">
                {stats.monthSales} total sales
              </div>
            </div>
          </div>
          
          {/* Month Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="type-list-body text-gray-300">Monthly Goal Progress</p>
              <p className="type-list-body font-medium text-primary">
                ${stats.monthCommission} / $5,000
              </p>
            </div>
            <div className="h-3 bg-gray-750 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
                style={{ width: `${Math.min((stats.monthCommission / 5000) * 100, 100)}%` }}
              />
            </div>
            {stats.monthCommission >= 5000 && (
              <p className="type-detail-caption text-success mt-2">
                🎉 Monthly goal achieved! Keep pushing!
              </p>
            )}
          </div>
          
          {/* Recent Sales */}
          {recentSales && recentSales.length > 0 && (
            <div>
              <h3 className="type-list-heading text-primary mb-3">Recent Sales</h3>
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <div
                    key={sale?.id || Math.random()}
                    className="flex items-center justify-between glass radius-lg p-3 border border-ink-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💼</span>
                      <div>
                        <span className="type-list-body text-primary">
                          {sale?.clientFirstName || 'Client'} - {sale?.productsSummary || 'Product'}
                        </span>
                        <div className="type-detail-caption text-success">
                          ${sale?.totalCommission || 0} commission
                        </div>
                      </div>
                    </div>
                    <span className="type-detail-caption text-gray-400">
                      {formatTime(sale?.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {stats.todaySales === 0 && (
            <div className="text-center py-6 border-t border-ink-100 mt-6">
              <span className="text-3xl mb-3 block">🎯</span>
              <p className="type-list-body text-gray-300">
                No sales logged today yet
              </p>
              <p className="type-detail-caption text-gray-400 mt-1">
                Log your first sale to start tracking commissions!
              </p>
            </div>
          )}
          
          {/* Motivational Messages */}
          {stats.todaySales > 0 && stats.todaySales < 5 && (
            <div className="text-center py-4 border-t border-ink-100 mt-6">
              <p className="type-list-body text-brand-600">
                Great start! {stats.todaySales} {stats.todaySales === 1 ? 'sale' : 'sales'} today. Keep the momentum going! 🔥
              </p>
            </div>
          )}
          
          {stats.todaySales >= 5 && (
            <div className="text-center py-4 border-t border-ink-100 mt-6">
              <p className="type-list-body text-success font-semibold">
                🏆 Outstanding! {stats.todaySales} sales today! You&apos;re crushing it!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}