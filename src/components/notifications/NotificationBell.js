'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { getUnreadCount, subscribeToNotifications } from '@/src/services/notifications'
import NotificationPanel from '@/src/components/notifications/NotificationPanel'

export default function NotificationBell() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user) return
    
    // Load initial unread count
    loadUnreadCount()
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications)
      const unread = newNotifications.filter(n => !n.read).length
      setUnreadCount(unread)
    })
    
    return () => unsubscribe()
  }, [user])

  const loadUnreadCount = async () => {
    if (!user) return
    const count = await getUnreadCount(user.uid)
    setUnreadCount(count)
  }

  const handleBellClick = () => {
    setShowPanel(!showPanel)
  }

  const handleClosePanel = () => {
    setShowPanel(false)
    // Refresh count after panel closes
    loadUnreadCount()
  }

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-300 hover:text-white transition"
        aria-label="Notifications"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={handleClosePanel}
          />
          
          {/* Panel */}
          <div className="absolute top-full right-0 mt-2 z-50">
            <NotificationPanel
              notifications={notifications}
              onClose={handleClosePanel}
              onNotificationUpdate={loadUnreadCount}
            />
          </div>
        </>
      )}
    </div>
  )
}