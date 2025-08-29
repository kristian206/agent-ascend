'use client'
import { useState } from 'react'
import { joinTeam } from '@/lib/teamUtils'
import { useAuth } from '@/components/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function JoinTeamModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [teamPreview, setTeamPreview] = useState(null)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  const handleCodeChange = async (value) => {
    const code = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setJoinCode(code)
    setError('')
    setTeamPreview(null)
    
    // Preview team when code is complete
    if (code.length === 6) {
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        const teamsQuery = query(
          collection(db, 'teams'),
          where('joinCode', '==', code),
          where('isActive', '==', true)
        )
        const snapshot = await getDocs(teamsQuery)
        
        if (!snapshot.empty) {
          const teamData = snapshot.docs[0].data()
          setTeamPreview({
            name: teamData.name,
            description: teamData.description,
            memberCount: teamData.memberCount
          })
        }
      } catch (err) {
        console.error('Error previewing team:', err)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (joinCode.length !== 6) {
      setError('Team code must be 6 characters')
      return
    }
    
    setIsJoining(true)
    
    try {
      const result = await joinTeam(user.uid, joinCode)
      
      if (result.success) {
        onSuccess(result)
      } else {
        setError(result.error || 'Failed to join team')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
    
    setIsJoining(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Join a Team</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Enter Team Code
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full px-4 py-4 text-center text-2xl font-mono tracking-wider rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase"
              placeholder="ABC123"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask your team leader for the 6-character code
            </p>
          </div>
          
          {teamPreview && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-400 text-sm font-bold mb-2">Team Found!</p>
              <p className="text-white font-bold">{teamPreview.name}</p>
              {teamPreview.description && (
                <p className="text-gray-300 text-sm mt-1">{teamPreview.description}</p>
              )}
              <p className="text-gray-400 text-xs mt-2">
                {teamPreview.memberCount} member{teamPreview.memberCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition"
              disabled={isJoining}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isJoining || joinCode.length !== 6}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? 'Joining...' : 'Join Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}