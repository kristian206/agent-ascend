'use client'
import { useState, useEffect, useCallback } from 'react'
import { getTeamStats } from '@/src/utils/teamUtils'

export default function TeamStats({ teamId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [teamId, loadStats])

  const loadStats = useCallback(async () => {
    setLoading(true)
    const teamStats = await getTeamStats(teamId)
    setStats(teamStats)
    setLoading(false)
  }, [teamId])

  if (loading) {
    return (
      <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <p className="text-gray-300">Loading team stats...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <p className="text-gray-300">Unable to load team stats</p>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Active Members',
      value: stats.weeklyActive,
      total: stats.memberCount,
      color: 'green',
      icon: '👥',
      suffix: `/${stats.memberCount}`
    },
    {
      label: 'Weekly Check-ins',
      value: stats.weeklyCheckIns,
      color: 'blue',
      icon: '✅',
      detail: `${stats.avgCheckInsPerMember} avg/member`
    },
    {
      label: 'Weekly Quotes',
      value: stats.weeklyQuotes,
      color: 'purple',
      icon: '📝'
    },
    {
      label: 'Weekly Sales',
      value: stats.weeklySales,
      color: 'yellow',
      icon: '💰'
    }
  ]

  return (
    <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Team Performance</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-xl p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-300">{stat.label}</p>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className={`text-2xl font-bold text-${stat.color}-400`}>
              {stat.value}{stat.suffix || ''}
            </p>
            {stat.detail && (
              <p className="text-xs text-gray-400 mt-1">{stat.detail}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Team Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-300">Weekly Activity Rate</p>
          <p className="text-sm font-bold text-white">
            {stats.memberCount > 0 ? Math.round((stats.weeklyActive / stats.memberCount) * 100) : 0}%
          </p>
        </div>
        <div className="h-3 bg-gray-750 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${stats.memberCount > 0 ? (stats.weeklyActive / stats.memberCount) * 100 : 0}%` }}
          />
        </div>
      </div>
      
      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
        <p className="text-sm text-yellow-400 font-semibold">
          {stats.weeklyActive === stats.memberCount
            ? '🎉 Perfect week! Everyone is active!'
            : stats.weeklyActive >= stats.memberCount * 0.8
            ? '💪 Great team engagement this week!'
            : stats.weeklyActive >= stats.memberCount * 0.5
            ? '📈 Good momentum, keep it up!'
            : '🚀 Let&apos;s boost our team activity!'}
        </p>
      </div>
    </div>
  )
}