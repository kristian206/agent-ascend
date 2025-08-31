/**
 * Team Goal Service
 * Handles all team goal operations with privacy controls
 */

import { 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { GoalCalculations, PrivacyFilters } from '@/src/models/teamGoals'

class TeamGoalService {
  // Create a new team goal
  async createTeamGoal(goalData, userId, teamId) {
    try {
      // Verify user is a team leader
      const teamDoc = await getDoc(doc(db, 'teams', teamId))
      if (!teamDoc.exists()) throw new Error('Team not found')
      
      const teamData = teamDoc.data()
      if (teamData.leaderId !== userId && !teamData.coLeaders?.includes(userId)) {
        throw new Error('Only team leaders can create team goals')
      }
      
      // Get team members
      const membersQuery = query(
        collection(db, 'users'),
        where('teamId', '==', teamId)
      )
      const membersSnapshot = await getDocs(membersQuery)
      const members = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Set default included members (all except excluded)
      const includedMembers = goalData.includedMembers || 
        members.filter(m => !goalData.excludedMembers?.includes(m.id)).map(m => m.id)
      
      // Calculate minimums if equal distribution
      let minimumPerMember = 0
      if (goalData.distributionType === 'equal') {
        const participantCount = includedMembers.length + (goalData.leaderParticipates ? 1 : 0)
        minimumPerMember = GoalCalculations.calculateEqualMinimum(
          goalData.targetValue,
          participantCount
        )
      }
      
      // Create the team goal
      const goalRef = doc(collection(db, 'teamGoals'))
      const newGoal = {
        ...goalData,
        id: goalRef.id,
        teamId,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        includedMembers,
        minimumPerMember,
        currentValue: 0,
        status: goalData.status || 'active'
      }
      
      await setDoc(goalRef, newGoal)
      
      // Create individual member goals
      const batch = writeBatch(db)
      
      for (const memberId of includedMembers) {
        const memberGoalRef = doc(collection(db, 'memberGoals'))
        const memberGoal = {
          id: memberGoalRef.id,
          teamGoalId: goalRef.id,
          memberId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          minimumTarget: minimumPerMember,
          personalTarget: minimumPerMember, // Default to minimum
          currentValue: 0,
          status: 'active',
          isIncluded: true,
          progressPercentage: 0,
          contributionPercentage: 0
        }
        batch.set(memberGoalRef, memberGoal)
      }
      
      // Add leader's goal if participating
      if (goalData.leaderParticipates) {
        const leaderGoalRef = doc(collection(db, 'memberGoals'))
        const leaderGoal = {
          id: leaderGoalRef.id,
          teamGoalId: goalRef.id,
          memberId: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          minimumTarget: minimumPerMember,
          personalTarget: minimumPerMember,
          currentValue: 0,
          status: 'active',
          isIncluded: true,
          progressPercentage: 0,
          contributionPercentage: 0
        }
        batch.set(leaderGoalRef, leaderGoal)
      }
      
      await batch.commit()
      
      return goalRef.id
    } catch (error) {
      console.error('Error creating team goal:', error)
      throw error
    }
  }
  
  // Update team goal (with recalculation)
  async updateTeamGoal(goalId, updates, userId) {
    try {
      const goalDoc = await getDoc(doc(db, 'teamGoals', goalId))
      if (!goalDoc.exists()) throw new Error('Goal not found')
      
      const goalData = goalDoc.data()
      
      // Verify user has permission
      const teamDoc = await getDoc(doc(db, 'teams', goalData.teamId))
      const teamData = teamDoc.data()
      if (!PrivacyFilters.canViewFullDetails(userId, goalData, teamData)) {
        throw new Error('Insufficient permissions')
      }
      
      // Handle member inclusion changes
      if (updates.includedMembers || updates.excludedMembers) {
        await this.updateMemberInclusion(
          goalId,
          updates.includedMembers || goalData.includedMembers,
          updates.excludedMembers || [],
          updates.leaderParticipates ?? goalData.leaderParticipates,
          updates.targetValue || goalData.targetValue
        )
      }
      
      // Update the goal
      await updateDoc(doc(db, 'teamGoals', goalId), {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
    } catch (error) {
      console.error('Error updating team goal:', error)
      throw error
    }
  }
  
  // Update member inclusion and recalculate minimums
  async updateMemberInclusion(goalId, includedMembers, excludedMembers, leaderParticipates, targetValue) {
    try {
      const batch = writeBatch(db)
      
      // Calculate new minimums
      const participantCount = includedMembers.length + (leaderParticipates ? 1 : 0)
      const newMinimum = GoalCalculations.calculateEqualMinimum(targetValue, participantCount)
      
      // Get existing member goals
      const memberGoalsQuery = query(
        collection(db, 'memberGoals'),
        where('teamGoalId', '==', goalId)
      )
      const memberGoalsSnapshot = await getDocs(memberGoalsQuery)
      
      // Update existing member goals
      memberGoalsSnapshot.docs.forEach(doc => {
        const memberGoal = doc.data()
        const isNowIncluded = includedMembers.includes(memberGoal.memberId)
        
        if (isNowIncluded) {
          // Update minimum and ensure personal target meets it
          batch.update(doc.ref, {
            minimumTarget: newMinimum,
            personalTarget: Math.max(memberGoal.personalTarget, newMinimum),
            isIncluded: true,
            status: 'active',
            updatedAt: serverTimestamp()
          })
        } else {
          // Mark as excluded
          batch.update(doc.ref, {
            isIncluded: false,
            status: 'excluded',
            updatedAt: serverTimestamp()
          })
        }
      })
      
      // Add new member goals for newly included members
      const existingMemberIds = memberGoalsSnapshot.docs.map(d => d.data().memberId)
      for (const memberId of includedMembers) {
        if (!existingMemberIds.includes(memberId)) {
          const memberGoalRef = doc(collection(db, 'memberGoals'))
          batch.set(memberGoalRef, {
            id: memberGoalRef.id,
            teamGoalId: goalId,
            memberId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            minimumTarget: newMinimum,
            personalTarget: newMinimum,
            currentValue: 0,
            status: 'active',
            isIncluded: true,
            progressPercentage: 0,
            contributionPercentage: 0
          })
        }
      }
      
      // Update team goal with new minimum
      batch.update(doc(db, 'teamGoals', goalId), {
        includedMembers,
        excludedMembers,
        leaderParticipates,
        minimumPerMember: newMinimum,
        updatedAt: serverTimestamp()
      })
      
      await batch.commit()
    } catch (error) {
      console.error('Error updating member inclusion:', error)
      throw error
    }
  }
  
  // Get team goals with privacy filtering
  async getTeamGoals(teamId, userId) {
    try {
      // Get team data to check role
      const teamDoc = await getDoc(doc(db, 'teams', teamId))
      if (!teamDoc.exists()) throw new Error('Team not found')
      const teamData = teamDoc.data()
      
      // Get team goals
      const goalsQuery = query(
        collection(db, 'teamGoals'),
        where('teamId', '==', teamId),
        where('status', 'in', ['active', 'paused']),
        orderBy('createdAt', 'desc')
      )
      const goalsSnapshot = await getDocs(goalsQuery)
      
      // Filter based on user role
      const goals = goalsSnapshot.docs.map(doc => {
        const goalData = { id: doc.id, ...doc.data() }
        
        // Apply privacy filters if not a leader
        if (!PrivacyFilters.canViewFullDetails(userId, goalData, teamData)) {
          return PrivacyFilters.filterForMember(goalData, userId)
        }
        
        return goalData
      })
      
      return goals
    } catch (error) {
      console.error('Error getting team goals:', error)
      throw error
    }
  }
  
  // Get member's personal goals
  async getMemberGoals(memberId) {
    try {
      const memberGoalsQuery = query(
        collection(db, 'memberGoals'),
        where('memberId', '==', memberId),
        where('status', '==', 'active')
      )
      const snapshot = await getDocs(memberGoalsQuery)
      
      const memberGoals = []
      for (const doc of snapshot.docs) {
        const memberGoal = { id: doc.id, ...doc.data() }
        
        // Get team goal details
        const teamGoalDoc = await getDoc(doc(db, 'teamGoals', memberGoal.teamGoalId))
        if (teamGoalDoc.exists()) {
          const teamGoal = teamGoalDoc.data()
          
          // Add filtered team goal info
          memberGoal.teamGoal = {
            title: teamGoal.title,
            type: teamGoal.type,
            endDate: teamGoal.endDate,
            progressPercentage: GoalCalculations.calculateTeamProgress(
              teamGoal.currentValue,
              teamGoal.targetValue
            )
          }
        }
        
        memberGoals.push(memberGoal)
      }
      
      return memberGoals
    } catch (error) {
      console.error('Error getting member goals:', error)
      throw error
    }
  }
  
  // Update member's personal target
  async updatePersonalTarget(memberGoalId, newTarget, memberId) {
    try {
      const memberGoalDoc = await getDoc(doc(db, 'memberGoals', memberGoalId))
      if (!memberGoalDoc.exists()) throw new Error('Member goal not found')
      
      const memberGoal = memberGoalDoc.data()
      
      // Verify this is the member's goal
      if (memberGoal.memberId !== memberId) {
        throw new Error('Cannot update another member\'s goal')
      }
      
      // Ensure new target meets minimum
      if (newTarget < memberGoal.minimumTarget) {
        throw new Error(`Personal target must be at least ${memberGoal.minimumTarget}`)
      }
      
      // Update the personal target
      await updateDoc(doc(db, 'memberGoals', memberGoalId), {
        personalTarget: newTarget,
        updatedAt: serverTimestamp()
      })
      
      return true
    } catch (error) {
      console.error('Error updating personal target:', error)
      throw error
    }
  }
  
  // Record progress
  async recordProgress(memberId, goalId, value, date = new Date()) {
    try {
      // Get member goal
      const memberGoalsQuery = query(
        collection(db, 'memberGoals'),
        where('memberId', '==', memberId),
        where('teamGoalId', '==', goalId)
      )
      const memberGoalSnapshot = await getDocs(memberGoalsQuery)
      
      if (memberGoalSnapshot.empty) {
        throw new Error('Member is not part of this goal')
      }
      
      const memberGoalDoc = memberGoalSnapshot.docs[0]
      const memberGoal = memberGoalDoc.data()
      
      // Create progress record
      const progressRef = doc(collection(db, 'goalProgress'))
      await setDoc(progressRef, {
        id: progressRef.id,
        teamGoalId: goalId,
        memberId,
        date: date.toISOString().split('T')[0],
        dailyValue: value,
        cumulativeValue: memberGoal.currentValue + value,
        percentageComplete: GoalCalculations.calculateTeamProgress(
          memberGoal.currentValue + value,
          memberGoal.personalTarget
        ),
        source: 'manual',
        createdAt: serverTimestamp()
      })
      
      // Update member goal current value
      await updateDoc(memberGoalDoc.ref, {
        currentValue: memberGoal.currentValue + value,
        progressPercentage: GoalCalculations.calculateTeamProgress(
          memberGoal.currentValue + value,
          memberGoal.personalTarget
        ),
        updatedAt: serverTimestamp()
      })
      
      // Update team goal current value
      const teamGoalDoc = await getDoc(doc(db, 'teamGoals', goalId))
      const teamGoal = teamGoalDoc.data()
      
      await updateDoc(doc(db, 'teamGoals', goalId), {
        currentValue: teamGoal.currentValue + value,
        updatedAt: serverTimestamp()
      })
      
      // Check if goal is completed
      if (memberGoal.currentValue + value >= memberGoal.personalTarget) {
        await updateDoc(memberGoalDoc.ref, {
          status: 'completed',
          completedAt: serverTimestamp()
        })
      }
      
      return true
    } catch (error) {
      console.error('Error recording progress:', error)
      throw error
    }
  }
  
  // Get goal progress for dashboard
  async getGoalProgress(goalId, userId, role = 'member') {
    try {
      const teamGoalDoc = await getDoc(doc(db, 'teamGoals', goalId))
      if (!teamGoalDoc.exists()) throw new Error('Goal not found')
      
      const teamGoal = teamGoalDoc.data()
      
      // Get member goals
      const memberGoalsQuery = query(
        collection(db, 'memberGoals'),
        where('teamGoalId', '==', goalId),
        where('isIncluded', '==', true)
      )
      const memberGoalsSnapshot = await getDocs(memberGoalsQuery)
      
      const memberProgress = []
      for (const doc of memberGoalsSnapshot.docs) {
        const memberGoal = doc.data()
        
        // Get member info
        const userDoc = await getDoc(doc(db, 'users', memberGoal.memberId))
        const userData = userDoc.data()
        
        if (role === 'leader') {
          // Leaders see full details
          memberProgress.push({
            memberId: memberGoal.memberId,
            memberName: userData?.name || 'Unknown',
            minimumTarget: memberGoal.minimumTarget,
            personalTarget: memberGoal.personalTarget,
            currentValue: memberGoal.currentValue,
            progressPercentage: memberGoal.progressPercentage,
            status: memberGoal.status
          })
        } else {
          // Members see only percentages
          memberProgress.push({
            memberId: memberGoal.memberId,
            memberName: userData?.name || 'Unknown',
            progressPercentage: memberGoal.progressPercentage,
            status: memberGoal.status
          })
        }
      }
      
      // Prepare response based on role
      if (role === 'leader') {
        return {
          teamGoal: teamGoal,
          memberProgress: memberProgress,
          teamProgress: {
            currentValue: teamGoal.currentValue,
            targetValue: teamGoal.targetValue,
            percentage: GoalCalculations.calculateTeamProgress(
              teamGoal.currentValue,
              teamGoal.targetValue
            )
          }
        }
      } else {
        return {
          teamGoal: {
            title: teamGoal.title,
            type: teamGoal.type,
            startDate: teamGoal.startDate,
            endDate: teamGoal.endDate
          },
          memberProgress: memberProgress,
          teamProgress: {
            percentage: GoalCalculations.calculateTeamProgress(
              teamGoal.currentValue,
              teamGoal.targetValue
            )
          }
        }
      }
    } catch (error) {
      console.error('Error getting goal progress:', error)
      throw error
    }
  }
}

export default new TeamGoalService()