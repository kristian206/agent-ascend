/**
 * Streak Service
 * Handles all streak-related operations
 */

import { calculateEnhancedStreak, getUserStreakStatus } from '@/src/utils/streaks'

const streakService = {
  /**
   * Get comprehensive streak summary for a user
   */
  async getStreakSummary(userId) {
    try {
      // Get current streak status
      const status = await getUserStreakStatus(userId)
      
      // Calculate enhanced streak with achievements
      const enhanced = await calculateEnhancedStreak(userId)
      
      // Create activeStreaks array with the expected structure for StreakDisplay
      const activeStreaks = []
      
      // Add login streak
      if (enhanced.fullStreak > 0 || enhanced.hasFullStreakToday) {
        activeStreaks.push({
          type: 'login',
          count: enhanced.fullStreak,
          longestStreak: enhanced.fullStreak, // TODO: Track actual longest streak
          isActive: enhanced.hasFullStreakToday,
          isProtectedToday: false // TODO: Implement weekend/holiday protection
        })
      }
      
      // Add participation streak as intentions
      if (enhanced.participationStreak > 0 || enhanced.hasParticipationToday) {
        activeStreaks.push({
          type: 'intentions',
          count: enhanced.participationStreak,
          longestStreak: enhanced.participationStreak,
          isActive: enhanced.hasParticipationToday,
          isProtectedToday: false
        })
      }
      
      // Add sales streak (placeholder - implement based on actual sales data)
      activeStreaks.push({
        type: 'sales',
        count: 0, // TODO: Implement sales streak tracking
        longestStreak: 0,
        isActive: false,
        isProtectedToday: false
      })
      
      // Calculate perfect days (days where all streaks were maintained)
      const perfectDays = Math.min(enhanced.fullStreak, enhanced.participationStreak)
      
      return {
        // Legacy properties for backward compatibility
        current: status.displayStreak,
        fullStreak: enhanced.fullStreak,
        participationStreak: enhanced.participationStreak,
        type: status.streakType,
        hasFullStreakToday: enhanced.hasFullStreakToday,
        hasParticipationToday: enhanced.hasParticipationToday,
        newAchievements: enhanced.newAchievements || [],
        previousXp: enhanced.previousXp || 0,
        xp: enhanced.xp || 0,
        
        // New properties expected by StreakDisplay
        activeStreaks,
        perfectDays
      }
    } catch (error) {
      console.error('Error getting streak summary:', error)
      console.error('Streak service error details:', {
        errorMessage: error.message,
        errorStack: error.stack,
        userId,
        timestamp: new Date().toISOString()
      })
      return {
        // Legacy properties
        current: 0,
        fullStreak: 0,
        participationStreak: 0,
        type: 'none',
        hasFullStreakToday: false,
        hasParticipationToday: false,
        newAchievements: [],
        previousXp: 0,
        xp: 0,
        
        // New properties expected by StreakDisplay
        activeStreaks: [],
        perfectDays: 0
      }
    }
  },

  /**
   * Calculate and update user's streak
   */
  async updateStreak(userId) {
    return await calculateEnhancedStreak(userId)
  },

  /**
   * Get streak status for display
   */
  async getStreakStatus(userId) {
    return await getUserStreakStatus(userId)
  }
}

export default streakService