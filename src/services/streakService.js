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
      
      // Create activeStreaks array with ALL streak types (always include all 3)
      const activeStreaks = [
        {
          type: 'login',
          count: enhanced.fullStreak || 0,
          longestStreak: enhanced.fullStreak || 0,
          isActive: enhanced.hasFullStreakToday || false,
          isProtectedToday: false
        },
        {
          type: 'intentions',
          count: enhanced.participationStreak || 0,
          longestStreak: enhanced.participationStreak || 0,
          isActive: enhanced.hasParticipationToday || false,
          isProtectedToday: false
        },
        {
          type: 'sales',
          count: enhanced.fullStreak || 0, // Use fullStreak as it requires sales
          longestStreak: enhanced.fullStreak || 0,
          isActive: enhanced.hasFullStreakToday || false,
          isProtectedToday: false
        }
      ]
      
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