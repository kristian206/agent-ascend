/**
 * User Utilities
 * 
 * IMPORTANT: The 'members' collection stores USER accounts (not role-specific data)
 * This is a historical naming convention kept for backward compatibility.
 * 
 * Terminology:
 * - User: A person/account on the platform
 * - Member: One of four ROLES (member, senior, co-leader, leader)
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

/**
 * Get user data by userId
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object|null>} User data or null if not found
 */
export async function getUserData(userId) {
  if (!userId) return null
  
  try {
    // NOTE: 'members' collection stores USER accounts
    const userRef = doc(db, 'members', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return userDoc.data()
    }
    
    console.warn(`User not found: ${userId}`)
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

/**
 * Update user data
 * @param {string} userId - The user's unique identifier
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserData(userId, updates) {
  if (!userId) return false
  
  try {
    const userRef = doc(db, 'members', userId)
    await updateDoc(userRef, updates)
    return true
  } catch (error) {
    console.error('Error updating user data:', error)
    return false
  }
}

/**
 * Get user's role
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<string|null>} User's role or null
 */
export async function getUserRole(userId) {
  const userData = await getUserData(userId)
  return userData?.role || null
}

/**
 * Check if user has a specific role
 * @param {string} userId - The user's unique identifier
 * @param {string} role - Role to check ('member', 'senior', 'co-leader', 'leader')
 * @returns {Promise<boolean>}
 */
export async function userHasRole(userId, role) {
  const userRole = await getUserRole(userId)
  return userRole === role
}

/**
 * Check if user is a team leader or co-leader
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<boolean>}
 */
export async function isUserLeader(userId) {
  const userRole = await getUserRole(userId)
  return ['leader', 'co-leader'].includes(userRole)
}

/**
 * Get all users with a specific role
 * @param {string} role - Role to filter by
 * @returns {Promise<Array>} Array of users with the specified role
 */
export async function getUsersByRole(role) {
  try {
    const usersQuery = query(
      collection(db, 'members'),
      where('role', '==', role)
    )
    
    const snapshot = await getDocs(usersQuery)
    const users = []
    
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return users
  } catch (error) {
    console.error('Error fetching users by role:', error)
    return []
  }
}

/**
 * Get all users on a team
 * @param {string} teamId - The team identifier
 * @returns {Promise<Array>} Array of users on the team
 */
export async function getUsersByTeam(teamId) {
  if (!teamId) return []
  
  try {
    const usersQuery = query(
      collection(db, 'members'),
      where('teamId', '==', teamId)
    )
    
    const snapshot = await getDocs(usersQuery)
    const users = []
    
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return users
  } catch (error) {
    console.error('Error fetching team users:', error)
    return []
  }
}

/**
 * Create a new user account
 * @param {string} userId - The user's unique identifier
 * @param {Object} userData - Initial user data
 * @returns {Promise<boolean>} Success status
 */
export async function createUser(userId, userData) {
  if (!userId || !userData) return false
  
  try {
    const userRef = doc(db, 'members', userId)
    
    // Default values for new users
    const defaultData = {
      role: 'member', // Default role is 'member'
      level: 1,
      xp: 0,
      streak: 0,
      todayPoints: 0,
      seasonPoints: 0,
      lifetimePoints: 0,
      achievements: [],
      createdAt: new Date(),
      ...userData // Override with provided data
    }
    
    await setDoc(userRef, defaultData)
    return true
  } catch (error) {
    console.error('Error creating user:', error)
    return false
  }
}

// Export all functions
export default {
  getUserData,
  updateUserData,
  getUserRole,
  userHasRole,
  isUserLeader,
  getUsersByRole,
  getUsersByTeam,
  createUser
}