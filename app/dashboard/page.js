import { Suspense } from 'react'
import { cookies } from 'next/headers'
import DashboardClient from './DashboardClient'
import DashboardSkeleton from '@/src/components/skeletons/DashboardSkeleton'
import { getUserSession } from '@/src/utils/serverAuth'

// Server Component - No 'use client'
export default async function Dashboard() {
  // Get user session on server
  const session = await getUserSession(cookies())
  
  if (!session) {
    redirect('/')
  }
  
  // Prefetch critical data on server
  const initialData = await fetchDashboardData(session.uid)
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient 
        initialData={initialData}
        userId={session.uid}
      />
    </Suspense>
  )
}

async function fetchDashboardData(userId) {
  // Server-side data fetching
  const [userData, recentSales, teamData] = await Promise.all([
    getUserData(userId),
    getRecentSales(userId, 5),
    getTeamData(userId)
  ])
  
  return {
    userData,
    recentSales,
    teamData,
    timestamp: Date.now()
  }
}