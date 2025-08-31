'use client'
import { useAuth } from '@/src/components/auth/AuthProvider'
import PageLayout from '@/src/components/layout/PageLayout'
import { useState, useEffect } from 'react'
import { collection, query, getDocs, where } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

export default function AchievementWallPage() {
  const { user, userData } = useAuth()
  const [stats, setStats] = useState({
    weeklyGoalAchievers: 0,
    monthlyGoalAchievers: 0,
    activeStreaks: 0,
    fireStreaks: 0,
    participationStreaks: 0,
    totalMembers: 0,
    bellsRungToday: 0,
    teamMilestones: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && userData?.teamId) {
      loadTeamAchievements()
    }
  }, [user, userData])

  const loadTeamAchievements = async () => {
    setLoading(true)
    try {
      // Get all team members
      const membersQuery = query(
        collection(db, 'members'),
        where('teamId', '==', userData.teamId)
      )
      const membersSnapshot = await getDocs(membersQuery)
      
      let weeklyGoalCount = 0
      let monthlyGoalCount = 0
      let activeStreakCount = 0
      let fireStreakCount = 0
      let participationCount = 0
      
      membersSnapshot.forEach((doc) => {
        const member = doc.data()
        
        // Check weekly goal (percentage based)
        const weekProgress = member.weekPoints && member.weekGoal 
          ? (member.weekPoints / member.weekGoal) * 100 
          : 0
        if (weekProgress >= 100) weeklyGoalCount++
        
        // Check monthly goal
        const monthProgress = member.monthPoints && member.monthGoal
          ? (member.monthPoints / member.monthGoal) * 100
          : 0
        if (monthProgress >= 100) monthlyGoalCount++
        
        // Check streaks
        if (member.streak > 0) activeStreakCount++
        if (member.streak >= 7) fireStreakCount++
        if (member.participationStreak > 0 && member.streak === 0) participationCount++
      })
      
      // Get today's bells
      const today = new Date().toISOString().split('T')[0]
      const bellsQuery = query(
        collection(db, 'sales'),
        where('teamId', '==', userData.teamId),
        where('date', '==', today)
      )
      const bellsSnapshot = await getDocs(bellsQuery)
      
      setStats({
        weeklyGoalAchievers: weeklyGoalCount,
        monthlyGoalAchievers: monthlyGoalCount,
        activeStreaks: activeStreakCount,
        fireStreaks: fireStreakCount,
        participationStreaks: participationCount,
        totalMembers: membersSnapshot.size,
        bellsRungToday: bellsSnapshot.size,
        teamMilestones: calculateMilestones(weeklyGoalCount, membersSnapshot.size)
      })
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
    setLoading(false)
  }

  const calculateMilestones = (achievers, total) => {
    const percentage = total > 0 ? (achievers / total) * 100 : 0
    const milestones = []
    
    if (percentage >= 100) {
      milestones.push({ emoji: '🏆', text: 'Perfect Week! Everyone hit their goal!' })
    } else if (percentage >= 75) {
      milestones.push({ emoji: '⭐', text: '75% of team at weekly goal!' })
    } else if (percentage >= 50) {
      milestones.push({ emoji: '🎯', text: 'Half the team at weekly goal!' })
    }
    
    return milestones
  }

  const getPercentage = (value, total) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  if (!user) return null

  return (
    <PageLayout user={userData}>
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white">Achievement Wall</h1>
          <p className="text-gray-300 mt-2">Celebrating collective success</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-300">Loading achievements...</p>
            </div>
          ) : (
            <>
              {/* Team Milestones */}
              {stats.teamMilestones.length > 0 && (
                <div className="mb-8">
                  {stats.teamMilestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 text-center mb-4"
                    >
                      <div className="text-5xl mb-3">{milestone.emoji}</div>
                      <p className="text-xl font-bold text-yellow-400">{milestone.text}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Achievement Stats Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Weekly Goal Progress */}
                <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Weekly Goals</h3>
                    <span className="text-3xl">🎯</span>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-green-400">
                      {getPercentage(stats.weeklyGoalAchievers, stats.totalMembers)}%
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      of team has achieved their weekly goal
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.weeklyGoalAchievers} out of {stats.totalMembers} members
                    </p>
                  </div>
                  <div className="mt-4 h-3 bg-gray-750 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${getPercentage(stats.weeklyGoalAchievers, stats.totalMembers)}%` }}
                    />
                  </div>
                </div>
                
                {/* Monthly Goal Progress */}
                <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Monthly Goals</h3>
                    <span className="text-3xl">📈</span>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-blue-400">
                      {getPercentage(stats.monthlyGoalAchievers, stats.totalMembers)}%
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      of team has achieved their monthly goal
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.monthlyGoalAchievers} out of {stats.totalMembers} members
                    </p>
                  </div>
                  <div className="mt-4 h-3 bg-gray-750 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${getPercentage(stats.monthlyGoalAchievers, stats.totalMembers)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Streak Champions */}
              <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700 mb-8">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Streak Champions</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-4xl mb-2">🔥</div>
                    <p className="text-2xl font-black text-orange-400">{stats.fireStreaks}</p>
                    <p className="text-xs text-gray-300">Fire Streaks</p>
                    <p className="text-xs text-gray-400">(7+ days with sales)</p>
                  </div>
                  <div>
                    <div className="text-4xl mb-2">⚡</div>
                    <p className="text-2xl font-black text-yellow-400">{stats.activeStreaks}</p>
                    <p className="text-xs text-gray-300">Active Streaks</p>
                    <p className="text-xs text-gray-400">(Any streak)</p>
                  </div>
                  <div>
                    <div className="text-4xl mb-2">✨</div>
                    <p className="text-2xl font-black text-purple-400">{stats.participationStreaks}</p>
                    <p className="text-xs text-gray-300">Participation</p>
                    <p className="text-xs text-gray-400">(Check-ins only)</p>
                  </div>
                </div>
              </div>
              
              {/* Today's Activity */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 bg-gray-900 rounded-2xl p-6 border border-yellow-500/20">
                <div className="text-center">
                  <div className="text-5xl mb-4">🔔</div>
                  <p className="text-3xl font-black text-yellow-400">{stats.bellsRungToday}</p>
                  <p className="text-sm text-gray-300">bells rung today by the team</p>
                  {stats.bellsRungToday > 10 && (
                    <p className="text-xs text-green-400 mt-2">🎉 Amazing team energy!</p>
                  )}
                </div>
              </div>
              
              {/* Motivational Footer */}
              <div className="mt-8 text-center">
                <p className="text-gray-300 text-sm">
                  Success is a team sport. Every bell rung, every goal hit, every streak maintained
                </p>
                <p className="text-gray-300 text-sm">
                  contributes to our collective achievement. Keep pushing forward! 💪
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  )
}