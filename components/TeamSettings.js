'use client'
import { useState } from 'react'
import { updateTeamSettings, generateUniqueJoinCode } from '@/lib/teamUtils'
import { useAuth } from '@/components/AuthProvider'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function TeamSettings({ teamId, teamData, onUpdate }) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: teamData?.name || '',
    description: teamData?.description || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    
    const result = await updateTeamSettings(user.uid, teamId, {
      name: formData.name.trim(),
      description: formData.description.trim()
    })
    
    if (result.success) {
      setIsEditing(false)
      onUpdate()
    } else {
      alert(result.error || 'Failed to update team settings')
    }
    
    setIsSaving(false)
  }

  const handleRegenerateCode = async () => {
    if (!confirm('Are you sure? The old code will stop working immediately.')) return
    
    setIsRegenerating(true)
    
    try {
      const newCode = await generateUniqueJoinCode()
      await updateDoc(doc(db, 'teams', teamId), {
        joinCode: newCode
      })
      onUpdate()
      alert(`New join code: ${newCode}`)
    } catch (error) {
      alert('Failed to regenerate join code')
    }
    
    setIsRegenerating(false)
  }

  const copyJoinCode = () => {
    navigator.clipboard.writeText(teamData.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteTeam = async () => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return
    if (!confirm('Really sure? All team data will be lost.')) return
    
    try {
      // Deactivate team
      await updateDoc(doc(db, 'teams', teamId), {
        isActive: false
      })
      
      // Remove team from all members
      for (const memberId of teamData.members || []) {
        await updateDoc(doc(db, 'members', memberId), {
          teamId: null,
          teamRole: null,
          teamJoinedAt: null
        })
      }
      
      onUpdate()
    } catch (error) {
      alert('Failed to delete team')
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Team Settings</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition"
          >
            Edit
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Team Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              maxLength={30}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              rows="3"
              maxLength={200}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-white/10 text-white font-bold py-2 rounded-lg hover:bg-white/20 transition"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Team Name</p>
            <p className="text-white text-lg font-semibold">{teamData?.name}</p>
          </div>
          
          {teamData?.description && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Description</p>
              <p className="text-gray-300">{teamData.description}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-400 mb-2">Join Code</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/10 rounded-lg px-4 py-3 font-mono text-xl tracking-wider text-white">
                {teamData?.joinCode}
              </div>
              <button
                onClick={copyJoinCode}
                className="px-4 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button
                onClick={handleRegenerateCode}
                disabled={isRegenerating}
                className="px-4 py-3 bg-yellow-500/20 text-yellow-400 font-bold rounded-lg hover:bg-yellow-500/30 transition disabled:opacity-50"
              >
                {isRegenerating ? '...' : 'Regenerate'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this code with people you want to join your team
            </p>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-1">Team Created</p>
            <p className="text-gray-300">
              {teamData?.createdAt ? new Date(teamData.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          
          <div className="pt-4 border-t border-red-500/20">
            <button
              onClick={handleDeleteTeam}
              className="w-full bg-red-500/20 text-red-400 font-bold py-3 rounded-lg hover:bg-red-500/30 transition"
            >
              Delete Team
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This action cannot be undone
            </p>
          </div>
        </div>
      )}
    </div>
  )
}