'use client'
import { useAuth } from '@/components/AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/PageLayout'

export default function ProfilePage() {
  const { user, userData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to user-specific profile page
    if (user) {
      router.replace(`/user/${user.uid}`)
    }
  }, [user, router])

  if (!user) return null

  // Show loading state while redirecting
  return (
    <PageLayout user={userData}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    </PageLayout>
  )
}