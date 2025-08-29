'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'

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
      if (user) {
        setUser(user)
        
        // Get or create user document
        const userRef = doc(db, 'members', user.uid)
        const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists()) {
          // Create new user
          const newUserData = {
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
      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}