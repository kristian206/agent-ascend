/**
 * Season Service
 * Manages monthly competitive seasons with ranking system
 */

import { 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc,
  increment,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { 
  RANKS, 
  POINTS_CONFIG, 
  SEASON_TRANSITION,
  SeasonUtils 
} from '@/src/models/seasonModels'

class SeasonService {
  // Initialize or get current season
  async getCurrentSeason() {
    try {
      const seasonId = SeasonUtils.getCurrentSeason()
      const seasonDoc = await getDoc(doc(db, 'seasons', seasonId))
      
      if (!seasonDoc.exists()) {
        // Create new season
        return await this.createNewSeason()
      }
      
      const seasonData = seasonDoc.data()
      
      // Check if season has ended
      const now = new Date()
      if (new Date(seasonData.endDate) < now && seasonData.status === 'active') {
        // End current season and create new one
        await this.endSeason(seasonId)
        return await this.createNewSeason()
      }
      
      return { id: seasonDoc.id, ...seasonData }
    } catch (error) {
      console.error('Error getting current season:', error)
      throw error
    }
  }
  
  // Create a new season
  async createNewSeason() {
    try {
      const seasonId = SeasonUtils.getCurrentSeason()
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      
      // Get season number
      const seasonsQuery = query(
        collection(db, 'seasons'),
        orderBy('seasonNumber', 'desc'),
        limit(1)
      )
      const lastSeasonSnapshot = await getDocs(seasonsQuery)
      const seasonNumber = lastSeasonSnapshot.empty ? 1 : lastSeasonSnapshot.docs[0].data().seasonNumber + 1
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December']
      
      const newSeason = {
        id: seasonId,
        seasonNumber,
        name: `Season ${seasonNumber} - ${monthNames[month]} ${year}`,
        startDate: new Date(year, month, 1).toISOString(),
        endDate: SeasonUtils.getSeasonEndDate().toISOString(),
        status: 'active',
        totalParticipants: 0,
        activeParticipants: 0,
        createdAt: serverTimestamp()
      }
      
      await setDoc(doc(db, 'seasons', seasonId), newSeason)
      
      // Apply season transition for all users
      await this.applySeasonTransition(seasonId)
      
      return newSeason
    } catch (error) {
      console.error('Error creating new season:', error)
      throw error
    }
  }
  
  // End a season
  async endSeason(seasonId) {
    try {
      const batch = writeBatch(db)
      
      // Mark season as ended
      batch.update(doc(db, 'seasons', seasonId), {
        status: 'ended',
        processedAt: serverTimestamp()
      })
      
      // Process all user season data
      const userSeasonQuery = query(
        collection(db, 'userSeasons'),
        where('seasonId', '==', seasonId)
      )
      const userSeasonSnapshot = await getDocs(userSeasonQuery)
      
      for (const userSeasonDoc of userSeasonSnapshot.docs) {
        const userData = userSeasonDoc.data()
        
        // Convert season points to lifetime XP
        const xpGained = userData.seasonPoints * SEASON_TRANSITION.seasonToXPRatio
        
        // Update lifetime progression
        const lifetimeRef = doc(db, 'lifetimeProgression', userData.userId)
        const lifetimeDoc = await getDoc(lifetimeRef)
        
        if (lifetimeDoc.exists()) {
          const lifetimeData = lifetimeDoc.data()
          const newXP = lifetimeData.lifetimeXP + xpGained
          const newLevel = Math.floor(newXP / SEASON_TRANSITION.xpPerLevel) + 1
          
          batch.update(lifetimeRef, {
            lifetimeXP: increment(xpGained),
            level: newLevel,
            totalSeasons: increment(1),
            seasonsParticipated: [...lifetimeData.seasonsParticipated, seasonId],
            updatedAt: serverTimestamp()
          })
        } else {
          // Create new lifetime progression
          batch.set(lifetimeRef, {
            userId: userData.userId,
            lifetimeXP: xpGained,
            level: Math.floor(xpGained / SEASON_TRANSITION.xpPerLevel) + 1,
            totalSeasons: 1,
            seasonsParticipated: [seasonId],
            createdAt: serverTimestamp()
          })
        }
        
        // Store season-end rank for next season placement
        batch.update(doc(db, 'members', userData.userId), {
          lastSeasonRank: userData.currentRank,
          lastSeasonDivision: userData.currentDivision,
          lastSeasonPoints: userData.seasonPoints
        })
      }
      
      await batch.commit()
    } catch (error) {
      console.error('Error ending season:', error)
      throw error
    }
  }
  
  // Apply season transition (soft reset)
  async applySeasonTransition(newSeasonId) {
    try {
      const usersQuery = query(collection(db, 'members'))
      const usersSnapshot = await getDocs(usersQuery)
      
      const batch = writeBatch(db)
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data()
        const userId = userDoc.id
        
        // Calculate starting position based on last season rank
        let startingPoints = 0
        let placementRank = 'bronze'
        let placementDivision = 5
        
        if (userData.lastSeasonRank) {
          const lastRank = RANKS[userData.lastSeasonRank]
          if (lastRank) {
            startingPoints = lastRank.startingBonus
            
            // Apply soft reset
            const decay = SEASON_TRANSITION.rankDecay[userData.lastSeasonRank]
            if (decay) {
              // Calculate new placement
              const totalDivisions = (lastRank.tier - 1) * 5 + (5 - userData.lastSeasonDivision)
              const newTotalDivisions = Math.max(0, totalDivisions - (5 - decay.keepDivisions))
              
              const newTier = Math.floor(newTotalDivisions / 5) + 1
              const newDivision = 5 - (newTotalDivisions % 5)
              
              // Find rank for new tier
              for (const [key, rank] of Object.entries(RANKS)) {
                if (rank.tier === newTier) {
                  placementRank = key
                  placementDivision = newDivision
                  break
                }
              }
            }
          }
        }
        
        // Create user season record
        const userSeasonRef = doc(db, 'userSeasons', `${userId}_${newSeasonId}`)
        batch.set(userSeasonRef, {
          userId,
          seasonId: newSeasonId,
          currentRank: placementRank,
          currentDivision: placementDivision,
          currentSR: RANKS[placementRank].srMin + ((5 - placementDivision) * 100),
          seasonPoints: startingPoints,
          placementRank,
          peakRank: placementRank,
          dailyPoints: {},
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
      
      await batch.commit()
    } catch (error) {
      console.error('Error applying season transition:', error)
      throw error
    }
  }
  
  // Award points to user
  async awardPoints(userId, pointType, amount = null, metadata = {}) {
    try {
      const seasonId = SeasonUtils.getCurrentSeason()
      const userSeasonRef = doc(db, 'userSeasons', `${userId}_${seasonId}`)
      const userSeasonDoc = await getDoc(userSeasonRef)
      
      if (!userSeasonDoc.exists()) {
        // Create user season record if doesn't exist
        await this.createUserSeason(userId, seasonId)
      }
      
      const userData = userSeasonDoc.data() || {}
      const today = new Date().toISOString().split('T')[0]
      const dailyPoints = userData.dailyPoints || {}
      const todayPoints = dailyPoints[today] || 0
      
      let pointsToAward = 0
      let updates = {
        updatedAt: serverTimestamp(),
        lastActiveDate: serverTimestamp()
      }
      
      switch (pointType) {
        case 'login':
          pointsToAward = POINTS_CONFIG.login
          updates.loginDays = increment(1)
          break
          
        case 'dailyIntentions':
          pointsToAward = POINTS_CONFIG.dailyIntentions
          updates.intentionsCompleted = increment(1)
          break
          
        case 'nightlyWrap':
          pointsToAward = POINTS_CONFIG.nightlyWrap
          updates.wrapsCompleted = increment(1)
          break
          
        case 'policy':
          const policyType = metadata.type || 'other'
          pointsToAward = POINTS_CONFIG.policies[policyType] || POINTS_CONFIG.policies.other
          updates[`policiesSold.${policyType}`] = increment(1)
          break
          
        case 'cheerSent':
          // Check daily limit
          const sentToday = metadata.sentToday || 0
          if (sentToday < POINTS_CONFIG.maxCheersPerDay) {
            pointsToAward = POINTS_CONFIG.cheerSent
            updates.cheersSent = increment(1)
          }
          break
          
        case 'cheerReceived':
          // Check daily limit
          const receivedToday = metadata.receivedToday || 0
          if (receivedToday < POINTS_CONFIG.maxCheersPerDay) {
            pointsToAward = POINTS_CONFIG.cheerReceived
            updates.cheersReceived = increment(1)
          }
          break
          
        case 'custom':
          pointsToAward = amount || 0
          break
      }
      
      // Apply bonuses
      if (userData.individualGoalBonus) {
        pointsToAward *= (1 + POINTS_CONFIG.individualGoalBonus)
      }
      if (userData.teamGoalBonus) {
        pointsToAward *= (1 + POINTS_CONFIG.teamGoalBonus)
      }
      
      // Update points and SR
      const newTotalPoints = (userData.seasonPoints || 0) + pointsToAward
      const newSR = SeasonUtils.pointsToSR(newTotalPoints)
      const newRankInfo = SeasonUtils.getRankFromSR(newSR)
      
      updates.seasonPoints = increment(pointsToAward)
      updates.currentSR = newSR
      updates.currentRank = newRankInfo.rank
      updates.currentDivision = newRankInfo.division
      updates[`dailyPoints.${today}`] = todayPoints + pointsToAward
      
      // Update peak rank if improved
      if (newRankInfo.tier > (RANKS[userData.peakRank || 'bronze'].tier)) {
        updates.peakRank = newRankInfo.rank
      }
      
      await updateDoc(userSeasonRef, updates)
      
      // Also update lifetime XP
      await this.updateLifetimeXP(userId, pointsToAward)
      
      return {
        pointsAwarded: pointsToAward,
        newTotal: newTotalPoints,
        newRank: newRankInfo
      }
    } catch (error) {
      console.error('Error awarding points:', error)
      throw error
    }
  }
  
  // Update lifetime XP
  async updateLifetimeXP(userId, xpGained) {
    try {
      const lifetimeRef = doc(db, 'lifetimeProgression', userId)
      const lifetimeDoc = await getDoc(lifetimeRef)
      
      if (lifetimeDoc.exists()) {
        const currentXP = lifetimeDoc.data().lifetimeXP || 0
        const newXP = currentXP + xpGained
        const newLevel = Math.floor(newXP / SEASON_TRANSITION.xpPerLevel) + 1
        
        await updateDoc(lifetimeRef, {
          lifetimeXP: increment(xpGained),
          level: newLevel,
          updatedAt: serverTimestamp()
        })
      } else {
        // Create new lifetime progression
        await setDoc(lifetimeRef, {
          userId,
          lifetimeXP: xpGained,
          level: Math.floor(xpGained / SEASON_TRANSITION.xpPerLevel) + 1,
          totalSeasons: 0,
          seasonsParticipated: [],
          createdAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error updating lifetime XP:', error)
      throw error
    }
  }
  
  // Create user season record
  async createUserSeason(userId, seasonId) {
    try {
      const userDoc = await getDoc(doc(db, 'members', userId))
      const userData = userDoc.data() || {}
      
      // Determine starting position
      let startingPoints = 0
      let placementRank = 'bronze'
      let placementDivision = 5
      
      if (userData.lastSeasonRank) {
        const lastRank = RANKS[userData.lastSeasonRank]
        if (lastRank) {
          startingPoints = lastRank.startingBonus
          placementRank = userData.lastSeasonRank
          placementDivision = userData.lastSeasonDivision || 5
        }
      }
      
      await setDoc(doc(db, 'userSeasons', `${userId}_${seasonId}`), {
        userId,
        seasonId,
        currentRank: placementRank,
        currentDivision: placementDivision,
        currentSR: RANKS[placementRank].srMin,
        seasonPoints: startingPoints,
        placementRank,
        peakRank: placementRank,
        dailyPoints: {},
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating user season:', error)
      throw error
    }
  }
  
  // Get user's current season progress
  async getUserSeasonProgress(userId) {
    try {
      const seasonId = SeasonUtils.getCurrentSeason()
      const userSeasonDoc = await getDoc(doc(db, 'userSeasons', `${userId}_${seasonId}`))
      
      if (!userSeasonDoc.exists()) {
        await this.createUserSeason(userId, seasonId)
        return await this.getUserSeasonProgress(userId)
      }
      
      const userData = userSeasonDoc.data()
      const progressInfo = SeasonUtils.getProgressToNextRank(userData.currentSR, userData.currentRank)
      
      return {
        ...userData,
        progressToNext: progressInfo,
        daysRemaining: SeasonUtils.getDaysRemaining()
      }
    } catch (error) {
      console.error('Error getting user season progress:', error)
      throw error
    }
  }
  
  // Get season leaderboard
  async getSeasonLeaderboard(seasonId = null, limitCount = 100) {
    try {
      const currentSeasonId = seasonId || SeasonUtils.getCurrentSeason()
      
      const leaderboardQuery = query(
        collection(db, 'userSeasons'),
        where('seasonId', '==', currentSeasonId),
        orderBy('currentSR', 'desc'),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(leaderboardQuery)
      const leaderboard = []
      
      for (const doc of snapshot.docs) {
        const data = doc.data()
        const userDoc = await getDoc(doc(db, 'members', data.userId))
        const userData = userDoc.data() || {}
        
        leaderboard.push({
          rank: leaderboard.length + 1,
          userId: data.userId,
          name: userData.name || 'Unknown',
          avatarUrl: userData.avatarUrl,
          teamId: userData.teamId,
          currentRank: data.currentRank,
          currentDivision: data.currentDivision,
          currentSR: data.currentSR,
          seasonPoints: data.seasonPoints,
          peakRank: data.peakRank
        })
      }
      
      return leaderboard
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }
  
  // Apply goal completion bonus
  async applyGoalBonus(userId, bonusType) {
    try {
      const seasonId = SeasonUtils.getCurrentSeason()
      const userSeasonRef = doc(db, 'userSeasons', `${userId}_${seasonId}`)
      
      const updates = {}
      if (bonusType === 'individual') {
        updates.individualGoalBonus = true
      } else if (bonusType === 'team') {
        updates.teamGoalBonus = true
      }
      
      await updateDoc(userSeasonRef, updates)
      
      // Recalculate total with bonus
      const userSeasonDoc = await getDoc(userSeasonRef)
      const userData = userSeasonDoc.data()
      
      let bonusMultiplier = 1
      if (userData.individualGoalBonus) bonusMultiplier += POINTS_CONFIG.individualGoalBonus
      if (userData.teamGoalBonus) bonusMultiplier += POINTS_CONFIG.teamGoalBonus
      
      const bonusPoints = Math.floor(userData.seasonPoints * (bonusMultiplier - 1))
      
      await updateDoc(userSeasonRef, {
        bonusPointsEarned: bonusPoints,
        updatedAt: serverTimestamp()
      })
      
      return bonusPoints
    } catch (error) {
      console.error('Error applying goal bonus:', error)
      throw error
    }
  }
}

export default new SeasonService()