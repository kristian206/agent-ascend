'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { useAuth } from '@/src/components/auth/AuthProvider'

export default function RecentActivity({ expanded = false }) {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Create queries for different activity types
    const fetchActivities = async () => {
      const allActivities = []
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Listen to multiple collections for comprehensive activity feed
      const listeners = []

      // Sales activities
      const salesQuery = query(
        collection(db, 'sales'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(expanded ? 20 : 5)
      )
      
      const salesUnsubscribe = onSnapshot(salesQuery, (snapshot) => {
        const sales = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          sales.push({
            id: `sale_${doc.id}`,
            type: 'sale',
            icon: '💰',
            message: `Logged sale: ${data.productsSummary}`,
            detail: `$${data.totalCommission} commission, ${data.totalPoints} points`,
            timestamp: data.timestamp,
            userName: data.userName || 'You'
          })
        })
        updateActivities('sales', sales)
      })
      listeners.push(salesUnsubscribe)

      // Check-ins
      const checkinQuery = query(
        collection(db, 'checkins'),
        orderBy('timestamp', 'desc'),
        limit(expanded ? 10 : 3)
      )
      
      const checkinUnsubscribe = onSnapshot(checkinQuery, (snapshot) => {
        const checkins = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.userId === user.uid) {
            checkins.push({
              id: `checkin_${doc.id}`,
              type: 'checkin',
              icon: '✅',
              message: 'Daily check-in completed',
              detail: `${data.points || 5} points earned`,
              timestamp: data.timestamp,
              userName: 'You'
            })
          }
        })
        updateActivities('checkins', checkins)
      })
      listeners.push(checkinUnsubscribe)

      // Daily Intentions
      const intentionsQuery = query(
        collection(db, 'dailyIntentions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(expanded ? 10 : 3)
      )
      
      const intentionsUnsubscribe = onSnapshot(intentionsQuery, (snapshot) => {
        const intentions = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          intentions.push({
            id: `intention_${doc.id}`,
            type: 'intention',
            icon: '🌅',
            message: 'Morning intentions set',
            detail: data.salesGoal ? `Goal: ${data.salesGoal} sales` : 'Ready for the day',
            timestamp: data.createdAt,
            userName: 'You'
          })
        })
        updateActivities('intentions', intentions)
      })
      listeners.push(intentionsUnsubscribe)

      // Nightly Wraps
      const wrapsQuery = query(
        collection(db, 'nightlyWraps'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(expanded ? 10 : 3)
      )
      
      const wrapsUnsubscribe = onSnapshot(wrapsQuery, (snapshot) => {
        const wraps = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          wraps.push({
            id: `wrap_${doc.id}`,
            type: 'wrap',
            icon: '🌙',
            message: 'Nightly wrap completed',
            detail: `Productivity: ${data.productivityRating}/5`,
            timestamp: data.createdAt,
            userName: 'You'
          })
        })
        updateActivities('wraps', wraps)
      })
      listeners.push(wrapsUnsubscribe)

      // Activities collection (achievements, level ups, etc)
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(expanded ? 15 : 5)
      )
      
      const activitiesUnsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
        const misc = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          const icons = {
            'achievement': '🏆',
            'level_up': '⬆️',
            'streak': '🔥',
            'team_joined': '👥',
            'season_promotion': '📈',
            'milestone': '🎯'
          }
          misc.push({
            id: `activity_${doc.id}`,
            type: data.type,
            icon: icons[data.type] || '📊',
            message: data.message || data.description,
            detail: data.detail || '',
            timestamp: data.timestamp,
            userName: data.userName || 'You'
          })
        })
        updateActivities('misc', misc)
      })
      listeners.push(activitiesUnsubscribe)

      // Store activity sources
      const activitySources = {}
      
      const updateActivities = (source, items) => {
        activitySources[source] = items
        
        // Combine all activities
        const combined = []
        Object.values(activitySources).forEach(sourceItems => {
          combined.push(...sourceItems)
        })
        
        // Sort by timestamp (most recent first)
        combined.sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0
          return timeB - timeA
        })
        
        // Limit to top items
        const limited = expanded ? combined.slice(0, 50) : combined.slice(0, 10)
        setActivities(limited)
        setLoading(false)
      }

      // Cleanup function
      return () => {
        listeners.forEach(unsubscribe => unsubscribe())
      }
    }

    const cleanup = fetchActivities()
    return () => {
      cleanup.then(fn => fn && fn())
    }
  }, [user, expanded])

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">Recent Activity</h2>
          <p className="text-sm text-gray-300">
            {expanded ? 'All your recent actions' : 'Your latest actions'}
          </p>
        </div>
        <div className="text-2xl">📋</div>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No activity yet today</p>
          <p className="text-sm text-gray-500">Complete actions to see them here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="p-4 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0 mt-1">
                  {activity.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {activity.message}
                  </p>
                  {activity.detail && (
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.detail}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {activity.userName}
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!expanded && activities.length >= 10 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            Showing most recent 10 activities
          </p>
        </div>
      )}
    </div>
  )
}