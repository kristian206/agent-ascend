import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
    getMessage: (data) => `Amazing! You've maintained a ${data.days} day streak. Keep the momentum going!`
  },
  [NOTIFICATION_TYPES.WEEKLY_SUMMARY]: {
    icon: '📊',
    getTitle: () => 'Weekly Summary Ready',
    getMessage: (data) => `Your week: ${data.checkIns} check-ins, ${data.quotes} quotes, ${data.sales} sales. Great work!`
  },
  [NOTIFICATION_TYPES.TEAM_MILESTONE]: {
    icon: '🎯',
    getTitle: (data) => 'Team Milestone Achieved!',
    getMessage: (data) => `Your team "${data.teamName}" reached ${data.milestone}!`
  },
  [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: {
    icon: '🏆',
    getTitle: (data) => 'Achievement Unlocked!',
    getMessage: (data) => `You've earned "${data.achievementName}"!`
  },
  [NOTIFICATION_TYPES.LEVEL_UP]: {
    icon: '⭐',
    getTitle: (data) => `Level ${data.level} Reached!`,
    getMessage: (data) => `Congratulations! You're now level ${data.level} with ${data.xp} XP.`
  }
}

// Create a notification
export async function createNotification(userId, type, data = {}) {
  try {
    const template = NOTIFICATION_TEMPLATES[type]
    if (!template) {
      console.error('Invalid notification type:', type)
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
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      where('expiresAt', '>', new Date())
    )
    
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

// Get recent notifications
export async function getRecentNotifications(userId, limitCount = 20) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('expiresAt', '>', new Date()),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    const notifications = []
    
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() })
    })
    
    return notifications
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
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('expiresAt', '>', new Date()),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  
  return onSnapshot(q, (snapshot) => {
    const notifications = []
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() })
    })
    callback(notifications)
  })
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
      const data = doc.data()
      if (data.intentions_completed) checkIns++
      if (data.wrap_completed) checkIns++
      quotes += data.quotes || 0
      sales += data.sales || 0
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