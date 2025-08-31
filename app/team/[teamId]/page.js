'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import Link from 'next/link'
import { 
  Users, Trophy, Target, TrendingUp, Calendar, Shield, Star,
  ChevronRight, Award, Activity, Zap, Crown, UserCheck
} from 'lucide-react'
import teamGoalService from '@/src/services/teamGoalService'

export default function TeamProfilePage({ params }) {
  const { user, userData } = useAuth()
  const [teamData, setTeamData] = useState(null)
  const [teamStats, setTeamStats] = useState(null)
  const [teamGoals, setTeamGoals] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamProfile()
  }, [params.teamId])

  const loadTeamProfile = async () => {
    try {
      // Load team data
      const teamDoc = await getDoc(doc(db, 'teams', params.teamId))
      if (!teamDoc.exists()) {
        setTeamData(null)
        setLoading(false)
        return
      }

      const team = teamDoc.data()
      setTeamData(team)

      // Load team members for stats
      const membersQuery = query(
        collection(db, 'members'),
        where('teamId', '==', params.teamId)
      )
      const membersSnapshot = await getDocs(membersQuery)
      
      // Calculate team stats
      let totalPoints = 0
      let totalSales = 0
      let activeCount = 0
      const membersList = []

      for (const memberDoc of membersSnapshot.docs) {
        const memberData = memberDoc.data()
        totalPoints += memberData.totalPoints || 0
        totalSales += memberData.totalSales || 0
        
        // Check if active (has activity in last 7 days)
        if (memberData.lastActivityDate) {
          const lastActivity = new Date(memberData.lastActivityDate.seconds * 1000)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          if (lastActivity > weekAgo) {
            activeCount++
          }
        }

        membersList.push({
          id: memberDoc.id,
          ...memberData
        })
      }

      // Get top 3 performers by points
      const topMembers = membersList
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 3)

      setTopPerformers(topMembers)

      setTeamStats({
        totalMembers: team.memberCount || 0,
        activeMembers: activeCount,
        totalPoints,
        totalSales,
        averagePoints: team.memberCount > 0 ? Math.round(totalPoints / team.memberCount) : 0
      })

      // Load team goals (public view)
      try {
        const goalsQuery = query(
          collection(db, 'teamGoals'),
          where('teamId', '==', params.teamId),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(3)
        )
        const goalsSnapshot = await getDocs(goalsQuery)
        const goals = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTeamGoals(goals)
      } catch (error) {
        console.error('Error loading team goals:', error)
      }

    } catch (error) {
      console.error('Error loading team profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'leader':
        return <Crown className="w-4 h-4 text-yellow-400" />
      case 'co-leader':
        return <Shield className="w-4 h-4 text-blue-400" />
      case 'senior':
        return <Star className="w-4 h-4 text-purple-400" />
      default:
        return <UserCheck className="w-4 h-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Team Not Found</h1>
          <p className="text-gray-400">This team doesn't exist or has been disbanded.</p>
          <Link href="/team" className="mt-6 inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Browse Teams
          </Link>
        </div>
      </div>
    )
  }

  const isTeamMember = userData?.teamId === params.teamId
  const isLeader = isTeamMember && userData?.teamRole === 'leader'

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Team Banner */}
      <div 
        className="relative h-64"
        style={{
          background: teamData.bannerUrl || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 h-full flex items-end pb-6">
          <div className="flex items-center gap-6">
            {/* Team Avatar */}
            <div className="w-24 h-24 bg-gray-800 rounded-2xl border-4 border-gray-900 flex items-center justify-center">
              <Users className="w-12 h-12 text-blue-400" />
            </div>
            
            {/* Team Info */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{teamData.name}</h1>
              <div className="flex items-center gap-4 text-gray-200">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Team #{teamData.teamNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {teamData.memberCount} members
                </span>
                {isTeamMember && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    Your Team
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isLeader && (
            <div className="ml-auto">
              <Link 
                href="/team"
                className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Manage Team
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Info */}
          <div className="space-y-6">
            {/* Team Stats */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Team Statistics
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Points</span>
                  <span className="text-2xl font-bold text-white">{teamStats?.totalPoints?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Members</span>
                  <span className="text-xl font-semibold text-green-400">
                    {teamStats?.activeMembers || 0}/{teamStats?.totalMembers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Sales</span>
                  <span className="text-xl font-semibold text-white">{teamStats?.totalSales || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Points/Member</span>
                  <span className="text-xl font-semibold text-white">{teamStats?.averagePoints || 0}</span>
                </div>
              </div>
            </div>

            {/* Team Description */}
            {teamData.description && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-3">About</h2>
                <p className="text-gray-300">{teamData.description}</p>
              </div>
            )}

            {/* Join Code (if member) */}
            {isTeamMember && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-3">Team Code</h2>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-3xl font-mono font-bold text-blue-400 tracking-wider">
                    {teamData.joinCode}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Share this code to invite members</p>
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Goals & Progress */}
          <div className="space-y-6">
            {/* Active Goals */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Active Goals
              </h2>

              {teamGoals.length > 0 ? (
                <div className="space-y-3">
                  {teamGoals.map(goal => {
                    const progress = goal.targetValue > 0 
                      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                      : 0
                    
                    return (
                      <div key={goal.id} className="bg-gray-900 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white">{goal.title}</h3>
                          <span className="text-sm text-gray-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {goal.endDate && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Ends {new Date(goal.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No active goals</p>
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Recent Activity
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-300">Team is currently active</span>
                </div>
                <div className="text-center py-4 text-gray-500 text-sm">
                  Activity feed coming soon...
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Top Performers */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Performers
              </h2>

              {topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {topPerformers.map((member, index) => (
                    <Link
                      key={member.id}
                      href={`/user/${member.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-750 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={member.avatarUrl || '/api/placeholder/40/40'}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-black">1</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{member.name}</p>
                          {getRoleIcon(member.teamRole)}
                        </div>
                        <p className="text-sm text-gray-400">{member.totalPoints || 0} points</p>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No data yet</p>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Team Achievements
              </h2>
              
              <div className="grid grid-cols-3 gap-3">
                {teamStats?.totalSales >= 100 && (
                  <div className="bg-gray-900 rounded-lg p-3 text-center">
                    <span className="text-2xl">💰</span>
                    <p className="text-xs text-gray-400 mt-1">Century</p>
                  </div>
                )}
                {teamStats?.totalMembers >= 10 && (
                  <div className="bg-gray-900 rounded-lg p-3 text-center">
                    <span className="text-2xl">👥</span>
                    <p className="text-xs text-gray-400 mt-1">Growing</p>
                  </div>
                )}
                {teamStats?.totalPoints >= 10000 && (
                  <div className="bg-gray-900 rounded-lg p-3 text-center">
                    <span className="text-2xl">⭐</span>
                    <p className="text-xs text-gray-400 mt-1">10K Club</p>
                  </div>
                )}
              </div>
              
              {(!teamStats?.totalSales || teamStats.totalSales < 100) && 
               (!teamStats?.totalMembers || teamStats.totalMembers < 10) && 
               (!teamStats?.totalPoints || teamStats.totalPoints < 10000) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Achievements unlock as the team grows
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}