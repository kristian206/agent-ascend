'use client'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/navigation/AppShell'
import LeadDetail from '@/components/detail/LeadDetail'

export default function LeadDetailPage() {
  const { user, userData } = useAuth()
  const params = useParams()
  const leadId = params.id

  if (!user) return null

  return (
    <AppShell user={userData}>
      <LeadDetail leadId={leadId} />
    </AppShell>
  )
}