'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, getDocs } from 'firebase/firestore'
import { auth, db } from '@/src/services/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { generateUniqueId } from '@/src/utils/idGenerator'
import { getUserData, createUser, updateUserData } from '@/src/utils/userUtils'
import LoadingScreen from '@/src/components/layout/LoadingScreen'
import SessionManager from '@/src/components/auth/SessionManager'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user)
          
          // Get or create user document
          // NOTE: 'members' collection stores USER accounts (historical naming)
          const userRef = doc(db, 'members', user.uid)
          const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists()) {
          // Get all existing user IDs to ensure uniqueness
          const usersQuery = query(collection(db, 'members'))
          const usersSnapshot = await getDocs(usersQuery)
          const existingIds = []
          usersSnapshot.forEach(doc => {
            if (doc.data().userId) {
              existingIds.push(doc.data().userId)
            }
          })
          
          // Create new user with unique 6-digit ID
          const newUserData = {
            userId: generateUniqueId(existingIds),
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            role: user.email === 'kristian.suson@gmail.com' ? 'god' : 'member',
            xp: 0,
            level: 1,
            streak: 0,
            lifetimePoints: 0,
            seasonPoints: 0,
            achievements: [],
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          }
          await setDoc(userRef, newUserData)
          setUserData(newUserData)
        } else {
          // Update last login
          await updateDoc(userRef, {
            lastLogin: serverTimestamp()
          })
          setUserData(userDoc.data())
        }
        
        // Calculate today's points after user data is loaded
        const { calculateTodayPoints, checkAndResetIfNewDay } = await import('@/src/utils/gamification')
        
        // Check if we need to reset points for a new day
        await checkAndResetIfNewDay(user.uid)
        
        // Calculate and update today's points
        const pointsResult = await calculateTodayPoints(user.uid)
        if (pointsResult.success) {
        }
        
        // Check profile completion for onboarding
        const userDocData = userDoc.exists() ? userDoc.data() : newUserData
        const profileComplete = userDocData?.profileComplete || false
        
        // Redirect logic
        if (pathname === '/') {
          // From login page
          if (!profileComplete && userDocData?.role !== 'super_admin') {
            router.push('/onboarding')
          } else {
            router.push('/dashboard')
          }
        } else if (!profileComplete && pathname !== '/onboarding' && userDocData?.role !== 'super_admin') {
          // Force onboarding for incomplete profiles (except admins)
          router.push('/onboarding')
        }
        } else {
          setUser(null)
          setUserData(null)
          // Redirect to login if not authenticated
          if (pathname !== '/') {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
        console.error('Error details:', {
          errorCode: error.code,
          errorMessage: error.message,
          userId: user?.uid,
          pathname
        })
        
        // Handle specific error types
        if (error.code === 'permission-denied') {
          console.error('🔒 FIRESTORE PERMISSION DENIED')
          console.error('Rules need to be deployed to Firebase')
          console.error('Quick fix: Go to Firebase Console > Firestore > Rules')
          console.error('Or run: firebase deploy --only firestore:rules')
          
          // Keep user logged in but with limited data
          if (user) {
            setUser(user)
            setUserData({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              photoURL: user.photoURL || null,
              createdAt: new Date().toISOString(),
              role: 'member',
              streak: 0,
              xp: 0,
              level: 1,
              permissionError: true // Flag to show warning in UI
            })
            
            // Show alert to user
            if (typeof window !== 'undefined') {
              console.warn('Firestore permissions need to be configured. Check console for details.')
            }
          } else {
            setUser(null)
            setUserData(null)
          }
        } else if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
          // Wait 2 seconds then retry once
          setTimeout(() => {
            if (user) {
              // Simple retry - just try to get the document again
              const retryUserRef = doc(db, 'members', user.uid)
              getDoc(retryUserRef).then(doc => {
                if (doc.exists()) {
                  setUserData(doc.data())
                  setUser(user)
                }
              }).catch(retryError => {
                console.error('Retry failed:', retryError)
                setUser(null)
                setUserData(null)
              })
            }
          }, 2000)
        } else {
          // Don't crash the app, just log the error
          setUser(null)
          setUserData(null)
        }
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {loading ? <LoadingScreen /> : (
        <SessionManager>
          {children}
        </SessionManager>
      )}
    </AuthContext.Provider>
  )
}