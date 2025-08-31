/**
 * Season System Models
 * Monthly competitive seasons with Overwatch-style ranking
 */

// Season Model
export const SeasonSchema = {
  id: '', // Auto-generated
  seasonNumber: 0, // Incremental season number
  startDate: null, // Season start date
  endDate: null, // Season end date
  status: 'active', // 'upcoming', 'active', 'ended', 'processing'
  
  // Season metadata
  name: '', // e.g., "Season 12 - December 2024"
  theme: '', // Optional seasonal theme
  
  // Participation stats
  totalParticipants: 0,
  activeParticipants: 0,
  
  // Rewards and bonuses
  rankRewards: {}, // Rewards per rank achieved
  specialEvents: [], // Special events during season
  
  createdAt: null,
  processedAt: null // When season-end processing completed
}

// User Season Progress Model
export const UserSeasonSchema = {
  id: '', // {userId}_{seasonId}
  userId: '',
  seasonId: '',
  
  // Current rank information
  currentRank: 'bronze', // Current rank tier
  currentDivision: 5, // Division within tier (1-5, 1 is highest)
  currentSR: 0, // Season Rating (0-5000)
  
  // Points tracking
  seasonPoints: 0, // Current season points
  dailyPoints: {}, // Track daily point earnings { '2024-01-15': 25 }
  
  // Activity tracking
  loginDays: 0,
  intentionsCompleted: 0,
  wrapsCompleted: 0,
  policiesSold: {
    house: 0,
    car: 0,
    condo: 0,
    life: 0,
    other: 0
  },
  cheersSent: 0,
  cheersReceived: 0,
  
  // Bonuses
  individualGoalBonus: false, // 10% bonus applied
  teamGoalBonus: false, // 10% bonus applied
  bonusPointsEarned: 0,
  
  // Rank history
  placementRank: '', // Initial placement this season
  peakRank: '', // Highest rank achieved this season
  rankHistory: [], // [{date, rank, division, sr}]
  
  // Stats
  winStreak: 0,
  bestStreak: 0,
  daysActive: 0,
  lastActiveDate: null,
  
  createdAt: null,
  updatedAt: null
}

// Lifetime Progression Model
export const LifetimeProgressionSchema = {
  id: '', // userId
  userId: '',
  
  // Lifetime XP and Level
  lifetimeXP: 0,
  level: 1,
  prestigeLevel: 0, // After level 100, prestige system
  
  // Career stats
  totalSeasons: 0,
  seasonsParticipated: [],
  
  // Career highs
  highestRankEver: '',
  highestSREver: 0,
  bestSeasonPoints: 0,
  bestSeasonId: '',
  
  // Cumulative stats
  totalLoginDays: 0,
  totalIntentions: 0,
  totalWraps: 0,
  totalPolicies: {
    house: 0,
    car: 0,
    condo: 0,
    life: 0,
    other: 0
  },
  totalCheersSent: 0,
  totalCheersReceived: 0,
  
  // Rank distribution (time spent in each rank)
  rankTimeDistribution: {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    diamond: 0,
    master: 0,
    grandmaster: 0
  },
  
  // Achievements and badges
  achievements: [],
  seasonEndRewards: [], // [{seasonId, rank, rewards}]
  
  createdAt: null,
  updatedAt: null
}

// Rank Structure (Overwatch-style)
export const RANKS = {
  bronze: {
    name: 'Bronze',
    tier: 1,
    srMin: 0,
    srMax: 1499,
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #8B4513 0%, #CD7F32 100%)',
    icon: '🥉',
    divisions: 5,
    startingBonus: 0 // No bonus for bronze
  },
  silver: {
    name: 'Silver',
    tier: 2,
    srMin: 1500,
    srMax: 1999,
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #808080 0%, #C0C0C0 100%)',
    icon: '🥈',
    divisions: 5,
    startingBonus: 50 // Small bonus next season
  },
  gold: {
    name: 'Gold',
    tier: 3,
    srMin: 2000,
    srMax: 2499,
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
    icon: '🥇',
    divisions: 5,
    startingBonus: 100
  },
  platinum: {
    name: 'Platinum',
    tier: 4,
    srMin: 2500,
    srMax: 2999,
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #4A90E2 0%, #E5E4E2 100%)',
    icon: '💎',
    divisions: 5,
    startingBonus: 200
  },
  diamond: {
    name: 'Diamond',
    tier: 5,
    srMin: 3000,
    srMax: 3499,
    color: '#B9F2FF',
    gradient: 'linear-gradient(135deg, #00D4FF 0%, #B9F2FF 100%)',
    icon: '💠',
    divisions: 5,
    startingBonus: 300
  },
  master: {
    name: 'Master',
    tier: 6,
    srMin: 3500,
    srMax: 3999,
    color: '#FFA500',
    gradient: 'linear-gradient(135deg, #FF6B00 0%, #FFA500 100%)',
    icon: '⭐',
    divisions: 5,
    startingBonus: 500
  },
  grandmaster: {
    name: 'Grandmaster',
    tier: 7,
    srMin: 4000,
    srMax: 5000,
    color: '#FF1744',
    gradient: 'linear-gradient(135deg, #FF1744 0%, #FFD600 100%)',
    icon: '👑',
    divisions: 5,
    startingBonus: 750
  }
}

