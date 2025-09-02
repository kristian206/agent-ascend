/**
 * Streak Display Component
 * Shows user's current streaks on the dashboard
 */

'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import streakService from '@/src/services/streakService'
import { STREAK_CONFIG } from '@/src/models/streakModels'
import { Flame, Target, TrendingUp, Calendar, Shield, AlertTriangle } from 'lucide-react'

export default function StreakDisplay() {
  const { user } = useAuth()
  const [streaks, setStreaks] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadStreaks()
    }
  }, [user])

  const loadStreaks = async () => {
    try {
      setLoading(true)
      const summary = await streakService.getStreakSummary(user.uid)
      setStreaks(summary)
    } catch (error) {
      console.error('Error loading streaks:', error)
      setError('Failed to load streaks')
    } finally {
      setLoading(false)
    }
  }

  const getStreakIcon = (type) => {
    switch (type) {
      case 'login':
        return <Flame className="w-5 h-5" />
      case 'intentions':
        return <Target className="w-5 h-5" />
      case 'sales':
        return <TrendingUp className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  const getStreakColor = (type) => {
    switch (type) {
      case 'login':
        return 'from-orange-500 to-red-500'
      case 'intentions':
        return 'from-blue-500 to-indigo-500'
      case 'sales':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getStreakBadgeColor = (count) => {
    if (count === 0) return 'bg-gray-700 text-gray-400'
    if (count < 3) return 'bg-gray-700 text-gray-300'
    if (count < 7) return 'bg-blue-900 text-blue-400'
    if (count < 14) return 'bg-purple-900 text-purple-400'
    if (count < 30) return 'bg-orange-900 text-orange-400'
    return 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  if (!streaks) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Your Streaks
        </h3>
        {streaks.perfectDays > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full border border-yellow-600/30">
            <span className="text-2xl">⭐</span>
            <span className="text-sm font-medium text-yellow-400">
              {streaks.perfectDays} Perfect {streaks.perfectDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>
        )}
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Login Streak */}
        <StreakCard
          type="login"
          config={STREAK_CONFIG.login}
          count={streaks.activeStreaks.find(s => s.type === 'login')?.count || 0}
          longestStreak={streaks.activeStreaks.find(s => s.type === 'login')?.longestStreak || 0}
          isActive={streaks.activeStreaks.some(s => s.type === 'login')}
          icon={<Flame className="w-5 h-5" />}
          gradientColor="from-orange-500 to-red-500"
        />

        {/* Intentions Streak */}
        <StreakCard
          type="intentions"
          config={STREAK_CONFIG.intentions}
          count={streaks.activeStreaks.find(s => s.type === 'intentions')?.count || 0}
          longestStreak={streaks.activeStreaks.find(s => s.type === 'intentions')?.longestStreak || 0}
          isActive={streaks.activeStreaks.some(s => s.type === 'intentions')}
          icon={<Target className="w-5 h-5" />}
          gradientColor="from-blue-500 to-indigo-500"
        />

        {/* Sales Streak */}
        <StreakCard
          type="sales"
          config={STREAK_CONFIG.sales}
          count={streaks.activeStreaks.find(s => s.type === 'sales')?.count || 0}
          longestStreak={streaks.activeStreaks.find(s => s.type === 'sales')?.longestStreak || 0}
          isActive={streaks.activeStreaks.some(s => s.type === 'sales')}
          icon={<TrendingUp className="w-5 h-5" />}
          gradientColor="from-green-500 to-emerald-500"
        />
      </div>

      {/* Motivational Message */}
      {streaks.activeStreaks.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
          <p className="text-sm text-blue-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {streaks.activeStreaks.length === 3 
              ? "All streaks active! You're on fire! 🔥"
              : `Keep going! ${3 - streaks.activeStreaks.length} more streak${3 - streaks.activeStreaks.length === 1 ? '' : 's'} to perfect day!`
            }
          </p>
        </div>
      )}

      {/* Protection Status */}
      {streaks.activeStreaks.some(s => s.isProtectedToday) && (
        <div className="mt-2 p-2 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Weekend/Holiday protection active today
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Individual Streak Card Component
 */
function StreakCard({ type, config, count, longestStreak, isActive, icon, gradientColor }) {
  const [showDetails, setShowDetails] = useState(false)

  const getMilestoneProgress = () => {
    const milestones = [3, 7, 14, 30, 60, 90, 180, 365]
    const nextMilestone = milestones.find(m => m > count) || 365
    const progress = (count / nextMilestone) * 100
    return { nextMilestone, progress }
  }

  const { nextMilestone, progress } = getMilestoneProgress()

  return (
    <div 
      className={`relative bg-gray-900 rounded-lg p-4 border transition-all cursor-pointer hover:scale-105 ${
        isActive ? 'border-gray-600' : 'border-gray-700'
      }`}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={`text-white ${!isActive && 'opacity-50'}`}>
          {icon}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isActive 
            ? 'bg-green-900 text-green-400' 
            : 'bg-gray-800 text-gray-500'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Streak Count */}
      <div className="mb-2">
        <div className={`text-3xl font-bold ${
          isActive ? 'text-white' : 'text-gray-600'
        }`}>
          {count}
        </div>
        <div className="text-xs text-gray-400">
          {config.name}
        </div>
      </div>

      {/* Progress Bar */}
      {isActive && count > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Next: {nextMilestone} days</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${gradientColor} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Details (when expanded) */}
      {showDetails && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-10">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Current:</span>
              <span className="text-white font-medium">{count} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Longest:</span>
              <span className="text-white font-medium">{longestStreak} days</span>
            </div>
            <div className="pt-1 border-t border-gray-700">
              <p className="text-gray-400">{config.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Warning if about to break */}
      {isActive && count > 0 && count < 3 && (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
            <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-20" />
          </div>
        </div>
      )}
    </div>
  )
}