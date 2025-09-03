import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import DashboardSkeleton from '@/src/components/skeletons/DashboardSkeleton'
import { getUserSession, getUserData, getRecentSales, getTeamData } from '@/src/utils/serverAuth'

// Server Component - No 'use client'
export default async function Dashboard() {
  let session = null
  let initialData = null
  
  try {
    // Try to get user session on server
    const cookieStore = cookies()
    session = await getUserSession(cookieStore)
  } catch (error) {
    console.log('Server auth not available, falling back to client-side auth')
  }
  
  // If no session, render client component to handle auth
  if (!session) {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient 
          initialData={null}
          userId={null}
        />
      </Suspense>
    )
  }
  
  // If we have a session, try to prefetch data
  try {
    initialData = await fetchDashboardData(session.uid)
  } catch (error) {
    console.log('Could not prefetch data, will load on client')
  }
  
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
  try {
    // Server-side data fetching with error handling
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
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message)
    // Return null to indicate data couldn't be fetched
    return null
  }
}