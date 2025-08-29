'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function RecentActivity() {
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const q = query(
      collection(db, 'activity'),
      orderBy('timestamp', 'desc'),
      limit(5)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const acts = []
      snapshot.forEach((doc) => {
        acts.push({ id: doc.id, ...doc.data() })
      })
      setActivities(acts)
    })

    return () => unsubscribe()
  }, [])

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
      <h2 className="text-xl font-black text-white mb-4">Recent Activity</h2>
      
      {activities.length === 0 ? (
        <p className="text-gray-400">No recent activity yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="p-3 rounded-lg bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {activity.type === 'checkin' ? '✅' : 
                   activity.type === 'achievement' ? '🏆' : 
                   activity.type === 'level' ? '⬆️' : '📊'}
                </span>
                <div>
                  <p className="text-sm text-white">{activity.message || 'Activity'}</p>
                  <p className="text-xs text-gray-400">{activity.userName}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}