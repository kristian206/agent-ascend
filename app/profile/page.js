'use client'
import { useAuth } from '@/components/AuthProvider'
import PageLayout from '@/components/PageLayout'
import { useState, useEffect } from 'react'
import { doc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAchievementDetails } from '@/lib/gamification'

export default function ProfilePage() {
  const { user, userData } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.name || '')
    }
  }, [userData])
  
  useEffect(() => {
    if (user && userData) {
      loadStats()
      loadRecentActivity()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userData])

  const loadStats = async () => {
    if (!user) return
    
    try {
      // Calculate total check-ins
      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      )
      const snapshot = await getDocs(checkinsQuery)
      
      let totalCheckIns = 0
      let totalSales = 0
      let totalQuotes = 0
      let completedDays = 0
      
      const processedDates = new Set()
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.intentions_completed) totalCheckIns++
        if (data.wrap_completed) totalCheckIns++
        totalSales += data.sales || 0
        totalQuotes += data.quotes || 0
        
        // Count complete days
        if (data.intentions_completed && data.wrap_completed && !processedDates.has(data.date)) {
          completedDays++
          processedDates.add(data.date)
        }
      })
      
      setStats({
        totalCheckIns,
        totalSales,
        totalQuotes,
        completedDays
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentActivity = async () => {
    if (!user) return
    
    try {
      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc'),
        limit(5)
      )
      const snapshot = await getDocs(checkinsQuery)
      
      const activities = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        activities.push({
          date: data.date,
          morningCompleted: data.intentions_completed || false,
          eveningCompleted: data.wrap_completed || false,
          sales: data.sales || 0,
          quotes: data.quotes || 0
        })
      })
      
      setRecentActivity(activities)
    } catch (error) {
      console.error('Error loading activity:', error)
    }
  }

  const handleSaveName = async () => {
    if (!user || !displayName.trim()) return
    
    try {
      await updateDoc(doc(db, 'members', user.uid), {
        name: displayName.trim()
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating name:', error)
    }
  }

  if (!user) return null

  return (
    <PageLayout user={userData}>
      
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-white">Your Profile</h1>
          <p className="text-gray-400 mt-2">Track your progress and achievements</p>
        </header>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-4xl font-black text-black mb-4">
                  {userData?.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                
                {isEditing ? (
                  <div className="w-full space-y-3">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center"
                      placeholder="Your name"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveName}
                        className="flex-1 px-3 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-2">{userData?.name || 'Agent'}</h2>
                    <p className="text-gray-400 text-sm">ID: {userData?.userId || '------'}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-gray-400 hover:text-white transition mt-2"
                    >
                      Edit Name
                    </button>
                  </>
                )}
                
                <p className="text-gray-400 text-sm mt-2">{user.email}</p>
                
                <div className="flex items-center gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{userData?.level || 1}</p>
                    <p className="text-xs text-gray-400">Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">{userData?.streak || 0}</p>
                    <p className="text-xs text-gray-400">Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{userData?.xp || 0}</p>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>
              </div>
              
              {userData?.teamId && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-1">Team</p>
                  <p className="text-white font-semibold">Team Member</p>
                  <p className="text-sm text-gray-400 capitalize">{userData.teamRole}</p>
                </div>
              )}
            </div>
            
            {/* Achievements */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
              {userData?.achievements && userData.achievements.length > 0 ? (
                <div className="space-y-2">
                  {userData.achievements.map((achievement, index) => {
                    const details = getAchievementDetails(achievement)
                    return (
                      <div key={index} className="bg-white/5 rounded-lg p-3">
                        <p className="text-white font-semibold">{details.name}</p>
                        <p className="text-xs text-gray-400">{details.description}</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No achievements yet. Keep going!</p>
              )}
            </div>
          </div>
          
          {/* Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lifetime Stats */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Lifetime Stats</h3>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-3xl font-bold text-green-400">{stats.totalCheckIns}</p>
                    <p className="text-sm text-gray-400">Check-ins</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-3xl font-bold text-blue-400">{stats.completedDays}</p>
                    <p className="text-sm text-gray-400">Complete Days</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-3xl font-bold text-purple-400">{stats.totalQuotes}</p>
                    <p className="text-sm text-gray-400">Quotes</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-3xl font-bold text-yellow-400">{stats.totalSales}</p>
                    <p className="text-sm text-gray-400">Sales</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Loading stats...</p>
              )}
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          {new Date(activity.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-sm ${activity.morningCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                            {activity.morningCompleted ? '☀️ Morning ✓' : '☀️ Morning -'}
                          </span>
                          <span className={`text-sm ${activity.eveningCompleted ? 'text-purple-400' : 'text-gray-500'}`}>
                            {activity.eveningCompleted ? '🌙 Evening ✓' : '🌙 Evening -'}
                          </span>
                        </div>
                      </div>
                      {(activity.quotes > 0 || activity.sales > 0) && (
                        <div className="flex items-center gap-3">
                          {activity.quotes > 0 && (
                            <span className="text-sm text-gray-400">📝 {activity.quotes}</span>
                          )}
                          {activity.sales > 0 && (
                            <span className="text-sm text-yellow-400">💰 {activity.sales}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}