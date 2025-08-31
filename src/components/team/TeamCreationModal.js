'use client'
import { useState } from 'react'
import { createTeam } from '@/src/utils/teamUtils'
import { useAuth } from '@/src/components/auth/AuthProvider'

export default function TeamCreationModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (formData.name.length < 3 || formData.name.length > 30) {
      setError('Team name must be 3-30 characters')
      return
    }
    
    if (formData.description.length > 200) {
      setError('Description must be under 200 characters')
      return
    }
    
    setIsCreating(true)
    
    try {
      const result = await createTeam(user.uid, formData.name, formData.description)
      
      if (result.success) {
        onSuccess(result)
      } else {
        setError(result.error || 'Failed to create team')
      }
    } catch (err) {
      console.error('Error creating team:', err)
      setError('An unexpected error occurred')
    }
    
    setIsCreating(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 bg-gray-900 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Create Your Team</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-200 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="The Achievers"
              required
              minLength={3}
              maxLength={30}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.name.length}/30 characters
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-200 mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              rows="3"
              placeholder="Our mission is to achieve excellence together..."
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.description.length}/200 characters
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-750 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || formData.name.length < 3}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}