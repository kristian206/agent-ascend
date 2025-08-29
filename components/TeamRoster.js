'use client'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { leaveTeam, promoteMember, demoteMember } from '@/lib/teamUtils'
import { useAuth } from '@/components/AuthProvider'

export default function TeamRoster({ teamId, teamData, currentUserRole, onUpdate }) {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadMembers()
  }, [teamId, teamData])

  const loadMembers = async () => {
    if (!teamData?.members) {
      setLoading(false)
      return
    }
    
    try {
      const memberPromises = teamData.members.map(async (memberId) => {
        const memberDoc = await getDoc(doc(db, 'members', memberId))
        if (memberDoc.exists()) {
          const data = memberDoc.data()
          
          // Get recent activity
          const today = new Date()
          let lastActive = null
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
            const dateKey = checkDate.toISOString().split('T')[0]
            const checkInDoc = await getDoc(doc(db, 'checkins', `${memberId}_${dateKey}`))
            if (checkInDoc.exists()) {
              lastActive = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`
              break
            }
          }
          
          return {
            id: memberId,
            name: data.name || data.email?.split('@')[0] || 'Unknown',
            email: data.email,
            role: data.teamRole,
            joinedAt: data.teamJoinedAt,
            streak: data.streak || 0,
            lastActive,
            isLeader: memberId === teamData.leaderId,
            isCoLeader: teamData.coLeaders?.includes(memberId)
          }
        }
        return null
      })
      
      const membersList = (await Promise.all(memberPromises)).filter(Boolean)
      
      // Sort by role (leader first, then co-leaders, then members)
      membersList.sort((a, b) => {
        if (a.isLeader) return -1
        if (b.isLeader) return 1
        if (a.isCoLeader && !b.isCoLeader) return -1
        if (!a.isCoLeader && b.isCoLeader) return 1
        return (b.joinedAt?.seconds || 0) - (a.joinedAt?.seconds || 0)
      })
      
      setMembers(membersList)
    } catch (error) {
      console.error('Error loading members:', error)
    }
    
    setLoading(false)
  }

  const handleKick = async (targetId) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return
    
    setActionLoading(targetId)
    const result = await leaveTeam(user.uid, targetId)
    
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || 'Failed to remove member')
    }
    setActionLoading(null)
  }

  const handlePromote = async (targetId) => {
    setActionLoading(targetId)
    const result = await promoteMember(user.uid, targetId)
    
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || 'Failed to promote member')
    }
    setActionLoading(null)
  }

  const handleDemote = async (targetId) => {
    if (!confirm('Are you sure you want to demote this co-leader?')) return
    
    setActionLoading(targetId)
    const result = await demoteMember(user.uid, targetId)
    
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || 'Failed to demote co-leader')
    }
    setActionLoading(null)
  }

  const getRoleBadge = (member) => {
    if (member.isLeader) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg">Leader</span>
    }
    if (member.isCoLeader) {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg">Co-Leader</span>
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
        <p className="text-gray-400">Loading team members...</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4">
        Team Roster ({members.length}/50)
      </h3>
      
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold">
                    {member.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{member.name}</p>
                      {getRoleBadge(member)}
                      {member.id === user.uid && (
                        <span className="text-xs text-gray-500">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-400">
                        🔥 {member.streak} day streak
                      </p>
                      {member.lastActive && (
                        <p className="text-xs text-gray-400">
                          Active: {member.lastActive}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons based on permissions */}
              {member.id !== user.uid && (
                <div className="flex items-center gap-2">
                  {currentUserRole === 'leader' && !member.isLeader && (
                    <>
                      {!member.isCoLeader && teamData.coLeaders?.length < 4 && (
                        <button
                          onClick={() => handlePromote(member.id)}
                          disabled={actionLoading === member.id}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50"
                        >
                          Promote
                        </button>
                      )}
                      {member.isCoLeader && (
                        <button
                          onClick={() => handleDemote(member.id)}
                          disabled={actionLoading === member.id}
                          className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-lg hover:bg-orange-500/30 transition disabled:opacity-50"
                        >
                          Demote
                        </button>
                      )}
                      <button
                        onClick={() => handleKick(member.id)}
                        disabled={actionLoading === member.id}
                        className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
                      >
                        Kick
                      </button>
                    </>
                  )}
                  
                  {currentUserRole === 'co-leader' && !member.isLeader && !member.isCoLeader && (
                    <button
                      onClick={() => handleKick(member.id)}
                      disabled={actionLoading === member.id}
                      className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
                    >
                      Kick
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {members.length === 0 && (
        <p className="text-gray-400 text-center py-8">No team members yet</p>
      )}
    </div>
  )
}