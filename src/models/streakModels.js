/**
 * Streak Models and Configuration
 * Defines streak types, milestones, and achievements
 */

export const STREAK_CONFIG = {
  // Streak types
  types: {
    FULL: 'full',           // Morning + Evening + Sales
    PARTICIPATION: 'participation',  // Morning + Evening only
    NONE: 'none'
  },

  // Milestone definitions
  milestones: {
    full: [3, 7, 14, 21, 30, 60, 90, 180, 365],
    participation: [7, 14, 30, 60, 90, 180, 365]
  },

  // Achievement IDs for streak milestones
  achievements: {
    full: {
      3: 'sales_streak_3',
      7: 'sales_streak_7',
      14: 'sales_streak_14',
      21: 'sales_streak_21',
      30: 'sales_streak_30',
      60: 'sales_streak_60',
      90: 'sales_streak_90',
      180: 'sales_streak_180',
      365: 'sales_streak_365'
    },
    participation: {
      7: 'participation_week',
      14: 'participation_fortnight',
      30: 'participation_month',
      60: 'participation_60',
      90: 'participation_quarter',
      180: 'participation_half_year',
      365: 'participation_year'
    }
  },

  // XP rewards for streaks
  xpRewards: {
    dailyFull: 50,        // Full streak day (with sales)
    dailyParticipation: 20,  // Participation only
    milestone: {
      3: 100,
      7: 250,
      14: 500,
      21: 750,
      30: 1000,
      60: 2000,
      90: 3000,
      180: 5000,
      365: 10000
    }
  },

  // Display configuration
  display: {
    icons: {
      full: '🔥',
      participation: '✨',
      none: '📊'
    },
    colors: {
      full: 'text-orange-500',
      participation: 'text-blue-500',
      none: 'text-gray-500'
    },
    bgColors: {
      full: 'bg-orange-500/10',
      participation: 'bg-blue-500/10',
      none: 'bg-gray-500/10'
    }
  }
}

// Helper function to get next milestone
export function getNextMilestone(currentStreak, type = 'full') {
  const milestones = STREAK_CONFIG.milestones[type]
  return milestones.find(m => m > currentStreak) || null
}

// Helper function to get streak display info
export function getStreakDisplayInfo(streak, type) {
  return {
    icon: STREAK_CONFIG.display.icons[type] || STREAK_CONFIG.display.icons.none,
    color: STREAK_CONFIG.display.colors[type] || STREAK_CONFIG.display.colors.none,
    bgColor: STREAK_CONFIG.display.bgColors[type] || STREAK_CONFIG.display.bgColors.none,
    label: type === 'full' ? 'Full Streak' : type === 'participation' ? 'Check-in Streak' : 'No Streak'
  }
}

// Helper function to calculate streak percentage to next milestone
export function getStreakProgress(currentStreak, type = 'full') {
  const nextMilestone = getNextMilestone(currentStreak, type)
  if (!nextMilestone) return 100
  
  const milestones = STREAK_CONFIG.milestones[type]
  const previousMilestone = [...milestones].reverse().find(m => m <= currentStreak) || 0
  
  const progress = ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100
  return Math.min(100, Math.max(0, progress))
}