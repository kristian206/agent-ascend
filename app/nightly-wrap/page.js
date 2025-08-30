'use client'
import { useAuth } from '@/components/AuthProvider'
import PageLayout from '@/components/PageLayout'
import NightlyWrap from '@/components/NightlyWrap'

export default function NightlyWrapPage() {
  const { user, userData } = useAuth()

  if (!user) return null

  return (
    <PageLayout user={userData}>
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white">
            Wrap Up Your Day
          </h1>
          <p className="text-gray-400 mt-2">
            Reflect on your wins and set yourself up for tomorrow
          </p>
        </header>

        <NightlyWrap />
      </div>
    </PageLayout>
  )
}