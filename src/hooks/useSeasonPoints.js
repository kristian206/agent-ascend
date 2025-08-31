/**
 * Hook for awarding season points based on user activities
 */

import { useAuth } from '@/src/components/auth/AuthProvider'
import seasonService from '@/src/services/seasonService'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

export function useSeasonPoints() {
  const { user } = useAuth()

  // Award points for daily login
  const awardLoginPoints = async () => {
    if (!user?.uid) return null
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const loginKey = `login_${user.uid}_${today}`
      
      // Check if already awarded today
      const loginDoc = await getDoc(doc(db, 'dailyActivities', loginKey))
      if (!loginDoc.exists()) {
        // Award login points
        const result = await seasonService.awardPoints(user.uid, 'login')
        
        // Mark as awarded
        await setDoc(doc(db, 'dailyActivities', loginKey), {
          userId: user.uid,
          date: today,
          type: 'login',
          pointsAwarded: result.pointsAwarded,
          timestamp: serverTimestamp()
        })
        
        return result
      }
    } catch (error) {
      console.error('Error awarding login points:', error)
    }
    
    return null
  }

  // Award points for daily intentions
  const awardIntentionsPoints = async () => {
    if (!user?.uid) return null
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const checkinRef = doc(db, 'checkins', `${user.uid}_${today}`)
      
      // Update checkin and award points
      await updateDoc(checkinRef, {
        intentions_completed: true,
        intentions_timestamp: serverTimestamp()
      })
      
      const result = await seasonService.awardPoints(user.uid, 'dailyIntentions')
      
      return result
    } catch (error) {
      console.error('Error awarding intentions points:', error)
    }
    
    return null
  }

  // Award points for nightly wrap
  const awardWrapPoints = async () => {
    if (!user?.uid) return null
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const checkinRef = doc(db, 'checkins', `${user.uid}_${today}`)
      
      // Update checkin and award points
      await updateDoc(checkinRef, {
        wrap_completed: true,
        wrap_timestamp: serverTimestamp()
      })
      
      const result = await seasonService.awardPoints(user.uid, 'nightlyWrap')
      
      return result
    } catch (error) {
      console.error('Error awarding wrap points:', error)
    }
    
    return null
  }

  // Award points for policy sale
  const awardPolicyPoints = async (policyType) => {
    if (!user?.uid) return null
    
    try {
      const result = await seasonService.awardPoints(
        user.uid, 
        'policy',
        null,
        { type: policyType }
      )
      
      return result
    } catch (error) {
      console.error('Error awarding policy points:', error)
    }
    
    return null
  }

  // Award points for cheers
  const awardCheerPoints = async (type = 'sent') => {
    if (!user?.uid) return null
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const cheerKey = `cheers_${user.uid}_${today}`
      
      // Get today's cheer count
      const cheerDoc = await getDoc(doc(db, 'dailyActivities', cheerKey))
      const currentCount = cheerDoc.exists() ? 
        (type === 'sent' ? cheerDoc.data().sentCount : cheerDoc.data().receivedCount) || 0 : 0
      
      // Check if within daily limit
      if (currentCount >= 5) {
        return { pointsAwarded: 0, message: 'Daily cheer limit reached' }
      }
      
      // Award points
      const result = await seasonService.awardPoints(
        user.uid,
        type === 'sent' ? 'cheerSent' : 'cheerReceived',
        null,
        { [type === 'sent' ? 'sentToday' : 'receivedToday']: currentCount }
      )
      
      // Update daily counter
      if (cheerDoc.exists()) {
        await updateDoc(doc(db, 'dailyActivities', cheerKey), {
          [type === 'sent' ? 'sentCount' : 'receivedCount']: currentCount + 1,
          updatedAt: serverTimestamp()
        })
      } else {
        await setDoc(doc(db, 'dailyActivities', cheerKey), {
          userId: user.uid,
          date: today,
          type: 'cheers',
          sentCount: type === 'sent' ? 1 : 0,
          receivedCount: type === 'received' ? 1 : 0,
          createdAt: serverTimestamp()
        })
      }
      
      return result
    } catch (error) {
      console.error('Error awarding cheer points:', error)
    }
    
    return null
  }

  // Apply goal bonus
  const applyGoalBonus = async (bonusType) => {
    if (!user?.uid) return null
    
    try {
      const bonusPoints = await seasonService.applyGoalBonus(user.uid, bonusType)
      return { bonusPoints, type: bonusType }
    } catch (error) {
      console.error('Error applying goal bonus:', error)
    }
    
    return null
  }

  return {
    awardLoginPoints,
    awardIntentionsPoints,
    awardWrapPoints,
    awardPolicyPoints,
    awardCheerPoints,
    applyGoalBonus
  }
}

export default useSeasonPoints