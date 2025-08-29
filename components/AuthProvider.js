'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, getDocs } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { generateUniqueId } from '@/lib/idGenerator'
import LoadingScreen from '@/components/LoadingScreen'

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
        
        // Redirect to dashboard if on login page
        if (pathname === '/') {
          router.push('/dashboard')
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
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  )
}