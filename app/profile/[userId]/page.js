'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import PageLayout from '@/src/components/layout/PageLayout'
import UserBanner from '@/src/components/banner/UserBanner'
import BannerCustomizer from '@/src/components/banner/BannerCustomizer'
import { Settings, Trophy, Target, Activity, Users } from 'lucide-react'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, userData: currentUserData } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const userId = params.userId

  const isOwnProfile = user?.uid === userId

  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'members', userId))
      if (userDoc.exists()) {
        setProfileData(userDoc.data())
      } else {
        router.push('/404')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageLayout user={currentUserData}>
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="animate-pulse">
            <div className="h-40 bg-gray-800 rounded-xl mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-800 rounded-xl"></div>
              <div className="h-64 bg-gray-800 rounded-xl"></div>
              <div className="h-64 bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!profileData) {
    return null
  }

  return (
    <PageLayout user={currentUserData}>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* User Banner */}
        <div className="mb-6">
          <UserBanner 
            userId={userId}
            userData={profileData}
            variant="full"
            showCheer={!isOwnProfile}
          />
          
          {isOwnProfile && (
            <button
              onClick={() => setShowCustomizer(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Customize Banner
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Performance Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Performance</h3>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Season Rank</span>
                <span className="text-white font-semibold">#{profileData.seasonRank || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total XP</span>
                <span className="text-white font-semibold">{profileData.xp || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Level</span>
                <span className="text-white font-semibold">{profileData.level || 1}</span>
              </div>
            </div>
          </div>

          {/* Streaks Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Streaks</h3>
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current</span>
                <span className="text-white font-semibold">{profileData.streak || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Full Streak</span>
                <span className="text-white font-semibold">{profileData.fullStreak || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best</span>
                <span className="text-white font-semibold">{profileData.bestStreak || 0} days</span>
              </div>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Points</h3>
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Today</span>
                <span className="text-white font-semibold">{profileData.todayPoints || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Season</span>
                <span className="text-white font-semibold">{profileData.seasonPoints || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lifetime</span>
                <span className="text-white font-semibold">{profileData.lifetimePoints || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
          {profileData.achievements?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profileData.achievements.map(achievement => (
                <div 
                  key={achievement}
                  className="bg-gray-700 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl mb-1">🏅</div>
                  <div className="text-sm text-gray-300">{achievement}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              No achievements earned yet
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="text-gray-400 text-center py-8">
            Activity feed coming soon...
          </div>
        </div>
      </div>

      {/* Banner Customizer Modal */}
      {showCustomizer && (
        <BannerCustomizer 
          onClose={() => setShowCustomizer(false)}
          onSave={() => {
            loadProfileData() // Reload to show updated banner
          }}
        />
      )}
    </PageLayout>
  )
}