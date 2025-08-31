'use client'
import { useState } from 'react'
import { updateTeamSettings, generateUniqueJoinCode } from '@/src/utils/teamUtils'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { Palette } from 'lucide-react'

export default function TeamSettings({ teamId, teamData, onUpdate }) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: teamData?.name || '',
    description: teamData?.description || '',
    bannerUrl: teamData?.bannerUrl || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(teamData?.bannerUrl || '')

  const predefinedBanners = [
    { id: 'gradient-blue', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient-sunset', style: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'gradient-ocean', style: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)' },
    { id: 'gradient-forest', style: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)' },
    { id: 'gradient-fire', style: 'linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)' },
    { id: 'gradient-aurora', style: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    
    const result = await updateTeamSettings(user.uid, teamId, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      bannerUrl: selectedBanner
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
      console.error('Error regenerating join code:', error)
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
      console.error('Error deleting team:', error)
      alert('Failed to delete team')
    }
  }

  return (
    <div className="bg-gray-800 bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Team Settings</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gray-750 text-white font-bold rounded-lg hover:bg-gray-700 transition"
          >
            Edit
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-200 mb-2">Team Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              maxLength={30}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-200 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              rows="3"
              maxLength={200}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-200 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Team Banner
            </label>
            <div className="grid grid-cols-3 gap-2">
              {predefinedBanners.map((banner) => (
                <button
                  key={banner.id}
                  onClick={() => setSelectedBanner(banner.style)}
                  className={`h-20 rounded-lg border-2 transition-all ${
                    selectedBanner === banner.style 
                      ? 'border-yellow-500 ring-2 ring-yellow-500/50' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  style={{ background: banner.style }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Choose a banner that represents your team
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-750 text-white font-bold py-2 rounded-lg hover:bg-gray-700 transition"
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
            <p className="text-sm text-gray-300 mb-1">Team Name</p>
            <p className="text-white text-lg font-semibold">{teamData?.name}</p>
          </div>
          
          {teamData?.description && (
            <div>
              <p className="text-sm text-gray-300 mb-1">Description</p>
              <p className="text-gray-200">{teamData.description}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-300 mb-2">Join Code</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-750 rounded-lg px-4 py-3 font-mono text-xl tracking-wider text-white">
                {teamData?.joinCode}
              </div>
              <button
                onClick={copyJoinCode}
                className="px-4 py-3 bg-gray-750 text-white font-bold rounded-lg hover:bg-gray-700 transition"
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
            <p className="text-xs text-gray-400 mt-2">
              Share this code with people you want to join your team
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-300 mb-1">Team Created</p>
            <p className="text-gray-200">
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
            <p className="text-xs text-gray-400 mt-2 text-center">
              This action cannot be undone
            </p>
          </div>
        </div>
      )}
    </div>
  )
}