'use client'
import { useAuth } from '@/src/components/auth/AuthProvider'
import PageLayout from '@/src/components/layout/PageLayout'
import DailyIntentions from '@/src/components/sales/DailyIntentions'

export default function DailyIntentionsPage() {
  const { user, userData } = useAuth()

  if (!user) return null

  return (
    <PageLayout user={userData}>
      <div>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white">
            Start Your Day Right
          </h1>
          <p className="text-gray-300 mt-2">
            Set clear intentions and watch your productivity soar
          </p>
        </header>

        <DailyIntentions />
      </div>
    </PageLayout>
  )
}