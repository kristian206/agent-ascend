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
      
      return {
        current: status.displayStreak,
        fullStreak: enhanced.fullStreak,
        participationStreak: enhanced.participationStreak,
        type: status.streakType,
        hasFullStreakToday: enhanced.hasFullStreakToday,
        hasParticipationToday: enhanced.hasParticipationToday,
        newAchievements: enhanced.newAchievements || [],
        previousXp: enhanced.previousXp || 0,
        xp: enhanced.xp || 0
      }
    } catch (error) {
      console.error('Error getting streak summary:', error)
      return {
        current: 0,
        fullStreak: 0,
        participationStreak: 0,
        type: 'none',
        hasFullStreakToday: false,
        hasParticipationToday: false,
        newAchievements: [],
        previousXp: 0,
        xp: 0
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