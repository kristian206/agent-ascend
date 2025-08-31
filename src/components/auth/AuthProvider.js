'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, getDocs } from 'firebase/firestore'
import { auth, db } from '@/src/services/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { generateUniqueId } from '@/src/utils/idGenerator'
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
          const userRef = doc(db, 'members', user.uid)
          const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists()) {
          // Get all existing user IDs to ensure uniqueness
          const usersQuery = query(collection(db, 'users'))
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
        // Don't crash the app, just log the error
        setUser(null)
        setUserData(null)
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