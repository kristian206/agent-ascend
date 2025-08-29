import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function calculateStreakForToday(userId) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const docRef = doc(db, 'checkins', `${userId}_${today}`)
    const todayDoc = await getDoc(docRef)
    
    if (!todayDoc.exists()) {
      return { streak: 0, newStreak: false, newAchievements: [] }
    }
    
    const todayData = todayDoc.data()
    
    // Both morning and evening must be complete for streak
    if (!todayData.intentions_completed || !todayData.wrap_completed) {
      // Get current streak without incrementing
      const userDoc = await getDoc(doc(db, 'members', userId))
      const currentStreak = userDoc.data()?.streak || 0
      return { streak: currentStreak, newStreak: false, newAchievements: [] }
    }
    
    // Calculate streak by checking consecutive days
    let streak = 1 // Today counts
    let checkDate = new Date()
    checkDate.setDate(checkDate.getDate() - 1) // Start from yesterday
    
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0]
      const checkDoc = await getDoc(doc(db, 'checkins', `${userId}_${dateKey}`))
      
      if (checkDoc.exists()) {
        const data = checkDoc.data()
        if (data.intentions_completed && data.wrap_completed) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      } else {
        break
      }
      
      // Limit lookback to 365 days
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
      lastStreakUpdate: today
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