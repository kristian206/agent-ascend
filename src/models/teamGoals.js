/**
 * Team Goals Database Models and Schema
 * 
 * Collections:
 * - teamGoals: Main team goal records
 * - memberGoals: Individual member goals linked to team goals
 * - goalProgress: Daily progress tracking
 */

// Team Goal Model
export const TeamGoalSchema = {
  id: '', // Auto-generated
  teamId: '', // Reference to team
  createdBy: '', // Leader who created the goal
  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
  
  // Goal Details
  title: '', // Goal name (e.g., "Q4 Sales Target")
  description: '', // Detailed description
  type: '', // 'sales', 'policies', 'calls', 'meetings', 'custom'
  targetValue: 0, // Total target (e.g., 100 sales)
  currentValue: 0, // Current progress
  startDate: null, // Goal start date
  endDate: null, // Goal deadline
  status: 'active', // 'draft', 'active', 'paused', 'completed', 'failed'
  
  // Member Participation
  includedMembers: [], // Array of member IDs participating
  excludedMembers: [], // Array of member IDs excluded
  leaderParticipates: false, // Whether the leader counts toward the goal
  
  // Distribution Settings
  distributionType: 'equal', // 'equal', 'weighted', 'custom'
  customDistribution: {}, // { memberId: targetValue } for custom distribution
  minimumPerMember: 0, // Calculated minimum for equal distribution
  
  // Privacy Settings
  visibility: 'percentage', // 'percentage', 'numbers', 'hidden'
  showIndividualProgress: true, // Show individual member progress
  allowMemberGoalSetting: true, // Allow members to set personal targets
  
  // Notifications
  notifyOnMilestones: true, // Send notifications at 25%, 50%, 75%, 100%
  reminderFrequency: 'weekly', // 'daily', 'weekly', 'none'
  
  // Rewards (optional)
  rewardType: null, // 'points', 'badge', 'bonus', 'custom'
  rewardValue: null, // Points or description
  rewardCriteria: 'team', // 'team', 'individual', 'both'
}

// Member Goal Model (Individual targets within team goals)
export const MemberGoalSchema = {
  id: '', // Auto-generated
  teamGoalId: '', // Reference to team goal
  memberId: '', // Reference to member
  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
  
  // Targets
  minimumTarget: 0, // Calculated minimum from team goal
  personalTarget: 0, // Member's self-set target (>= minimum)
  currentValue: 0, // Current progress
  
  // Status
  status: 'active', // 'active', 'completed', 'failed', 'excluded'
  isIncluded: true, // Whether member is currently included
  completedAt: null, // Timestamp when goal was met
  
  // Performance
  progressPercentage: 0, // Current progress percentage
  contributionPercentage: 0, // Contribution to team goal
  performanceRating: null, // 'exceeding', 'ontrack', 'behind', 'atrisk'
  
  // Notes
  memberNotes: '', // Member's private notes
  leaderNotes: '', // Leader's notes (visible to leaders only)
}

// Goal Progress Model (Daily tracking)
export const GoalProgressSchema = {
  id: '', // Auto-generated
  teamGoalId: '', // Reference to team goal
  memberId: '', // Reference to member
  date: null, // Date of progress
  
  // Progress Data
  dailyValue: 0, // Value achieved today
  cumulativeValue: 0, // Total value to date
  percentageComplete: 0, // Percentage of personal target
  
  // Metadata
  source: '', // 'manual', 'auto', 'import'
  verifiedBy: null, // Leader ID if verified
  notes: '', // Any notes about this progress
}

// Utility Functions for Goal Calculations
export const GoalCalculations = {
  // Calculate minimum per member for equal distribution
  calculateEqualMinimum(totalTarget, includedMembersCount) {
    if (includedMembersCount === 0) return 0
    return Math.ceil(totalTarget / includedMembersCount)
  },
  
  // Calculate weighted distribution based on member levels or performance
  calculateWeightedDistribution(totalTarget, members) {
    const totalWeight = members.reduce((sum, m) => sum + (m.weight || 1), 0)
    const distribution = {}
    
    members.forEach(member => {
      const weight = member.weight || 1
      distribution[member.id] = Math.ceil((totalTarget * weight) / totalWeight)
    })
    
    return distribution
  },
  
  // Calculate team progress percentage
  calculateTeamProgress(currentValue, targetValue) {
    if (targetValue === 0) return 0
    return Math.min(100, Math.round((currentValue / targetValue) * 100))
  },
  
  // Calculate member contribution percentage
  calculateMemberContribution(memberValue, teamTotalValue) {
    if (teamTotalValue === 0) return 0
    return Math.round((memberValue / teamTotalValue) * 100)
  },
  
  // Determine performance rating
  getPerformanceRating(progressPercentage, daysElapsed, totalDays) {
    const expectedProgress = (daysElapsed / totalDays) * 100
    const difference = progressPercentage - expectedProgress
    
    if (difference >= 10) return 'exceeding'
    if (difference >= -5) return 'ontrack'
    if (difference >= -15) return 'behind'
    return 'atrisk'
  },
  
  // Check if goal is achievable based on current pace
  isGoalAchievable(currentValue, targetValue, daysElapsed, totalDays) {
    if (daysElapsed === 0) return true
    const dailyRate = currentValue / daysElapsed
    const projectedTotal = dailyRate * totalDays
    return projectedTotal >= targetValue * 0.9 // 90% threshold
  }
}

// Privacy Filters for Different Roles
export const PrivacyFilters = {
  // Filter goal data for non-leader members
  filterForMember(goalData, memberId) {
    const filtered = { ...goalData }
    
    // Hide actual numbers if visibility is 'percentage'
    if (goalData.visibility === 'percentage') {
      delete filtered.targetValue
      delete filtered.currentValue
      delete filtered.minimumPerMember
      delete filtered.customDistribution
      
      // Add percentage instead
      filtered.progressPercentage = GoalCalculations.calculateTeamProgress(
        goalData.currentValue,
        goalData.targetValue
      )
    }
    
    // Hide other members' individual targets
    if (filtered.customDistribution) {
      filtered.customDistribution = {
        [memberId]: filtered.customDistribution[memberId]
      }
    }
    
    // Hide leader notes from member goals
    delete filtered.leaderNotes
    
    return filtered
  },
  
  // Filter member goal data for public viewing
  filterMemberGoalForPublic(memberGoalData) {
    return {
      memberId: memberGoalData.memberId,
      progressPercentage: memberGoalData.progressPercentage,
      performanceRating: memberGoalData.performanceRating,
      status: memberGoalData.status
    }
  },
  
  // Check if user can view full goal details
  canViewFullDetails(userId, goal, teamData) {
    // Team leaders can always see full details
    if (teamData.leaderId === userId) return true
    if (teamData.coLeaders?.includes(userId)) return true
    
    // Goal creator can see full details
    if (goal.createdBy === userId) return true
    
    return false
  }
}

export default {
  TeamGoalSchema,
  MemberGoalSchema,
  GoalProgressSchema,
  GoalCalculations,
  PrivacyFilters
}