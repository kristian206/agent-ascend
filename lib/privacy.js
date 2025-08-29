/**
 * Privacy utilities for protecting user performance data
 * Core principle: Users see their exact numbers, others see only percentages
 */

// Privacy levels for different viewers
export const PRIVACY_LEVELS = {
  SELF: 'self',           // Viewing own data - see everything
  TEAM_MEMBER: 'member',  // Team member - see percentages only
  LEADER: 'leader',       // Team leader - see aggregates
  PUBLIC: 'public'        // No team relationship - minimal data
}

// Determine privacy level between viewer and target
export function getPrivacyLevel(viewerId, targetId, viewerRole, targetTeamId, viewerTeamId) {
  // Viewing self
  if (viewerId === targetId) {
    return PRIVACY_LEVELS.SELF
  }
  
  // Not on same team
  if (!targetTeamId || !viewerTeamId || targetTeamId !== viewerTeamId) {
    return PRIVACY_LEVELS.PUBLIC
  }
  
  // Team leader/co-leader viewing team member
  if (viewerRole === 'leader' || viewerRole === 'co-leader') {
    return PRIVACY_LEVELS.LEADER
  }
  
  // Team member viewing another team member
  return PRIVACY_LEVELS.TEAM_MEMBER
}

// Filter user data based on privacy level
export function filterUserData(userData, privacyLevel) {
  if (!userData) return null
  
  switch (privacyLevel) {
    case PRIVACY_LEVELS.SELF:
      // User sees everything about themselves
      return userData
      
    case PRIVACY_LEVELS.LEADER:
      // Leaders see percentages and aggregates
      return {
        ...userData,
        // Hide exact current numbers
        todayPoints: undefined,
        weekPoints: undefined,
        monthPoints: undefined,
        todaySales: undefined,
        weekSales: undefined,
        monthSales: undefined,
        // Keep percentages
        weeklyProgress: calculateProgress(userData.weekPoints, userData.weeklyGoal),
        monthlyProgress: calculateProgress(userData.monthPoints, userData.monthlyGoal),
        // Keep lifetime stats (career achievements)
        lifetimePoints: userData.lifetimePoints,
        totalSales: userData.totalSales,
        // Keep streaks and achievements
        streak: userData.streak,
        participationStreak: userData.participationStreak,
        achievements: userData.achievements,
        level: userData.level
      }
      
    case PRIVACY_LEVELS.TEAM_MEMBER:
      // Team members see only percentages
      return {
        name: userData.name,
        email: userData.email,
        teamRole: userData.teamRole,
        // Progress as percentages only
        weeklyProgress: calculateProgress(userData.weekPoints, userData.weeklyGoal),
        monthlyProgress: calculateProgress(userData.monthPoints, userData.monthlyGoal),
        // Lifetime stats (okay to show)
        lifetimePoints: userData.lifetimePoints,
        totalSales: userData.totalSales,
        memberSince: userData.createdAt,
        // Streaks and achievements (motivational)
        streak: userData.streak,
        participationStreak: userData.participationStreak,
        achievements: userData.achievements,
        level: userData.level
      }
      
    case PRIVACY_LEVELS.PUBLIC:
      // Non-team members see minimal data
      return {
        name: userData.name,
        // Only lifetime achievements
        lifetimePoints: userData.lifetimePoints,
        totalSales: userData.totalSales,
        memberSince: userData.createdAt,
        achievements: userData.achievements,
        level: userData.level
      }
      
    default:
      return null
  }
}

// Calculate progress percentage
export function calculateProgress(current, goal) {
  if (!goal || goal === 0) return 0
  const progress = Math.round((current / goal) * 100)
  return Math.min(progress, 100) // Cap at 100%
}

// Format progress for display
export function formatProgress(userData, type = 'week') {
  const current = userData[`${type}Points`] || 0
  const goal = userData[`${type}lyGoal`] || 100
  const percentage = calculateProgress(current, goal)
  
  return {
    percentage,
    current,  // Only shown to self
    goal,     // Only shown to self
    display: `${percentage}%`
  }
}

