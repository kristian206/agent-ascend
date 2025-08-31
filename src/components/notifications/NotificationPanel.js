'use client'
import { useState } from 'react'
import { markAsRead, markAllAsRead } from '@/src/services/notifications'
import { useAuth } from '@/src/components/auth/AuthProvider'

export default function NotificationPanel({ notifications, onClose, onNotificationUpdate }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId)
    onNotificationUpdate()
  }

  const handleMarkAllAsRead = async () => {
    if (!user || loading) return
    setLoading(true)
    await markAllAsRead(user.uid)
    onNotificationUpdate()
    setLoading(false)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="w-96 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 p-4 border-b border-gray-600 bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs text-gray-300 hover:text-white transition disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-gray-300">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">
              We&apos;ll notify you about milestones and achievements
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`p-4 transition-all cursor-pointer bg-gray-900 ${
                  notification.read 
                    ? 'bg-gray-800 hover:bg-gray-750' 
                    : 'bg-yellow-500/10 hover:bg-yellow-500/20 border-l-2 border-yellow-500'
                }`}
              >
                <div className="flex gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-semibold ${
                        notification.read ? 'text-gray-200' : 'text-white'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${
                      notification.read ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <div className="mt-2">
                        <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-600 bg-black/70">
          <p className="text-xs text-center text-gray-400">
            Notifications expire after 30 days
          </p>
        </div>
      )}
    </div>
  )
}