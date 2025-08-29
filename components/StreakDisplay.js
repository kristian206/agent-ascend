'use client'
import { useState, useEffect } from 'react'
import { getUserStreakStatus } from '@/lib/streaks'
import { useAuth } from '@/components/AuthProvider'

export default function StreakDisplay() {
  const { user } = useAuth()
  const [streakData, setStreakData] = useState({
    fullStreak: 0,
    participationStreak: 0,
    displayStreak: 0,
    streakType: 'none'
  })

  useEffect(() => {
    if (user) {
      loadStreakStatus()
    }
  }, [user])

  const loadStreakStatus = async () => {
    const status = await getUserStreakStatus(user.uid)
    setStreakData(status)
  }

  if (streakData.streakType === 'none') {
    return (
      <div className="bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-700">
        <span className="text-gray-400 text-sm">No streak yet</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Main Streak Display */}
      {streakData.fullStreak > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/50">
          <span className="text-orange-400">🔥</span>
          <span className="text-sm font-bold text-orange-400">
            {streakData.fullStreak} day{streakData.fullStreak !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-orange-300">FULL</span>
        </div>
      )}
      
      {/* Participation Streak (shown if no full streak or alongside) */}
      {streakData.participationStreak > 0 && streakData.fullStreak === 0 && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50">
          <span className="text-purple-400">✨</span>
          <span className="text-sm font-bold text-purple-400">
            {streakData.participationStreak} day{streakData.participationStreak !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-purple-300">CHECK-INS</span>
        </div>
      )}
      
      {/* Show both if user has both */}
      {streakData.participationStreak > 0 && streakData.fullStreak > 0 && streakData.participationStreak > streakData.fullStreak && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <span className="text-xs text-purple-400">
            ✨ {streakData.participationStreak} participation
          </span>
        </div>
      )}
    </div>
  )
}