'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function PersonalProgress() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    weekPoints: 0,
    weekGoal: 100,
    weekItems: 0,
    weekItemGoal: 20,
    monthPoints: 0,
    monthGoal: 400,
    monthItems: 0,
    monthItemGoal: 80,
    yearPoints: 0,
    yearGoal: 5000,
    yearItems: 0,
    yearItemGoal: 1000
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPersonalStats()
    }
  }, [user])

  const loadPersonalStats = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'members', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setStats({
          weekPoints: data.weekPoints || 0,
          weekGoal: data.weekGoal || 100,
          weekItems: data.weekSales || 0,
          weekItemGoal: data.weekItemGoal || 20,
          monthPoints: data.monthPoints || 0,
          monthGoal: data.monthGoal || 400,
          monthItems: data.monthSales || 0,
          monthItemGoal: data.monthItemGoal || 80,
          yearPoints: data.yearPoints || 0,
          yearGoal: data.yearGoal || 5000,
          yearItems: data.yearSales || 0,
          yearItemGoal: data.yearItemGoal || 1000
        })
      }
    } catch (error) {
      console.error('Error loading personal stats:', error)
    }
    setLoading(false)
  }

  const calculatePercentage = (current, goal) => {
    if (!goal) return 0
    return Math.min(Math.round((current / goal) * 100), 100)
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'from-green-500 to-emerald-500'
    if (percentage >= 75) return 'from-yellow-500 to-orange-500'
    if (percentage >= 50) return 'from-orange-500 to-red-500'
    return 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur rounded-2xl p-6 border border-blue-500/20">
        <p className="text-gray-400">Loading your progress...</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur rounded-2xl p-6 border border-blue-500/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">Your Progress</h2>
          <p className="text-sm text-gray-400">Track your personal goals</p>
        </div>
        <div className="text-2xl">📊</div>
      </div>

      <div className="space-y-6">
        {/* Weekly Progress */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">This Week</h3>
          <div className="space-y-3">
            {/* Points */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Points</span>
                <span className="text-white font-bold">
                  {stats.weekPoints}/{stats.weekGoal} ({calculatePercentage(stats.weekPoints, stats.weekGoal)}%)
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor(calculatePercentage(stats.weekPoints, stats.weekGoal))} transition-all duration-500`}
                  style={{ width: `${calculatePercentage(stats.weekPoints, stats.weekGoal)}%` }}
                />
              </div>
            </div>
            
            {/* Items */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Items Sold</span>
                <span className="text-white font-bold">
                  {stats.weekItems}/{stats.weekItemGoal} ({calculatePercentage(stats.weekItems, stats.weekItemGoal)}%)
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor(calculatePercentage(stats.weekItems, stats.weekItemGoal))} transition-all duration-500`}
                  style={{ width: `${calculatePercentage(stats.weekItems, stats.weekItemGoal)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">This Month</h3>
          <div className="space-y-3">
            {/* Points */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Points</span>
                <span className="text-white font-bold">
                  {stats.monthPoints}/{stats.monthGoal} ({calculatePercentage(stats.monthPoints, stats.monthGoal)}%)
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor(calculatePercentage(stats.monthPoints, stats.monthGoal))} transition-all duration-500`}
                  style={{ width: `${calculatePercentage(stats.monthPoints, stats.monthGoal)}%` }}
                />
              </div>
            </div>
            
            {/* Items */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Items Sold</span>
                <span className="text-white font-bold">
                  {stats.monthItems}/{stats.monthItemGoal} ({calculatePercentage(stats.monthItems, stats.monthItemGoal)}%)
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor(calculatePercentage(stats.monthItems, stats.monthItemGoal))} transition-all duration-500`}
                  style={{ width: `${calculatePercentage(stats.monthItems, stats.monthItemGoal)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Progress - Compact */}
        <div className="pt-3 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-yellow-400">
                {calculatePercentage(stats.yearPoints, stats.yearGoal)}%
              </p>
              <p className="text-xs text-gray-400">Year Points</p>
              <p className="text-xs text-gray-500">{stats.yearPoints}/{stats.yearGoal}</p>
            </div>
            <div>
              <p className="text-2xl font-black text-green-400">
                {calculatePercentage(stats.yearItems, stats.yearItemGoal)}%
              </p>
              <p className="text-xs text-gray-400">Year Items</p>
              <p className="text-xs text-gray-500">{stats.yearItems}/{stats.yearItemGoal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {stats.weekPoints >= stats.weekGoal && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400 font-semibold">
            🎉 Weekly goal achieved! Keep the momentum going!
          </p>
        </div>
      )}
    </div>
  )
}