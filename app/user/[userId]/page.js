'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/src/components/auth/AuthProvider'
import PageLayout from '@/src/components/layout/PageLayout'
import UserBanner from '@/src/components/common/UserBanner'
import { db } from '@/src/services/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Edit, Trophy, TrendingUp, Target, Users, Calendar, Award, Settings } from 'lucide-react'

export default function UserProfile() {
  const params = useParams()
  const { user, userData: currentUserData } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedData, setEditedData] = useState({})

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!params.userId) return

      try {
        const userDoc = await getDoc(doc(db, 'users', params.userId))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setProfileData(data)
          setEditedData({
            name: data.name || '',
            title: data.title || '',
            bio: data.bio || '',
            phone: data.phone || '',
            location: data.location || ''
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [params.userId])

  // Check if viewing own profile
  useEffect(() => {
    if (user && params.userId) {
      setIsOwnProfile(user.uid === params.userId)
    }
  }, [user, params.userId])

  const handleSaveProfile = async () => {
    if (!isOwnProfile || !params.userId) return

    try {
      await updateDoc(doc(db, 'users', params.userId), editedData)
      setProfileData({ ...profileData, ...editedData })
      setEditMode(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile changes')
    }
  }

  const handleLeaveTeam = async () => {
    if (!isOwnProfile || !params.userId || !profileData?.teamId) return

    const confirmLeave = window.confirm('Are you sure you want to leave your team? This action cannot be undone.')
    if (!confirmLeave) return

    try {
      // Update user document to remove team
      await updateDoc(doc(db, 'users', params.userId), {
        teamId: null,
        teamName: null,
        role: 'member'
      })

      // Update the team's member count
      const teamRef = doc(db, 'teams', profileData.teamId)
      const teamDoc = await getDoc(teamRef)
      if (teamDoc.exists()) {
        const teamData = teamDoc.data()
        await updateDoc(teamRef, {
          memberCount: Math.max(0, (teamData.memberCount || 1) - 1)
        })
      }

      // Update local state
      setProfileData({
        ...profileData,
        teamId: null,
        teamName: null,
        role: 'member'
      })

      alert('You have successfully left the team.')
    } catch (error) {
      console.error('Error leaving team:', error)
      alert('Failed to leave team. Please try again.')
    }
  }

  if (loading) {
    return (
      <PageLayout user={currentUserData}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    )
  }

  if (!profileData) {
    return (
      <PageLayout user={currentUserData}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
            <p className="text-gray-400">This user profile could not be found.</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout user={currentUserData}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* User Banner */}
        <div className="mb-8">
          <UserBanner 
            userData={profileData} 
            viewerData={currentUserData}
            context="profile"
            size="large"
            onAction={isOwnProfile ? () => setEditMode(true) : null}
          />
        </div>

        {/* Action Buttons for Own Profile */}
        {isOwnProfile && !editMode && (
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
            {profileData?.teamId && (
              <button
                onClick={handleLeaveTeam}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                Leave Team
              </button>
            )}
          </div>
        )}

        {/* Edit Mode Form */}
        {editMode && isOwnProfile && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Name</label>
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Title</label>
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Phone</label>
                <input
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Location</label>
                <input
                  type="text"
                  value={editedData.location}
                  onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-300 block mb-1">Bio</label>
                <textarea
                  value={editedData.bio}
                  onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Profile Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-900/50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Level</span>
            </div>
            <div className="text-3xl font-bold text-white">{profileData.level || 1}</div>
            <div className="text-xs text-gray-400 mt-1">
              {profileData.xp || 0} XP earned
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-900/50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Points</span>
            </div>
            <div className="text-3xl font-bold text-white">{profileData.totalPoints || 0}</div>
            <div className="text-xs text-gray-400 mt-1">
              Total earned
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-900/50 flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Streak</span>
            </div>
            <div className="text-3xl font-bold text-white">{profileData.streak || 0} days</div>
            <div className="text-xs text-gray-400 mt-1">
              Current streak
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-900/50 flex items-center justify-center">
                <Award className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Rank</span>
            </div>
            <div className="text-3xl font-bold text-white">#{profileData.rank || 'N/A'}</div>
            <div className="text-xs text-gray-400 mt-1">
              Leaderboard position
            </div>
          </div>
        </div>

        {/* Achievement Showcase */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profileData.achievements?.slice(0, 8).map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl">{achievement.icon}</span>
                </div>
                <p className="text-xs text-gray-300">{achievement.name}</p>
              </div>
            )) || (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">No achievements yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed - Only show for own profile */}
        {isOwnProfile && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {profileData.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-700 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{activity.icon || '📝'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                  </div>
                  {activity.points && (
                    <span className="text-sm font-medium text-green-400">+{activity.points} pts</span>
                  )}
                </div>
              )) || (
                <p className="text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        )}

        {/* Team Information - Show for all profiles */}
        {profileData.teamId && (
          <div className="bg-gray-800 rounded-xl p-6 mt-8 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Team Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-900/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">{profileData.teamName || 'Team Member'}</p>
                <p className="text-gray-400">{profileData.role || 'Agent'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}