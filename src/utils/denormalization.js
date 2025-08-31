// Data denormalization utilities for performance optimization
import { db } from '@/src/services/firebase'
import { doc, setDoc, increment, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { withRetry } from './errorHandler'

// Update monthly totals when a sale is logged
export async function updateMonthlyTotals(saleData) {
  const { userId, teamId, month, totalCommission, totalRevenue, products } = saleData
  
  if (!userId || !month) {
    // Missing required fields for monthly totals update
    return
  }

  const batch = writeBatch(db)
  
  try {
    // Update user's monthly total
    const userMonthlyRef = doc(db, 'monthlyTotals', `${userId}_${month}`)
    const userMonthlyDoc = await getDoc(userMonthlyRef)
    
    if (userMonthlyDoc.exists()) {
      // Increment existing totals
      batch.update(userMonthlyRef, {
        totalCommission: increment(totalCommission || 0),
        totalRevenue: increment(totalRevenue || 0),
        salesCount: increment(1),
        lastUpdated: serverTimestamp()
      })
      
      // Update product counts
      const existingData = userMonthlyDoc.data()
      const updatedProductCounts = { ...(existingData.productCounts || {}) }
      
      if (products) {
        Object.entries(products).forEach(([product, quantity]) => {
          if (quantity > 0) {
            updatedProductCounts[product] = (updatedProductCounts[product] || 0) + quantity
          }
        })
      }
      
      batch.update(userMonthlyRef, {
        productCounts: updatedProductCounts
      })
    } else {
      // Create new monthly total document
      batch.set(userMonthlyRef, {
        userId,
        teamId,
        month,
        totalCommission: totalCommission || 0,
        totalRevenue: totalRevenue || 0,
        salesCount: 1,
        productCounts: products || {},
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      })
    }
    
    // Update team's monthly total if teamId exists
    if (teamId) {
      const teamMonthlyRef = doc(db, 'teamMonthlyTotals', `${teamId}_${month}`)
      const teamMonthlyDoc = await getDoc(teamMonthlyRef)
      
      if (teamMonthlyDoc.exists()) {
        batch.update(teamMonthlyRef, {
          totalCommission: increment(totalCommission || 0),
          totalRevenue: increment(totalRevenue || 0),
          salesCount: increment(1),
          lastUpdated: serverTimestamp()
        })
      } else {
        batch.set(teamMonthlyRef, {
          teamId,
          month,
          totalCommission: totalCommission || 0,
          totalRevenue: totalRevenue || 0,
          salesCount: 1,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        })
      }
    }
    
    // Commit the batch
    await withRetry(async () => {
      await batch.commit()
    }, 3, 1000)
    
    // Monthly totals updated successfully
  } catch (error) {
    console.error('Error updating monthly totals:', error)
    // Don't throw - this is a non-critical optimization
  }
}

// Update user stats (points, level, streak) - denormalized in user document
export async function updateUserStats(userId, points, activityType) {
  if (!userId) return
  
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      // User document not found for stats update
      return
    }
    
    const userData = userDoc.data()
    const currentPoints = userData.lifetimePoints || 0
    const newPoints = currentPoints + points
    
    // Calculate new level (every 1000 points = 1 level)
    const newLevel = Math.floor(newPoints / 1000) + 1
    
    // Update streak if activity is daily
    const lastActivity = userData.lastActivityDate?.toDate?.() || new Date(0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    lastActivity.setHours(0, 0, 0, 0)
    
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24))
    let newStreak = userData.streak || 0
    
    if (daysDiff === 1) {
      // Consecutive day - increment streak
      newStreak++
    } else if (daysDiff > 1) {
      // Streak broken - reset to 1
      newStreak = 1
    }
    // If daysDiff === 0, same day activity, don't change streak
    
    // Update user document
    await withRetry(async () => {
      await setDoc(userRef, {
        lifetimePoints: newPoints,
        level: newLevel,
        streak: newStreak,
        lastActivityDate: serverTimestamp(),
        lastActivityType: activityType
      }, { merge: true })
    }, 3, 1000)
    
    // User stats updated successfully
  } catch (error) {
    console.error('Error updating user stats:', error)
    // Don't throw - this is a non-critical optimization
  }
}

// Pre-calculate and cache leaderboard rankings
export async function updateLeaderboardCache() {
  try {
    // This would typically be run as a scheduled Cloud Function
    // For now, we'll just outline the structure
    
    const periods = ['week', 'month', 'all']
    const batch = writeBatch(db)
    
    for (const period of periods) {
      // Calculate rankings for each period
      // Store in a cache collection for fast retrieval
      const cacheRef = doc(db, 'leaderboardCache', period)
      
      // This would fetch and rank all users
      // For demonstration, we'll just set the structure
      batch.set(cacheRef, {
        period,
        rankings: [], // Would contain sorted user rankings
        lastUpdated: serverTimestamp(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minute cache
      })
    }
    
    await batch.commit()
    // Leaderboard cache updated
  } catch (error) {
    console.error('Error updating leaderboard cache:', error)
  }
}

// Aggregate daily metrics for dashboard
export async function aggregateDailyMetrics(userId, date) {
  if (!userId || !date) return
  
  const dateStr = date.toISOString().split('T')[0]
  const metricsRef = doc(db, 'dailyMetrics', `${userId}_${dateStr}`)
  
  try {
    // This would aggregate all activities for the day
    // And store them in a single document for fast dashboard loading
    await setDoc(metricsRef, {
      userId,
      date: dateStr,
      salesToday: 0, // Would be calculated
      leadsConverted: 0, // Would be calculated
      activitiesCompleted: 0, // Would be calculated
      pointsEarned: 0, // Would be calculated
      commissionEarned: 0, // Would be calculated
      lastUpdated: serverTimestamp()
    }, { merge: true })
    
    // Daily metrics aggregated
  } catch (error) {
    console.error('Error aggregating daily metrics:', error)
  }
}

// Batch update for multiple denormalized fields
export async function batchUpdateDenormalizedData(updates) {
  const batch = writeBatch(db)
  let operationCount = 0
  const MAX_BATCH_SIZE = 500 // Firestore limit
  
  try {
    for (const update of updates) {
      const { collection: collectionName, docId, data } = update
      const ref = doc(db, collectionName, docId)
      batch.set(ref, data, { merge: true })
      
      operationCount++
      
      // Commit and start new batch if we hit the limit
      if (operationCount >= MAX_BATCH_SIZE) {
        await batch.commit()
        operationCount = 0
        // Start new batch for remaining updates
      }
    }
    
    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit()
    }
    
    // Batch denormalization update completed
  } catch (error) {
    console.error('Error in batch denormalization update:', error)
    throw error
  }
}

export const DenormalizationUtils = {
  updateMonthlyTotals,
  updateUserStats,
  updateLeaderboardCache,
  aggregateDailyMetrics,
  batchUpdateDenormalizedData
}

export default DenormalizationUtils