// Filter sales data for activity feed
export function filterSaleActivity(saleData, privacyLevel) {
  if (privacyLevel === PRIVACY_LEVELS.SELF) {
    // User sees all details about their own sales
    return saleData
  }
  
  // Others see only that a bell was rung
  return {
    userId: saleData.userId,
    userName: saleData.userName,
    timestamp: saleData.timestamp,
    type: 'bell_rung',
    // Remove specific numbers
    points: undefined,
    customerName: undefined,
    policyType: undefined
  }
}

// Filter team statistics for display
export function filterTeamStats(teamStats, viewerRole) {
  if (viewerRole === 'leader' || viewerRole === 'co-leader') {
    // Leaders see aggregate totals
    return {
      ...teamStats,
      totalWeekPoints: teamStats.totalWeekPoints,
      totalWeekSales: teamStats.totalWeekSales,
      totalMonthPoints: teamStats.totalMonthPoints,
      totalMonthSales: teamStats.totalMonthSales,
      averageProgress: teamStats.averageProgress,
      membersAtGoal: teamStats.membersAtGoal,
      memberCount: teamStats.memberCount
    }
  }
  
  // Regular members see only percentages
  return {
    averageProgress: teamStats.averageProgress,
    membersAtGoalPercentage: Math.round((teamStats.membersAtGoal / teamStats.memberCount) * 100),
    activeToday: teamStats.activeToday,
    memberCount: teamStats.memberCount
  }
}

// Privacy settings defaults
export const DEFAULT_PRIVACY_SETTINGS = {
  showLifetimeStats: true,
  showAchievements: true,
  showStreak: true
}

// Check if a specific stat should be shown
export function shouldShowStat(userData, statName, viewerId) {
  // Always show to self
  if (userData.id === viewerId) return true
  
  const privacySettings = userData.privacySettings || DEFAULT_PRIVACY_SETTINGS
  
  switch (statName) {
    case 'lifetimeStats':
      return privacySettings.showLifetimeStats
    case 'achievements':
      return privacySettings.showAchievements
    case 'streak':
      return privacySettings.showStreak
    default:
      return false
  }
}

// Format member display for team roster
export function formatMemberForRoster(member, viewerId, viewerRole) {
  const privacyLevel = getPrivacyLevel(
    viewerId,
    member.id,
    viewerRole,
    member.teamId,
    member.teamId
  )
  
  const filtered = filterUserData(member, privacyLevel)
  
  // Add progress bars without numbers
  return {
    ...filtered,
    weeklyProgressBar: {
      percentage: filtered.weeklyProgress || 0,
      color: getProgressColor(filtered.weeklyProgress)
    },
    monthlyProgressBar: {
      percentage: filtered.monthlyProgress || 0,
      color: getProgressColor(filtered.monthlyProgress)
    }
  }
}

// Get color for progress bar
function getProgressColor(percentage) {
  if (percentage >= 100) return 'green'
  if (percentage >= 75) return 'yellow'
  if (percentage >= 50) return 'orange'
  return 'gray'
}

// Format activity feed item
export function formatActivityItem(activity, viewerId) {
  const isOwn = activity.userId === viewerId
  
  if (activity.type === 'sale' || activity.type === 'bell_rung') {
    if (isOwn) {
      // Show full details to owner
      return {
        ...activity,
        message: `You rang the bell! +${activity.points} points`,
        showDetails: true
      }
    } else {
      // Hide details from others
      return {
        ...activity,
        message: `${activity.userName} rang the bell! 🔔`,
        showDetails: false,
        points: undefined,
        policyType: undefined
      }
    }
  }
  
  if (activity.type === 'goal_achieved') {
    if (isOwn) {
      return {
        ...activity,
        message: `You achieved your ${activity.goalType} goal!`,
        showDetails: true
      }
    } else {
      return {
        ...activity,
        message: `${activity.userName} achieved their ${activity.goalType} goal! 🎯`,
        showDetails: false
      }
    }
  }
  
  return activity
}