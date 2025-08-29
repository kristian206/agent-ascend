'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { POLICY_TYPES } from '@/lib/sales'

export default function MetricsDashboard() {
  const { user, userData } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('week')
  const [salesData, setSalesData] = useState([])

  useEffect(() => {
    if (user) {
      loadMetrics()
    }
  }, [user, timeframe])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const now = new Date()
      let startDate = new Date()
      
      switch(timeframe) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setDate(now.getDate() - 30)
          break
        case 'quarter':
          startDate.setDate(now.getDate() - 90)
          break
        case 'year':
          startDate.setDate(now.getDate() - 365)
          break
        case 'all':
          startDate = new Date(2024, 0, 1)
          break
      }

      const salesQuery = query(
        collection(db, 'sales'),
        where('userId', '==', user.uid),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      )

      const salesSnapshot = await getDocs(salesQuery)
      const sales = []
      let totalPoints = 0
      let policyBreakdown = {
        auto: { count: 0, points: 0 },
        home: { count: 0, points: 0 },
        life: { count: 0, points: 0 },
        other: { count: 0, points: 0 }
      }

      salesSnapshot.forEach(doc => {
        const sale = doc.data()
        sales.push(sale)
        totalPoints += sale.points || 0
        
        const type = sale.type?.toLowerCase() || 'other'
        if (policyBreakdown[type]) {
          policyBreakdown[type].count++
          policyBreakdown[type].points += sale.points || 0
        }
      })

      const dailyAvg = sales.length > 0 ? 
        (sales.length / Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)))).toFixed(1) : 0

      const checkInsQuery = query(
        collection(db, 'daily_checkins'),
        where('userId', '==', user.uid),
        where('date', '>=', startDate.toISOString().split('T')[0])
      )
      
      const checkInsSnapshot = await getDocs(checkInsQuery)
      let morningCount = 0
      let eveningCount = 0
      let quotesSubmitted = 0
      let conversations = 0

      checkInsSnapshot.forEach(doc => {
        const data = doc.data()
        if (data.morning) morningCount++
        if (data.evening) eveningCount++
        quotesSubmitted += data.evening?.quotesSubmitted || 0
        conversations += data.evening?.conversations || 0
      })

      const bestDay = sales.reduce((acc, sale) => {
        const date = sale.date || new Date(sale.timestamp?.toDate()).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const bestDayEntry = Object.entries(bestDay).sort((a, b) => b[1] - a[1])[0]

      setMetrics({
        totalSales: sales.length,
        totalPoints,
        dailyAvg,
        policyBreakdown,
        morningCheckIns: morningCount,
        eveningCheckIns: eveningCount,
        quotesSubmitted,
        conversations,
        bestDay: bestDayEntry ? { date: bestDayEntry[0], count: bestDayEntry[1] } : null,
        conversionRate: conversations > 0 ? ((sales.length / conversations) * 100).toFixed(1) : 0
      })

      setSalesData(sales)
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Policy Type', 'Customer Name', 'Points']
    const rows = salesData.map(sale => {
      const date = sale.timestamp?.toDate() || new Date()
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        sale.type,
        sale.customerName || 'N/A',
        sale.points
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">📊 Metrics Dashboard</h2>
        <div className="flex gap-2">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
          <div className="text-sm text-gray-400 mb-1">Total Sales</div>
          <div className="text-3xl font-black text-green-400">{metrics?.totalSales || 0}</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.dailyAvg || 0} per day avg
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
          <div className="text-sm text-gray-400 mb-1">Total Points</div>
          <div className="text-3xl font-black text-blue-400">{metrics?.totalPoints || 0}</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.totalSales > 0 ? (metrics.totalPoints / metrics.totalSales).toFixed(1) : 0} avg per sale
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
          <div className="text-sm text-gray-400 mb-1">Conversion Rate</div>
          <div className="text-3xl font-black text-purple-400">{metrics?.conversionRate || 0}%</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.totalSales || 0} sales / {metrics?.conversations || 0} conversations
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
          <div className="text-sm text-gray-400 mb-1">Check-ins</div>
          <div className="text-3xl font-black text-yellow-400">
            {metrics?.morningCheckIns || 0} / {metrics?.eveningCheckIns || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Morning / Evening</div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-4 rounded-xl border border-red-500/30">
          <div className="text-sm text-gray-400 mb-1">Quotes Submitted</div>
          <div className="text-3xl font-black text-red-400">{metrics?.quotesSubmitted || 0}</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.eveningCheckIns > 0 ? (metrics.quotesSubmitted / metrics.eveningCheckIns).toFixed(1) : 0} per day avg
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 p-4 rounded-xl border border-indigo-500/30">
          <div className="text-sm text-gray-400 mb-1">Best Day</div>
          <div className="text-3xl font-black text-indigo-400">
            {metrics?.bestDay?.count || 0} sales
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.bestDay?.date ? new Date(metrics.bestDay.date).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Policy Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(POLICY_TYPES).map(([key, type]) => {
            const data = metrics?.policyBreakdown[key.toLowerCase()] || { count: 0, points: 0 }
            const percentage = metrics?.totalSales > 0 ? 
              ((data.count / metrics.totalSales) * 100).toFixed(0) : 0
            
            return (
              <div key={key} className="text-center">
                <div className="text-2xl mb-1">{type.emoji}</div>
                <div className="text-sm text-gray-400">{type.label}</div>
                <div className="text-xl font-bold text-white">{data.count}</div>
                <div className="text-xs text-gray-500">{percentage}% of sales</div>
                <div className="text-xs text-gray-500">{data.points} pts</div>
              </div>
            )
          })}
        </div>
      </div>

      {salesData.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl p-4">
          <h3 className="text-lg font-bold text-white mb-4">Recent Sales</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {salesData.slice(0, 10).map((sale, index) => (
              <div key={sale.id || index} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {POLICY_TYPES[sale.type?.toUpperCase()]?.emoji || '📋'}
                  </span>
                  <div>
                    <div className="text-white text-sm">
                      {sale.customerName || 'Customer'} 
                    </div>
                    <div className="text-xs text-gray-500">
                      {sale.timestamp?.toDate ? sale.timestamp.toDate().toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">
                  +{sale.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}