'use client'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function LeaderboardPage() {
  const { user, userData } = useAuth()
  const [activeTab, setActiveTab] = useState('streak')
  const [leaderboards, setLeaderboards] = useState({
    streak: [],
    points: [],
    sales: []
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('all') // 'week', 'month', 'all'

  useEffect(() => {
    loadLeaderboards()
  }, [timeframe])

  const loadLeaderboards = async () => {
    setLoading(true)
    
    try {
      // Get all members
      const membersQuery = query(collection(db, 'members'), limit(100))
      const membersSnapshot = await getDocs(membersQuery)
      
      const members = []
      for (const doc of membersSnapshot.docs) {
        const memberData = doc.data()
        
        // Calculate weekly/monthly stats if needed
        let weeklyPoints = 0
        let weeklySales = 0
        let monthlyPoints = 0
        let monthlySales = 0
        
        if (timeframe !== 'all') {
          const today = new Date()
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          
          // Get check-ins for time-based stats
          const checkinsQuery = query(
            collection(db, 'checkins'),
            where('user_id', '==', doc.id),
            orderBy('date', 'desc')
          )
          const checkinsSnapshot = await getDocs(checkinsQuery)
          
          checkinsSnapshot.forEach((checkDoc) => {
            const checkData = checkDoc.data()
            const checkDate = new Date(checkData.date)
            
            if (checkDate >= weekAgo) {
              weeklyPoints += 10 * ((checkData.intentions_completed ? 1 : 0) + (checkData.wrap_completed ? 1 : 0))
              weeklySales += checkData.sales || 0
            }
            
            if (checkDate >= monthAgo) {
              monthlyPoints += 10 * ((checkData.intentions_completed ? 1 : 0) + (checkData.wrap_completed ? 1 : 0))
              monthlySales += checkData.sales || 0
            }
          })
        }
        
        members.push({
          id: doc.id,
          name: memberData.name || memberData.email?.split('@')[0] || 'Unknown',
          email: memberData.email,
          streak: memberData.streak || 0,
          level: memberData.level || 1,
          xp: memberData.xp || 0,
          seasonPoints: memberData.seasonPoints || 0,
          lifetimePoints: memberData.lifetimePoints || 0,
          achievements: memberData.achievements?.length || 0,
          weeklyPoints,
          weeklySales,
          monthlyPoints,
          monthlySales,
          isCurrentUser: doc.id === user?.uid
        })
      }
      
      // Sort by different metrics
      const streakLeaders = [...members].sort((a, b) => b.streak - a.streak).slice(0, 10)
      
      const pointsLeaders = [...members].sort((a, b) => {
        if (timeframe === 'week') return b.weeklyPoints - a.weeklyPoints
        if (timeframe === 'month') return b.monthlyPoints - a.monthlyPoints
        return b.seasonPoints - a.seasonPoints
      }).slice(0, 10)
      
      const salesLeaders = [...members].sort((a, b) => {
        if (timeframe === 'week') return b.weeklySales - a.weeklySales
        if (timeframe === 'month') return b.monthlySales - a.monthlySales
        return b.lifetimePoints - a.lifetimePoints // Use lifetime as proxy for all-time sales
      }).slice(0, 10)
      
      setLeaderboards({
        streak: streakLeaders,
        points: pointsLeaders,
        sales: salesLeaders
      })
    } catch (error) {
      console.error('Error loading leaderboards:', error)
    }
    
    setLoading(false)
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getMetricValue = (member, type) => {
    if (type === 'streak') return `${member.streak} days`
    if (type === 'points') {
      if (timeframe === 'week') return `${member.weeklyPoints} pts`
      if (timeframe === 'month') return `${member.monthlyPoints} pts`
      return `${member.seasonPoints} pts`
    }
    if (type === 'sales') {
      if (timeframe === 'week') return member.weeklySales
      if (timeframe === 'month') return member.monthlySales
      return member.lifetimePoints / 50 // Estimate based on points
    }
    return 0
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navigation user={userData} />
      
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white">Leaderboard</h1>
          <p className="text-gray-400 mt-2">See how you stack up against the team</p>
        </header>
        
        {/* Tab Navigation */}
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('streak')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                activeTab === 'streak'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔥 Streaks
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                activeTab === 'points'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ⭐ Points
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                activeTab === 'sales'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💰 Sales
            </button>
          </div>
          
          {/* Timeframe Filter (for points and sales) */}
          {activeTab !== 'streak' && (
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => setTimeframe('week')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  timeframe === 'week'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  timeframe === 'month'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeframe('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  timeframe === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                All Time
              </button>
            </div>
          )}
          
          {/* Leaderboard List */}
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">Loading leaderboard...</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {leaderboards[activeTab].map((member, index) => (
                  <div
                    key={member.id}
                    className={`p-4 flex items-center justify-between transition ${
                      member.isCurrentUser
                        ? 'bg-yellow-500/10 border-l-4 border-yellow-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold w-12 text-center">
                        {getRankBadge(index + 1)}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold">
                        {member.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {member.name}
                          {member.isCurrentUser && (
                            <span className="text-xs text-yellow-400 ml-2">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">
                          Level {member.level} • {member.achievements} achievements
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        activeTab === 'streak' ? 'text-orange-400' :
                        activeTab === 'points' ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        {getMetricValue(member, activeTab)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {leaderboards[activeTab].length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No data available yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Motivational Message */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Remember: It&apos;s not about being #1, it&apos;s about being better than yesterday! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}