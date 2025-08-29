'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function PerformanceChart() {
  const { user } = useAuth()
  const [chartData, setChartData] = useState([])
  const [chartType, setChartType] = useState('sales')
  const [timeRange, setTimeRange] = useState('7')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadChartData()
    }
  }, [user, chartType, timeRange])

  const loadChartData = async () => {
    setLoading(true)
    try {
      const days = parseInt(timeRange)
      const dates = []
      const data = []
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        dates.push(date)
      }

      for (const date of dates) {
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        
        let value = 0
        
        if (chartType === 'sales' || chartType === 'points') {
          const salesQuery = query(
            collection(db, 'sales'),
            where('userId', '==', user.uid),
            where('timestamp', '>=', Timestamp.fromDate(date)),
            where('timestamp', '<', Timestamp.fromDate(endDate))
          )
          
          const salesSnapshot = await getDocs(salesQuery)
          
          if (chartType === 'sales') {
            value = salesSnapshot.size
          } else {
            salesSnapshot.forEach(doc => {
              value += doc.data().points || 0
            })
          }
        } else if (chartType === 'checkins') {
          const dateStr = date.toISOString().split('T')[0]
          const checkInQuery = query(
            collection(db, 'daily_checkins'),
            where('userId', '==', user.uid),
            where('date', '==', dateStr)
          )
          
          const checkInSnapshot = await getDocs(checkInQuery)
          checkInSnapshot.forEach(doc => {
            const data = doc.data()
            if (data.morning) value += 0.5
            if (data.evening) value += 0.5
          })
        }
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value,
          fullDate: date
        })
      }

      setChartData(data)
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 1)
  const chartHeight = 200

  const getColor = () => {
    switch(chartType) {
      case 'sales': return 'from-green-500 to-emerald-500'
      case 'points': return 'from-blue-500 to-cyan-500'
      case 'checkins': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getLabel = () => {
    switch(chartType) {
      case 'sales': return 'Sales'
      case 'points': return 'Points'
      case 'checkins': return 'Check-ins'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">📈 Performance Trends</h2>
        <div className="flex gap-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
          >
            <option value="sales">Sales</option>
            <option value="points">Points</option>
            <option value="checkins">Check-ins</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
          >
            <option value="7">7 Days</option>
            <option value="14">14 Days</option>
            <option value="30">30 Days</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 text-xs text-gray-500">{maxValue}</div>
        <div className="absolute left-0 bottom-0 text-xs text-gray-500">0</div>
        
        <div className="ml-8">
          <div className="flex items-end justify-between gap-1" style={{ height: chartHeight }}>
            {chartData.map((item, index) => {
              const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0
              const isToday = index === chartData.length - 1
              
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center justify-end"
                >
                  <div className="text-xs text-gray-400 mb-1">
                    {item.value > 0 ? item.value : ''}
                  </div>
                  <div
                    className={`w-full bg-gradient-to-t ${getColor()} rounded-t transition-all duration-500 ${
                      isToday ? 'opacity-100' : 'opacity-75'
                    }`}
                    style={{ 
                      height: `${height}%`,
                      minHeight: item.value > 0 ? '4px' : '0px'
                    }}
                  />
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {chartData.filter((_, i) => i === 0 || i === chartData.length - 1 || i === Math.floor(chartData.length / 2)).map((item, index) => (
              <div key={index}>{item.date}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {chartData.reduce((sum, item) => sum + item.value, 0)}
          </div>
          <div className="text-xs text-gray-400">Total {getLabel()}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">Daily Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {Math.max(...chartData.map(d => d.value))}
          </div>
          <div className="text-xs text-gray-400">Best Day</div>
        </div>
      </div>
    </div>
  )
}