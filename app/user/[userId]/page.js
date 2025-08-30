'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import PageLayout from '@/components/PageLayout'
import UserBanner from '@/components/UserBanner'
import { db } from '@/lib/firebase'
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

  if (loading) {
    return (
      <PageLayout user={currentUserData}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </PageLayout>
    )
  }

  if (!profileData) {
    return (
      <PageLayout user={currentUserData}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="type-page-heading text-primary mb-2">User Not Found</h2>
            <p className="type-detail-body text-secondary">This user profile could not be found.</p>
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

        {/* Edit Profile Button for Own Profile */}
        {isOwnProfile && !editMode && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        )}

        {/* Edit Mode Form */}
        {editMode && isOwnProfile && (
          <div className="glass radius-xl p-6 mb-8">
            <h3 className="type-section-heading text-primary mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="type-list-label text-secondary block mb-1">Name</label>
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-ink-100 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="type-list-label text-secondary block mb-1">Title</label>
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-ink-100 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="type-list-label text-secondary block mb-1">Phone</label>
                <input
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-ink-100 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="type-list-label text-secondary block mb-1">Location</label>
                <input
                  type="text"
                  value={editedData.location}
                  onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-ink-100 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="type-list-label text-secondary block mb-1">Bio</label>
                <textarea
                  value={editedData.bio}
                  onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-ink-100 rounded-lg focus:ring-2 focus:ring-brand-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-ink-600 hover:text-ink-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Profile Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass radius-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-brand-600" />
              </div>
              <span className="type-list-label text-secondary">Level</span>
            </div>
            <div className="type-dashboard-metric text-primary">{profileData.level || 1}</div>
            <div className="type-detail-caption text-tertiary mt-1">
              {profileData.xp || 0} XP earned
            </div>
          </div>

          <div className="glass radius-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
              <span className="type-list-label text-secondary">Points</span>
            </div>
            <div className="type-dashboard-metric text-primary">{profileData.totalPoints || 0}</div>
            <div className="type-detail-caption text-tertiary mt-1">
              Total earned
            </div>
          </div>

          <div className="glass radius-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-warning-600" />
              </div>
              <span className="type-list-label text-secondary">Streak</span>
            </div>
            <div className="type-dashboard-metric text-primary">{profileData.streak || 0} days</div>
            <div className="type-detail-caption text-tertiary mt-1">
              Current streak
            </div>
          </div>

          <div className="glass radius-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-error-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-error-600" />
              </div>
              <span className="type-list-label text-secondary">Rank</span>
            </div>
            <div className="type-dashboard-metric text-primary">#{profileData.rank || 'N/A'}</div>
            <div className="type-detail-caption text-tertiary mt-1">
              Leaderboard position
            </div>
          </div>
        </div>

        {/* Achievement Showcase */}
        <div className="glass radius-xl p-6 mb-8">
          <h3 className="type-section-heading text-primary mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profileData.achievements?.slice(0, 8).map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="text-2xl">{achievement.icon}</span>
                </div>
                <p className="type-detail-caption text-primary">{achievement.name}</p>
              </div>
            )) || (
              <div className="col-span-full text-center py-8">
                <p className="type-detail-body text-tertiary">No achievements yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed - Only show for own profile */}
        {isOwnProfile && (
          <div className="glass radius-xl p-6">
            <h3 className="type-section-heading text-primary mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {profileData.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-ink-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{activity.icon || '📝'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="type-list-body text-primary">{activity.description}</p>
                    <p className="type-detail-caption text-tertiary mt-1">{activity.timestamp}</p>
                  </div>
                  {activity.points && (
                    <span className="type-list-label text-success">+{activity.points} pts</span>
                  )}
                </div>
              )) || (
                <p className="type-detail-body text-tertiary text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        )}

        {/* Team Information - Show for all profiles */}
        {profileData.teamId && (
          <div className="glass radius-xl p-6 mt-8">
            <h3 className="type-section-heading text-primary mb-4">Team Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="type-list-heading text-primary">{profileData.teamName || 'Team Member'}</p>
                <p className="type-detail-body text-secondary">{profileData.role || 'Agent'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}