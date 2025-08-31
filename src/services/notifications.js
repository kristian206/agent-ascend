import { collection, doc, setDoc, getDocs, query, where, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

// Notification types
export const NOTIFICATION_TYPES = {
  STREAK_MILESTONE: 'streak_milestone',
  WEEKLY_SUMMARY: 'weekly_summary',
  TEAM_MILESTONE: 'team_milestone',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  LEVEL_UP: 'level_up'
}

// Notification templates
const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.STREAK_MILESTONE]: {
    icon: '🔥',
    getTitle: (data) => `${data.days} Day Streak!`,
    getMessage: (data) => `Amazing! You&apos;ve maintained a ${data.days} day streak. Keep the momentum going!`
  },
  [NOTIFICATION_TYPES.WEEKLY_SUMMARY]: {
    icon: '📊',
    getTitle: () => 'Weekly Summary Ready',
    getMessage: (data) => `Your week: ${data.checkIns} check-ins, ${data.quotes} quotes, ${data.sales} sales. Great work!`
  },
  [NOTIFICATION_TYPES.TEAM_MILESTONE]: {
    icon: '🎯',
    getTitle: () => 'Team Milestone Achieved!',
    getMessage: (data) => `Your team "${data.teamName}" reached ${data.milestone}!`
  },
  [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: {
    icon: '🏆',
    getTitle: () => 'Achievement Unlocked!',
    getMessage: (data) => `You&apos;ve earned "${data.achievementName}"!`
  },
  [NOTIFICATION_TYPES.LEVEL_UP]: {
    icon: '⭐',
    getTitle: (data) => `Level ${data.level} Reached!`,
    getMessage: (data) => `Congratulations! You&apos;re now level ${data.level} with ${data.xp} XP.`
  }
}

// Create a notification
export async function createNotification(userId, type, data = {}) {
  try {
    const template = NOTIFICATION_TEMPLATES[type]
    if (!template) {
      // Invalid notification type
      return null
    }

    const notificationId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const notification = {
      id: notificationId,
      userId,
      type,
      title: template.getTitle(data),
      message: template.getMessage(data),
      icon: template.icon,
      data,
      read: false,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }

    await setDoc(doc(db, 'notifications', notificationId), notification)
    
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

// Get unread notifications count
export async function getUnreadCount(userId) {
  try {
    // Simplified query to avoid index requirement
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(q)
    const now = new Date()
    let count = 0
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      // Count only non-expired notifications
      if (data.expiresAt && data.expiresAt.toDate) {
        if (data.expiresAt.toDate() > now) {
          count++
        }
      } else {
        // Count notifications without expiry
        count++
      }
    })
    
    return count
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

// Get recent notifications
export async function getRecentNotifications(userId, limitCount = 20) {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    )
    
    const snapshot = await getDocs(q)
    const notifications = []
    const now = new Date()
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      // Filter expired notifications on client side
      if (data.expiresAt && data.expiresAt.toDate) {
        if (data.expiresAt.toDate() > now) {
          notifications.push({ id: doc.id, ...data })
        }
      } else {
        // Include notifications without expiry
        notifications.push({ id: doc.id, ...data })
      }
    })
    
    // Sort by createdAt on client side
    notifications.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0)
      const bTime = b.createdAt?.toDate?.() || new Date(0)
      return bTime - aTime // Descending order
    })
    
    return notifications.slice(0, limitCount)
  } catch (error) {
    console.error('Error getting notifications:', error)
    return []
  }
}

// Mark notification as read
export async function markAsRead(notificationId) {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

// Mark all notifications as read
export async function markAllAsRead(userId) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(q)
    const batch = []
    
    snapshot.forEach((doc) => {
      batch.push(
        updateDoc(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        })
      )
    })
    
    await Promise.all(batch)
    return true
  } catch (error) {
    console.error('Error marking all as read:', error)
    return false
  }
}

// Subscribe to notification updates
export function subscribeToNotifications(userId, callback) {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    )
    
    return onSnapshot(
      q, 
      (snapshot) => {
        const notifications = []
        const now = new Date()
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          // Filter expired notifications on client side
          if (data.expiresAt && data.expiresAt.toDate && data.expiresAt.toDate() > now) {
            notifications.push({ id: doc.id, ...data })
          } else if (!data.expiresAt) {
            // Include notifications without expiry
            notifications.push({ id: doc.id, ...data })
          }
        })
        
        // Sort by createdAt on client side and limit to 20
        notifications.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0)
          const bTime = b.createdAt?.toDate?.() || new Date(0)
          return bTime - aTime // Descending order
        })
        
        callback(notifications.slice(0, 20))
      },
      (error) => {
        // Handle errors gracefully
        // Notifications unavailable
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          // Firestore index is being created. Notifications will be available soon.
        }
        // Return empty array on error
        callback([])
      }
    )
  } catch (error) {
    console.error('Error setting up notifications listener:', error)
    // Return a no-op unsubscribe function
    return () => {}
  }
}

// Check for notification triggers
export async function checkNotificationTriggers(userId, userData) {
  const notifications = []
  
  // Check streak milestones
  if (userData.streak && [3, 7, 14, 30, 60, 90, 100].includes(userData.streak)) {
    notifications.push({
      type: NOTIFICATION_TYPES.STREAK_MILESTONE,
      data: { days: userData.streak }
    })
  }
  
  // Check level ups
  const prevLevel = Math.floor((userData.xp - userData.lastXpGain) / 100)
  const currentLevel = Math.floor(userData.xp / 100)
  if (currentLevel > prevLevel) {
    notifications.push({
      type: NOTIFICATION_TYPES.LEVEL_UP,
      data: { level: currentLevel, xp: userData.xp }
    })
  }
  
  // Create notifications
  for (const notification of notifications) {
    await createNotification(userId, notification.type, notification.data)
  }
  
  return notifications
}

// Generate weekly summary (to be called by a scheduled function)
export async function generateWeeklySummary(userId) {
  try {
    // Get last 7 days of check-ins
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const q = query(
      collection(db, 'checkins'),
      where('user_id', '==', userId),
      where('created_at', '>=', weekAgo)
    )
    
    const snapshot = await getDocs(q)
    
    let checkIns = 0
    let quotes = 0
    let sales = 0
    
    snapshot.forEach((doc) => {
      const docData = doc.data()
      if (docData.intentions_completed) checkIns++
      if (docData.wrap_completed) checkIns++
      quotes += docData.quotes || 0
      sales += docData.sales || 0
    })
    
    // Only send if there was activity
    if (checkIns > 0) {
      await createNotification(userId, NOTIFICATION_TYPES.WEEKLY_SUMMARY, {
        checkIns,
        quotes,
        sales
      })
    }
    
    return true
  } catch (error) {
    console.error('Error generating weekly summary:', error)
    return false
  }
}