'use client'
import PageLayout from '@/src/components/layout/PageLayout'
import EnhancedLeaderboard from '@/src/components/performance/EnhancedLeaderboard'
import { useAuth } from '@/src/components/auth/AuthProvider'

export default function LeaderboardPage() {
  const { userData } = useAuth()

  return (
    <PageLayout user={userData}>
      <div className="container mx-auto p-4 md:p-8">
        <EnhancedLeaderboard />
      </div>
    </PageLayout>
  )
}
