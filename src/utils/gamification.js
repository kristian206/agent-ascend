import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { isBusinessDay, getPreviousBusinessDay, countBusinessDaysBetween } from '@/src/utils/businessDays'

export async function calculateStreakForToday(userId) {
  try {
    const today = new Date()
    const todayKey = today.toISOString().split('T')[0]
    
    // Only count streaks on business days
    if (!isBusinessDay(today)) {
      // If today is not a business day, return the current streak without changes
      const userDoc = await getDoc(doc(db, 'members', userId))
      const currentStreak = userDoc.data()?.streak || 0
      return { streak: currentStreak, newStreak: false, newAchievements: [] }
    }
    
    const docRef = doc(db, 'checkins', `${userId}_${todayKey}`)
    const todayDoc = await getDoc(docRef)
    
    if (!todayDoc.exists()) {
      // Check if streak should be broken
      const userDoc = await getDoc(doc(db, 'members', userId))
      const userData = userDoc.data() || {}
      const lastActivityDate = userData.lastActivityDate?.toDate?.() || userData.lastActivityDate
      
      if (lastActivityDate) {
        const previousBusinessDay = getPreviousBusinessDay(today)
        const lastActivityKey = new Date(lastActivityDate).toISOString().split('T')[0]
        const previousBusinessKey = previousBusinessDay.toISOString().split('T')[0]
        
        // If last activity was not on the previous business day, reset streak
        if (lastActivityKey !== previousBusinessKey) {
          await setDoc(doc(db, 'members', userId), {
            ...userData,
            streak: 0
          }, { merge: true })
          return { streak: 0, newStreak: false, newAchievements: [] }
        }
      }
      
      return { streak: userData.streak || 0, newStreak: false, newAchievements: [] }
    }
    
    const todayData = todayDoc.data()
    
    // Both morning and evening must be complete for streak
    if (!todayData.intentions_completed || !todayData.wrap_completed) {
      // Get current streak without incrementing
      const userDoc = await getDoc(doc(db, 'members', userId))
      const currentStreak = userDoc.data()?.streak || 0
      return { streak: currentStreak, newStreak: false, newAchievements: [] }
    }
    
    // Calculate streak by checking consecutive business days
    let streak = 1 // Today counts
    let checkDate = new Date(today)
    checkDate = getPreviousBusinessDay(checkDate) // Start from previous business day
    
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0]
      const checkDoc = await getDoc(doc(db, 'checkins', `${userId}_${dateKey}`))
      
      if (checkDoc.exists()) {
        const data = checkDoc.data()
        if (data.intentions_completed && data.wrap_completed) {
          streak++
          checkDate = getPreviousBusinessDay(checkDate)
        } else {
          break
        }
      } else {
        break
      }
      
      // Limit lookback to 365 business days
      if (streak > 365) break
    }
    
    // Update user document with new streak
    const userRef = doc(db, 'members', userId)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data() || {}
    const previousStreak = userData.streak || 0
    
    // Check for new achievements
    const newAchievements = []
    const existingAchievements = userData.achievements || []
    
    // Streak achievements
    if (streak >= 3 && !existingAchievements.includes('hot_streak')) {
      newAchievements.push('hot_streak')
    }
    if (streak >= 7 && !existingAchievements.includes('week_warrior')) {
      newAchievements.push('week_warrior')
    }
    if (streak >= 10 && !existingAchievements.includes('streak_hero')) {
      newAchievements.push('streak_hero')
    }
    if (streak >= 30 && !existingAchievements.includes('streak_legend')) {
      newAchievements.push('streak_legend')
    }
    
    // Sales achievements (check recent sales)
    if (todayData.sales > 0) {
      const salesQuery = query(
        collection(db, 'checkins'),
        where('user_id', '==', userId),
        where('sales', '>', 0),
        orderBy('date', 'desc'),
        limit(30)
      )
      const salesSnapshot = await getDocs(salesQuery)
      const daysWithSales = salesSnapshot.size
      
      if (daysWithSales >= 5 && !existingAchievements.includes('closer')) {
        newAchievements.push('closer')
      }
      if (daysWithSales >= 10 && !existingAchievements.includes('sales_champion')) {
        newAchievements.push('sales_champion')
      }
    }
    
    // Update achievements
    const allAchievements = [...existingAchievements, ...newAchievements]
    
    await setDoc(userRef, {
      streak,
      achievements: allAchievements,
      lastStreakUpdate: todayKey,
      lastActivityDate: today
    }, { merge: true })
    
    // Add achievements to today's record
    if (newAchievements.length > 0) {
      await setDoc(docRef, {
        newly_unlocked_achievements: newAchievements
      }, { merge: true })
    }
    
    return {
      streak,
      newStreak: streak > previousStreak,
      newAchievements,
      allAchievements
    }
    
  } catch (error) {
    console.error('Error calculating streak:', error)
    return { streak: 0, newStreak: false, newAchievements: [] }
  }
}

export function getAchievementDetails(achievementId) {
  const achievements = {
    hot_streak: {
      name: '🔥 Hot Streak',
      description: '3 days in a row',
      points: 50
    },
    week_warrior: {
      name: '⚡ Week Warrior',
      description: '7 days in a row',
      points: 100
    },
    streak_hero: {
      name: '🦸 Streak Hero',
      description: '10 days in a row',
      points: 200
    },
    streak_legend: {
      name: '👑 Streak Legend',
      description: '30 days in a row',
      points: 500
    },
    closer: {
      name: '💰 Closer',
      description: '5 days with sales',
      points: 150
    },
    sales_champion: {
      name: '🏆 Sales Champion',
      description: '10 days with sales',
      points: 300
    },
    consistency_champ: {
      name: '⭐ Consistency Champ',
      description: '30 total check-ins',
      points: 250
    }
  }
  
  return achievements[achievementId] || { name: achievementId, description: '', points: 0 }
}

// Legacy functions for backward compatibility
export async function calculateStreak(userId, checkins = null) {
  return calculateStreakForToday(userId)
}

export function checkAchievements(checkins, currentStreak, todaySales = 0) {
  // This is now handled in calculateStreakForToday
  return []
}