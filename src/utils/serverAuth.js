import { cache } from 'react'
import * as admin from 'firebase-admin'

// Check if Firebase Admin can be initialized
const canInitializeFirebase = () => {
  return (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  )
}

// Initialize Firebase Admin SDK (singleton) with safety checks
let auth = null
let db = null
let isInitialized = false

if (canInitializeFirebase()) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      })
    }
    auth = admin.auth()
    db = admin.firestore()
    isInitialized = true
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error.message)
    // Continue without Firebase Admin - build will succeed
  }
} else {
  console.warn('Firebase Admin SDK not configured - server-side features disabled')
}

// Cache user session for request duration
export const getUserSession = cache(async (cookieStore) => {
  if (!isInitialized || !auth) {
    return null // Firebase not available, return null
  }
  
  try {
    const sessionCookie = cookieStore?.get('session')
    if (!sessionCookie) return null
    
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true)
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email
    }
  } catch (error) {
    console.error('Session verification failed:', error.message)
    return null
  }
})

// Server-side data fetching functions
export async function getUserData(userId) {
  if (!isInitialized || !db) {
    return null // Firebase not available
  }
  
  try {
    const userDoc = await db.collection('members').doc(userId).get()
    if (!userDoc.exists) return null
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    }
  } catch (error) {
    console.error('Error fetching user data:', error.message)
    return null
  }
}

export async function getRecentSales(userId, limit = 5) {
  if (!isInitialized || !db) {
    return [] // Firebase not available
  }
  
  try {
    const salesSnapshot = await db
      .collection('sales')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get()
    
    const sales = []
    salesSnapshot.forEach(doc => {
      sales.push({ id: doc.id, ...doc.data() })
    })
    
    return sales
  } catch (error) {
    console.error('Error fetching sales:', error.message)
    return []
  }
}

export async function getTeamData(userId) {
  if (!isInitialized || !db) {
    return null // Firebase not available
  }
  
  try {
    const userDoc = await db.collection('members').doc(userId).get()
    if (!userDoc.exists) return null
    
    const userData = userDoc.data()
    if (!userData.teamId) return null
    
    const teamDoc = await db.collection('teams').doc(userData.teamId).get()
    if (!teamDoc.exists) return null
    
    const teamData = teamDoc.data()
    
    // Get team stats
    const membersSnapshot = await db
      .collection('members')
      .where('teamId', '==', userData.teamId)
      .get()
    
    let totalPoints = 0
    membersSnapshot.forEach(doc => {
      totalPoints += doc.data().seasonPoints || 0
    })
    
    return {
      id: teamDoc.id,
      name: teamData.name,
      rank: teamData.rank || 0,
      points: totalPoints,
      memberCount: membersSnapshot.size
    }
  } catch (error) {
    console.error('Error fetching team data:', error.message)
    return null
  }
}

// Batch fetch for efficiency
export async function batchFetchUserData(userIds) {
  if (!userIds || userIds.length === 0) return []
  
  if (!isInitialized || !db) {
    return [] // Firebase not available
  }
  
  try {
    // Firebase Admin SDK supports IN queries up to 10 items
    const chunks = []
    for (let i = 0; i < userIds.length; i += 10) {
      chunks.push(userIds.slice(i, i + 10))
    }
    
    const results = await Promise.all(
      chunks.map(async chunk => {
        const snapshot = await db
          .collection('members')
          .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
          .get()
        
        const users = []
        snapshot.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() })
        })
        return users
      })
    )
    
    return results.flat()
  } catch (error) {
    console.error('Error batch fetching users:', error.message)
    return []
  }
}