// Points Configuration
export const POINTS_CONFIG = {
  // Daily activities
  login: 1,
  dailyIntentions: 10,
  nightlyWrap: 10,
  
  // Insurance policies
  policies: {
    house: 50,
    car: 50,
    condo: 50,
    life: 50,
    other: 20
  },
  
  // Social
  cheerSent: 1,
  cheerReceived: 1,
  maxCheersPerDay: 5,
  
  // Bonuses
  individualGoalBonus: 0.1, // 10%
  teamGoalBonus: 0.1, // 10%
  
  // Streak bonuses
  streakMilestones: {
    3: 5,   // 3-day streak
    7: 15,  // Week streak
    14: 30, // 2-week streak
    30: 75  // Month streak
  }
}

// Season Transition Rules
export const SEASON_TRANSITION = {
  // Soft reset - players drop but not to bottom
  rankDecay: {
    bronze: { keepDivisions: 0 }, // Stay in bronze
    silver: { keepDivisions: 2 }, // Drop 3 divisions
    gold: { keepDivisions: 2 },
    platinum: { keepDivisions: 2 },
    diamond: { keepDivisions: 1 }, // Drop 4 divisions
    master: { keepDivisions: 1 },
    grandmaster: { keepDivisions: 0 } // Drop to Master 1
  },
  
  // Placement matches (first 5 activities determine initial rank)
  placementActivities: 5,
  
  // XP conversion (season points to lifetime XP)
  seasonToXPRatio: 1, // 1:1 conversion
  
  // Level progression
  xpPerLevel: 1000,
  prestigeAfterLevel: 100
}

// Utility Functions
export const SeasonUtils = {
  // Get current season
  getCurrentSeason() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    return `${year}-${month.toString().padStart(2, '0')}`
  },
  
  // Calculate SR from points
  pointsToSR(points) {
    // Logarithmic scale for fair distribution
    // 0-100 pts = Bronze (0-1499 SR)
    // 100-300 pts = Silver (1500-1999 SR)
    // 300-600 pts = Gold (2000-2499 SR)
    // 600-1000 pts = Platinum (2500-2999 SR)
    // 1000-1500 pts = Diamond (3000-3499 SR)
    // 1500-2500 pts = Master (3500-3999 SR)
    // 2500+ pts = Grandmaster (4000+ SR)
    
    if (points < 100) return Math.floor(points * 15)
    if (points < 300) return 1500 + Math.floor((points - 100) * 2.5)
    if (points < 600) return 2000 + Math.floor((points - 300) * 1.67)
    if (points < 1000) return 2500 + Math.floor((points - 600) * 1.25)
    if (points < 1500) return 3000 + Math.floor((points - 1000) * 1)
    if (points < 2500) return 3500 + Math.floor((points - 1500) * 0.5)
    return Math.min(5000, 4000 + Math.floor((points - 2500) * 0.4))
  },
  
  // Get rank from SR
  getRankFromSR(sr) {
    for (const [key, rank] of Object.entries(RANKS)) {
      if (sr >= rank.srMin && sr <= rank.srMax) {
        const division = 5 - Math.floor((sr - rank.srMin) / ((rank.srMax - rank.srMin) / 5))
        return {
          rank: key,
          division: Math.max(1, Math.min(5, division)),
          ...rank
        }
      }
    }
    return { rank: 'bronze', division: 5, ...RANKS.bronze }
  },
  
  // Calculate next rank progress
  getProgressToNextRank(sr, currentRank) {
    const rank = RANKS[currentRank]
    if (!rank) return { progress: 0, pointsNeeded: 0 }
    
    const divisionSize = (rank.srMax - rank.srMin) / 5
    const currentDivisionMin = rank.srMin + (4 - Math.floor((sr - rank.srMin) / divisionSize)) * divisionSize
    const currentDivisionMax = currentDivisionMin + divisionSize
    
    const progress = ((sr - currentDivisionMin) / divisionSize) * 100
    const pointsNeeded = Math.ceil(currentDivisionMax - sr)
    
    return { progress, pointsNeeded }
  },
  
  // Calculate season end date
  getSeasonEndDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    // Last day of current month at 11:59 PM
    return new Date(year, month + 1, 0, 23, 59, 59)
  },
  
  // Days remaining in season
  getDaysRemaining() {
    const now = new Date()
    const endDate = this.getSeasonEndDate()
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.ceil((endDate - now) / msPerDay)
  }
}

export const SeasonModels = {
  SeasonSchema,
  UserSeasonSchema,
  LifetimeProgressionSchema,
  RANKS,
  POINTS_CONFIG,
  SEASON_TRANSITION,
  SeasonUtils
}
export default SeasonModels