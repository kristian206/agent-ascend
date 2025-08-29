'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getTodaySales, getWeekSales, getTeamSalesToday, getRecentTeamBells } from '@/lib/sales'
import RingTheBell from '@/components/RingTheBell'

export default function SalesTracker() {
  const { user, userData } = useAuth()
  const [showRingModal, setShowRingModal] = useState(false)
  const [stats, setStats] = useState({
    todayBells: 0,
    weekBells: 0,
    teamBellsToday: 0
  })
  const [recentBells, setRecentBells] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [today, week, teamToday] = await Promise.all([
        getTodaySales(user.uid),
        getWeekSales(user.uid),
        userData?.teamId ? getTeamSalesToday(userData.teamId) : Promise.resolve(0)
      ])
      
      setStats({
        todayBells: today,
        weekBells: week,
        teamBellsToday: teamToday
      })
      
      // Load team feed if in a team
      if (userData?.teamId) {
        const bells = await getRecentTeamBells(userData.teamId)
        setRecentBells(bells)
      }
    } catch (error) {
      console.error('Error loading sales stats:', error)
    }
    setLoading(false)
  }

  const handleSaleLogged = () => {
    // Refresh stats after a sale
    loadStats()
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
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
    <>
      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur rounded-2xl p-6 border border-yellow-500/20">
        {/* Header with Ring Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Sales Tracker</h2>
            <p className="text-sm text-gray-400">Ring the bell for every win!</p>
          </div>
          <button
            onClick={() => setShowRingModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-6 py-3 rounded-xl hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/25 transition-all transform active:scale-95 flex items-center gap-2"
          >
            <span className="text-2xl">🔔</span>
            <span>Ring the Bell</span>
          </button>
        </div>
        
        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading sales data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-3xl font-black text-yellow-400">{stats.todayBells}</p>
                <p className="text-xs text-gray-400 mt-1">Today&apos;s Bells</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-3xl font-black text-orange-400">{stats.weekBells}</p>
                <p className="text-xs text-gray-400 mt-1">This Week</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-3xl font-black text-pink-400">{stats.teamBellsToday}</p>
                <p className="text-xs text-gray-400 mt-1">Team Today</p>
              </div>
            </div>
            
            {/* Week Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Weekly Progress</p>
                <p className="text-sm font-bold text-white">{stats.weekBells}/20 goal</p>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${Math.min((stats.weekBells / 20) * 100, 100)}%` }}
                />
              </div>
              {stats.weekBells >= 20 && (
                <p className="text-xs text-green-400 mt-1">🎉 Weekly goal achieved!</p>
              )}
            </div>
            
            {/* Recent Team Bells */}
            {userData?.teamId && recentBells.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Recent Team Bells</h3>
                <div className="space-y-2">
                  {recentBells.map((bell, index) => (
                    <div
                      key={bell.id || index}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔔</span>
                        <span className="text-sm text-white">
                          <span className="font-semibold">{bell.userName}</span>
                          <span className="text-gray-400"> {bell.message}</span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(bell.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Motivational Message */}
            {stats.todayBells === 0 && (
              <div className="text-center py-4 border-t border-white/10 mt-6">
                <p className="text-sm text-gray-400">
                  Ready to make your first sale of the day? Let&apos;s go! 🚀
                </p>
              </div>
            )}
            
            {stats.todayBells > 0 && stats.todayBells < 5 && (
              <div className="text-center py-4 border-t border-white/10 mt-6">
                <p className="text-sm text-yellow-400">
                  {stats.todayBells} {stats.todayBells === 1 ? 'bell' : 'bells'} today! Keep the momentum going! 🔥
                </p>
              </div>
            )}
            
            {stats.todayBells >= 5 && (
              <div className="text-center py-4 border-t border-white/10 mt-6">
                <p className="text-sm text-green-400 font-semibold">
                  🏆 Outstanding! {stats.todayBells} bells today! You&apos;re on fire!
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Ring the Bell Modal */}
      {showRingModal && (
        <RingTheBell
          onClose={() => setShowRingModal(false)}
          onSaleLogged={handleSaleLogged}
        />
      )}
    </>
  )
}