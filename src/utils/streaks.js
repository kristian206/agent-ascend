import { doc, getDoc, setDoc, collection, query, where, getDocs, increment } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { STREAK_CONFIG } from '@/src/models/streakModels'

/**
 * Enhanced streak calculation with sales requirement
 * Full Streak: Morning + Evening + At least 1 sale
 * Participation Streak: Morning + Evening (no sale required)
 */
export async function calculateEnhancedStreak(userId) {
  try {
    const today = new Date()
    const todayKey = today.toISOString().split('T')[0]
    
    // Get today's check-in
    const todayDoc = await getDoc(doc(db, 'checkins', `${userId}_${todayKey}`))
    
    if (!todayDoc.exists()) {
      return { 
        fullStreak: 0, 
        participationStreak: 0, 
        hasFullStreakToday: false,
        hasParticipationToday: false,
        newAchievements: []
      }
    }
    
    const todayData = todayDoc.data()
    const hasMorning = todayData.intentions_completed || false
    const hasEvening = todayData.wrap_completed || false
    
    // Check if user rang at least one bell today
    const todaySalesQuery = query(
      collection(db, 'sales'),
      where('userId', '==', userId),
      where('date', '==', todayKey)
    )
    const salesSnapshot = await getDocs(todaySalesQuery)
    const hasRungBell = salesSnapshot.size > 0
    
    // Determine today's streak status
    const hasFullStreakToday = hasMorning && hasEvening && hasRungBell
    const hasParticipationToday = hasMorning && hasEvening
    
    // Calculate both streak types
    let fullStreak = hasFullStreakToday ? 1 : 0
    let participationStreak = hasParticipationToday ? 1 : 0
    
    // Look back through previous days
    let checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - 1) // Start from yesterday
    
    while (participationStreak > 0 || fullStreak > 0) {
      const dateKey = checkDate.toISOString().split('T')[0]
      const checkDoc = await getDoc(doc(db, 'checkins', `${userId}_${dateKey}`))
      
      if (checkDoc.exists()) {
        const data = checkDoc.data()
        const dayHasMorning = data.intentions_completed || false
        const dayHasEvening = data.wrap_completed || false
        
        // Check for sales on this day
        const daySalesQuery = query(
          collection(db, 'sales'),
          where('userId', '==', userId),
          where('date', '==', dateKey)
        )
        const daySalesSnapshot = await getDocs(daySalesQuery)
        const dayHasSale = daySalesSnapshot.size > 0
        
        // Update streaks based on this day
        if (dayHasMorning && dayHasEvening) {
          if (participationStreak > 0) {
            participationStreak++
          }
          
          if (dayHasSale && fullStreak > 0) {
            fullStreak++
          } else if (!dayHasSale && fullStreak > 0) {
            // Full streak broken (no sale)
            fullStreak = hasFullStreakToday ? 1 : 0
            break
          }
        } else {
          // Both streaks broken
          break
        }
        
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // No data for this day, streaks broken
        break
      }
      
      // Limit lookback to 365 days
      if (participationStreak > 365) break
    }
    
    // Update user document with new streaks
    const userRef = doc(db, 'members', userId)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data() || {}
    
    // Check for new achievements
    const newAchievements = []
    const existingAchievements = userData.achievements || []
    
    // Full streak achievements (with sales)
    if (fullStreak >= 3 && !existingAchievements.includes('sales_streak_3')) {
      newAchievements.push('sales_streak_3')
    }
    if (fullStreak >= 7 && !existingAchievements.includes('sales_streak_7')) {
      newAchievements.push('sales_streak_7')
    }
    if (fullStreak >= 14 && !existingAchievements.includes('sales_streak_14')) {
      newAchievements.push('sales_streak_14')
    }
    if (fullStreak >= 30 && !existingAchievements.includes('sales_streak_30')) {
      newAchievements.push('sales_streak_30')
    }
    
    // Participation streak achievements
    if (participationStreak >= 7 && !existingAchievements.includes('participation_week')) {
      newAchievements.push('participation_week')
    }
    if (participationStreak >= 30 && !existingAchievements.includes('participation_month')) {
      newAchievements.push('participation_month')
    }
    
    // Check for milestone XP rewards
    let xpEarned = 0
    const achievedMilestones = userData.achievedMilestones || {}
    const newMilestones = []
    
    // Check full streak milestones
    if (fullStreak > 0) {
      const fullMilestones = STREAK_CONFIG.milestones.full
      for (const milestone of fullMilestones) {
        if (fullStreak >= milestone && !achievedMilestones[`full_${milestone}`]) {
          xpEarned += STREAK_CONFIG.xpRewards.milestone[milestone]
          achievedMilestones[`full_${milestone}`] = {
            achievedAt: new Date().toISOString(),
            xpAwarded: STREAK_CONFIG.xpRewards.milestone[milestone]
          }
          newMilestones.push({
            type: 'full',
            days: milestone,
            xp: STREAK_CONFIG.xpRewards.milestone[milestone]
          })
        }
      }
    }
    
    // Check participation streak milestones
    if (participationStreak > 0) {
      const participationMilestoneMap = {
        7: 250,
        14: 500,
        30: 1000,
        60: 2000,
        90: 3000,
        180: 5000,
        365: 10000
      }
      
      for (const [milestone, xpValue] of Object.entries(participationMilestoneMap)) {
        const days = parseInt(milestone)
        if (participationStreak >= days && !achievedMilestones[`participation_${days}`]) {
          xpEarned += xpValue
          achievedMilestones[`participation_${days}`] = {
            achievedAt: new Date().toISOString(),
            xpAwarded: xpValue
          }
          newMilestones.push({
            type: 'participation',
            days,
            xp: xpValue
          })
        }
      }
    }
    
    // Update achievements
    const allAchievements = [...existingAchievements, ...newAchievements]
    
    // Build update object
    const updateData = {
      streak: fullStreak,  // Main streak requires sales
      participationStreak,  // Secondary streak for check-ins only
      fullStreak,
      achievements: allAchievements,
      achievedMilestones,
      lastStreakUpdate: todayKey
    }
    
    // Only increment XP if earned
    if (xpEarned > 0) {
      updateData.xp = increment(xpEarned)
      updateData.lifetimePoints = increment(xpEarned)
    }
    
    await setDoc(userRef, updateData, { merge: true })
    
    return {
      fullStreak,
      participationStreak,
      hasFullStreakToday,
      hasParticipationToday,
      newAchievements,
      previousXp: userData.xp || 0,
      xp: (userData.xp || 0) + xpEarned,
      xpEarned,
      newMilestones
    }
  } catch (error) {
    console.error('Error calculating enhanced streak:', error)
    console.error('Enhanced streak calculation error details:', {
      errorMessage: error.message,
      errorStack: error.stack,
      userId,
      timestamp: new Date().toISOString(),
      function: 'calculateEnhancedStreak'
    })
    return {
      fullStreak: 0,
      participationStreak: 0,
      hasFullStreakToday: false,
      hasParticipationToday: false,
      newAchievements: []
    }
  }
}

// Get user's streak status for display
export async function getUserStreakStatus(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'members', userId))
    if (!userDoc.exists()) {
      return {
        fullStreak: 0,
        participationStreak: 0,
        displayStreak: 0,
        streakType: 'none'
      }
    }
    
    const userData = userDoc.data()
    const fullStreak = userData.fullStreak || userData.streak || 0
    const participationStreak = userData.participationStreak || 0
    
    // Determine which streak to display
    let displayStreak = fullStreak
    let streakType = 'full'
    
    if (fullStreak === 0 && participationStreak > 0) {
      displayStreak = participationStreak
      streakType = 'participation'
    }
    
    return {
      fullStreak,
      participationStreak,
      displayStreak,
      streakType
    }
  } catch (error) {
    console.error('Error getting streak status:', error)
    console.error('Streak status error details:', {
      errorMessage: error.message,
      errorStack: error.stack,
      userId,
      timestamp: new Date().toISOString(),
      function: 'getUserStreakStatus'
    })
    return {
      fullStreak: 0,
      participationStreak: 0,
      displayStreak: 0,
      streakType: 'none'
    }
  }
}