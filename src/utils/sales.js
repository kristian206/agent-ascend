import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { updateDoc, increment, getDoc } from 'firebase/firestore'
import { createNotification, NOTIFICATION_TYPES } from '@/src/services/notifications'

// Policy types
export const POLICY_TYPES = {
  AUTO: { id: 'auto', label: 'Auto', emoji: '🚗', points: 10 },
  HOME: { id: 'home', label: 'Home', emoji: '🏠', points: 15 },
  LIFE: { id: 'life', label: 'Life', emoji: '❤️', points: 20 },
  OTHER: { id: 'other', label: 'Other', emoji: '📋', points: 10 }
}

// Sales milestones
export const MILESTONES = [1, 10, 25, 50, 100, 250, 500, 1000]

// Log a sale
export async function logSale(userId, userData, saleData) {
  try {
    const saleId = `${userId}_${Date.now()}`
    const policyType = POLICY_TYPES[saleData.type.toUpperCase()] || POLICY_TYPES.OTHER
    
    const sale = {
      id: saleId,
      userId,
      userName: userData?.name || userData?.email || 'Agent',
      teamId: userData?.teamId || null,
      type: saleData.type,
      customerName: saleData.customerName || '',
      points: policyType.points,
      timestamp: serverTimestamp(),
      celebrated: true,
      date: new Date().toISOString().split('T')[0]
    }
    
    // Save the sale
    await setDoc(doc(db, 'sales', saleId), sale)
    
    // Update user stats
    const userRef = doc(db, 'members', userId)
    await updateDoc(userRef, {
      totalSales: increment(1),
      weekSales: increment(1),
      todaySales: increment(1),
      seasonPoints: increment(policyType.points),
      lifetimePoints: increment(policyType.points),
      xp: increment(policyType.points),
      lastSaleDate: serverTimestamp()
    })
    
    // Check for milestones
    const userDoc = await getDoc(userRef)
    const totalSales = userDoc.data()?.totalSales || 1
    
    let milestoneHit = null
    if (MILESTONES.includes(totalSales)) {
      milestoneHit = totalSales
      
      // Create milestone notification
      await createNotification(userId, NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED, {
        achievementName: `${totalSales} Sales Champion!`
      })
    }
    
    // Update team stats if applicable
    if (userData?.teamId) {
      const teamRef = doc(db, 'teams', userData.teamId)
      await updateDoc(teamRef, {
        totalSales: increment(1),
        weekSales: increment(1),
        todaySales: increment(1)
      })
      
      // Add to team feed (privacy: no numbers shown)
      await addToTeamFeed(userData.teamId, {
        userId,
        userName: userData.name || 'Teammate',
        type: 'bell_rung',
        // Don't include specific numbers or policy type
        message: `rang the bell!`,
        timestamp: serverTimestamp()
      })
    }
    
    return {
      success: true,
      points: policyType.points,
      milestoneHit,
      totalSales
    }
  } catch (error) {
    console.error('Error logging sale:', error)
    return { success: false, error: error.message }
  }
}

// Add to team feed
async function addToTeamFeed(teamId, feedItem) {
  try {
    const feedId = `${teamId}_${Date.now()}`
    await setDoc(doc(db, 'team_feed', feedId), {
      ...feedItem,
      teamId,
      id: feedId
    })
  } catch (error) {
    console.error('Error adding to team feed:', error)
  }
}

// Get today's sales for a user
export async function getTodaySales(userId) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const q = query(
      collection(db, 'sales'),
      where('userId', '==', userId),
      where('date', '==', today)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Error getting today sales:', error)
    return 0
  }
}

// Get week's sales for a user
export async function getWeekSales(userId) {
  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const q = query(
      collection(db, 'sales'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(weekAgo))
    )
    
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Error getting week sales:', error)
    return 0
  }
}

// Get team's sales today
export async function getTeamSalesToday(teamId) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const q = query(
      collection(db, 'sales'),
      where('teamId', '==', teamId),
      where('date', '==', today)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Error getting team sales:', error)
    return 0
  }
}

// Get recent team bells (feed)
export async function getRecentTeamBells(teamId, limitCount = 5) {
  try {
    const q = query(
      collection(db, 'team_feed'),
      where('teamId', '==', teamId),
      where('type', '==', 'sale'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    const bells = []
    
    snapshot.forEach((doc) => {
      bells.push(doc.data())
    })
    
    return bells
  } catch (error) {
    console.error('Error getting team bells:', error)
    return []
  }
}

// Get user's total sales
export async function getUserTotalSales(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'members', userId))
    return userDoc.data()?.totalSales || 0
  } catch (error) {
    console.error('Error getting total sales:', error)
    return 0
  }
}

// Check if user has sales streak (sold something today)
export async function checkSalesStreak(userId) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().split('T')[0]
    
    // Check today's sales
    const todayQuery = query(
      collection(db, 'sales'),
      where('userId', '==', userId),
      where('date', '==', today)
    )
    const todaySnapshot = await getDocs(todayQuery)
    
    // Check yesterday's sales
    const yesterdayQuery = query(
      collection(db, 'sales'),
      where('userId', '==', userId),
      where('date', '==', yesterdayKey)
    )
    const yesterdaySnapshot = await getDocs(yesterdayQuery)
    
    return {
      hasToday: todaySnapshot.size > 0,
      hadYesterday: yesterdaySnapshot.size > 0,
      maintaining: todaySnapshot.size > 0 && yesterdaySnapshot.size > 0
    }
  } catch (error) {
    console.error('Error checking sales streak:', error)
    return { hasToday: false, hadYesterday: false, maintaining: false }
  }
}