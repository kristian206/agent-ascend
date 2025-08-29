'use client'
import Navigation from './Navigation'
import AppShell from './navigation/AppShell'
import { useSearchParams } from 'next/navigation'

export default function PageLayout({ children, user }) {
  const searchParams = useSearchParams()
  
  // Check if classic UI is requested (default to new UI with AppShell)
  const useClassicUI = searchParams.get('ui') === 'v1'
  
  // For new UI, use AppShell which includes TopBar and LeftRail
  if (!useClassicUI) {
    return (
      <AppShell user={user}>
        {children}
      </AppShell>
    )
  }
  
  // For classic UI, use the old Navigation component
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navigation user={user} />
      <div className="container mx-auto p-4 md:p-8 pt-20">
        {children}
      </div>
    </div>
  )
}