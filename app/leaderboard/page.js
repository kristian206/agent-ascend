'use client'
import PageLayout from '@/components/PageLayout'
import EnhancedLeaderboard from '@/components/EnhancedLeaderboard'
import { useAuth } from '@/components/AuthProvider'

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
