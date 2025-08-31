'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import PageLayout from '@/src/components/layout/PageLayout'
import TeamCreationModal from '@/src/components/team/TeamCreationModal'
import JoinTeamModal from '@/src/components/team/JoinTeamModal'
import TeamRoster from '@/src/components/team/TeamRoster'
import TeamSettings from '@/src/components/team/TeamSettings'
import TeamStats from '@/src/components/team/TeamStats'
import PerformanceHUD from '@/src/components/performance/PerformanceHUD'
import TeamGoalManager from '@/src/components/team/TeamGoalManager'
import MemberGoalView from '@/src/components/team/MemberGoalView'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { leaveTeam } from '@/src/utils/teamUtils'
import { useRouter } from 'next/navigation'

export default function TeamPage() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [activeTab, setActiveTab] = useState('roster')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      if (userData?.teamId) {
        try {
          const teamDoc = await getDoc(doc(db, 'teams', userData.teamId))
          if (teamDoc.exists() && teamDoc.data().isActive) {
            setTeamData(teamDoc.data())
          } else {
            // Team no longer exists or is inactive
            setTeamData(null)
          }
        } catch (error) {
          console.error('Error loading team:', error)
        }
      }
      
      setLoading(false)
    }
    
    if (user && userData) {
      loadData()
    }
  }, [user, userData])

  const loadTeamData = async () => {
    setLoading(true)
    
    if (userData?.teamId) {
      try {
        const teamDoc = await getDoc(doc(db, 'teams', userData.teamId))
        if (teamDoc.exists() && teamDoc.data().isActive) {
          setTeamData(teamDoc.data())
        } else {
          // Team no longer exists or is inactive
          setTeamData(null)
        }
      } catch (error) {
        console.error('Error loading team:', error)
      }
    }
    
    setLoading(false)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    router.refresh()
    window.location.reload()
  }

  const handleJoinSuccess = () => {
    setShowJoinModal(false)
    router.refresh()
    window.location.reload()
  }

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return
    
    const result = await leaveTeam(user.uid)
    if (result.success) {
      router.refresh()
      window.location.reload()
    } else {
      alert(result.error || 'Failed to leave team')
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <PageLayout user={userData}>
        <p className="text-gray-300">Loading team data...</p>
      </PageLayout>
    )
  }

  // No team - show create/join options
  if (!teamData || !userData?.teamId) {
    return (
      <PageLayout user={userData}>
        <div>
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-black text-white mb-2">
              Join or Create a Team
            </h1>
            <p className="text-gray-300">
              Collaborate, compete, and grow together
            </p>
          </header>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-yellow-500/30 transition">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-white mb-4">Create a Team</h2>
              <p className="text-gray-200 mb-6">
                Start your own team and invite others to join. As the leader, you&apos;ll manage members and set the team direction.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition"
              >
                Create New Team
              </button>
            </div>
            
            <div className="bg-gray-800 bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/30 transition">
              <div className="text-4xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold text-white mb-4">Join a Team</h2>
              <p className="text-gray-200 mb-6">
                Have a team code? Join an existing team and start collaborating with your colleagues right away.
              </p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
              >
                Join Existing Team
              </button>
            </div>
          </div>
        </div>
        
        {showCreateModal && (
          <TeamCreationModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
        
        {showJoinModal && (
          <JoinTeamModal
            onClose={() => setShowJoinModal(false)}
            onSuccess={handleJoinSuccess}
          />
        )}
      </PageLayout>
    )
  }

  // Has team - show team management
  return (
    <PageLayout user={userData}>
      <div>
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white">
                {teamData.name}
              </h1>
              <p className="text-gray-300 mt-1">
                Team ID: {teamData.teamNumber || '------'} • {teamData.description || 'Working together to achieve greatness'}
              </p>
            </div>
            
            <button
              onClick={handleLeaveTeam}
              className="px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition"
            >
              Leave Team
            </button>
          </div>
        </header>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
              activeTab === 'roster'
                ? 'bg-gray-750 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
              activeTab === 'goals'
                ? 'bg-gray-750 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
              activeTab === 'performance'
                ? 'bg-gray-750 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
              activeTab === 'stats'
                ? 'bg-gray-750 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Stats
          </button>
          {userData?.teamRole === 'leader' && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                activeTab === 'settings'
                  ? 'bg-gray-750 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Settings
            </button>
          )}
        </div>
        
        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'roster' && (
              <TeamRoster
                teamId={userData.teamId}
                teamData={teamData}
                currentUserRole={userData.teamRole}
                onUpdate={loadTeamData}
              />
            )}
            
            {activeTab === 'goals' && (
              userData?.teamRole === 'leader' || userData?.teamRole === 'co-leader' ? (
                <TeamGoalManager teamId={userData.teamId} />
              ) : (
                <MemberGoalView teamId={userData.teamId} />
              )
            )}
            
            {activeTab === 'performance' && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <PerformanceHUD 
                  userId={userData?.uid}
                  view="team"
                  compact={false}
                  showCoaching={true}
                />
              </div>
            )}
            
            {activeTab === 'stats' && (
              <TeamStats
                teamId={userData.teamId}
                teamData={teamData}
              />
            )}
            
            {activeTab === 'settings' && userData?.teamRole === 'leader' && (
              <TeamSettings
                teamId={userData.teamId}
                teamData={teamData}
                onUpdate={loadTeamData}
              />
            )}
          </div>
          
          {/* Side Panel - Always visible */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-300">Team ID</p>
                  <p className="text-white font-mono text-lg">{teamData.teamNumber || '------'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-300">Your Role</p>
                  <p className="text-white font-semibold capitalize">{userData?.teamRole}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-300">Team Size</p>
                  <p className="text-white font-semibold">{teamData.memberCount}/50 members</p>
                </div>
                <div>
                  <p className="text-xs text-gray-300">Join Code</p>
                  <p className="text-white font-mono text-lg tracking-wider">{teamData.joinCode}</p>
                </div>
              </div>
            </div>
            
            {/* Role Permissions */}
            <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Your Permissions</h3>
              <div className="space-y-2">
                {userData?.teamRole === 'leader' && (
                  <>
                    <p className="text-sm text-green-400">✓ Manage all members</p>
                    <p className="text-sm text-green-400">✓ Edit team settings</p>
                    <p className="text-sm text-green-400">✓ Promote/demote co-leaders</p>
                    <p className="text-sm text-green-400">✓ Delete team</p>
                  </>
                )}
                {userData?.teamRole === 'co-leader' && (
                  <>
                    <p className="text-sm text-green-400">✓ Kick regular members</p>
                    <p className="text-sm text-green-400">✓ View team analytics</p>
                    <p className="text-sm text-green-400">✓ Send announcements</p>
                  </>
                )}
                {userData?.teamRole === 'member' && (
                  <>
                    <p className="text-sm text-gray-300">• View team roster</p>
                    <p className="text-sm text-gray-300">• View team progress</p>
                    <p className="text-sm text-gray-300">• Leave team</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}