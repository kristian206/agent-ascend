'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import TeamCreationModal from '@/components/TeamCreationModal'
import JoinTeamModal from '@/components/JoinTeamModal'
import TeamRoster from '@/components/TeamRoster'
import TeamSettings from '@/components/TeamSettings'
import TeamStats from '@/components/TeamStats'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { leaveTeam } from '@/lib/teamUtils'
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
    if (user && userData) {
      loadTeamData()
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

  const handleCreateSuccess = (result) => {
    setShowCreateModal(false)
    router.refresh()
    window.location.reload()
  }

  const handleJoinSuccess = (result) => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Navigation user={userData} />
        <div className="container mx-auto p-4 md:p-8">
          <p className="text-gray-400">Loading team data...</p>
        </div>
      </div>
    )
  }

  // No team - show create/join options
  if (!teamData || !userData?.teamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Navigation user={userData} />
        
        <div className="container mx-auto p-4 md:p-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-black text-white mb-2">
              Join or Create a Team
            </h1>
            <p className="text-gray-400">
              Collaborate, compete, and grow together
            </p>
          </header>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 hover:border-yellow-500/30 transition">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-white mb-4">Create a Team</h2>
              <p className="text-gray-300 mb-6">
                Start your own team and invite others to join. As the leader, you'll manage members and set the team direction.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition"
              >
                Create New Team
              </button>
            </div>
            
            <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition">
              <div className="text-4xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold text-white mb-4">Join a Team</h2>
              <p className="text-gray-300 mb-6">
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
      </div>
    )
  }

  // Has team - show team management
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navigation user={userData} />
      
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white">
                {teamData.name}
              </h1>
              <p className="text-gray-400 mt-1">
                {teamData.description || 'Working together to achieve greatness'}
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
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
              activeTab === 'roster'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
              activeTab === 'stats'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Stats
          </button>
          {userData?.teamRole === 'leader' && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                activeTab === 'settings'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
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
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Your Role</p>
                  <p className="text-white font-semibold capitalize">{userData?.teamRole}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Team Size</p>
                  <p className="text-white font-semibold">{teamData.memberCount}/50 members</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Join Code</p>
                  <p className="text-white font-mono text-lg tracking-wider">{teamData.joinCode}</p>
                </div>
              </div>
            </div>
            
            {/* Role Permissions */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
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
                    <p className="text-sm text-gray-400">• View team roster</p>
                    <p className="text-sm text-gray-400">• View team progress</p>
                    <p className="text-sm text-gray-400">• Leave team</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}