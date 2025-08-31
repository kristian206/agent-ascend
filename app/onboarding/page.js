'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/src/services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import OnboardingWizard from '@/src/components/onboarding/OnboardingWizard'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push('/')
        return
      }

      // Check if email is verified
      if (!authUser.emailVerified) {
        router.push('/?mode=verify')
        return
      }

      setUser(authUser)

      // Check if onboarding is already completed
      try {
        // Check BOTH collections since AuthProvider uses 'members'
        const userDoc = await getDoc(doc(db, 'users', authUser.uid))
        const memberDoc = await getDoc(doc(db, 'members', authUser.uid))
        
        // Use member doc if it exists (AuthProvider uses this)
        const activeDoc = memberDoc.exists() ? memberDoc : userDoc
        
        if (activeDoc.exists()) {
          const data = activeDoc.data()
          setUserData(data)
          
          // If onboarding is already completed, redirect to dashboard
          // Check both fields for compatibility
          if (data.onboardingCompleted || data.profileComplete) {
            router.push('/dashboard')
            return
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])
  
  const handleOnboardingComplete = () => {
    router.push('/dashboard')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your experience...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }
  
  return <OnboardingWizard user={user} userData={userData} onComplete={handleOnboardingComplete} />
}