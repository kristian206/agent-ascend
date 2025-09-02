'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/src/services/firebase'
import UserBanner from './UserBanner'
import AvatarFrame from './AvatarFrame'
import BadgeDisplay from './BadgeDisplay'
import { Upload, Palette, Award, Save, X } from 'lucide-react'

const FRAME_OPTIONS = {
  avatar: [
    { id: 'basic', name: 'Basic', locked: false },
    { id: 'silver', name: 'Silver', locked: false },
    { id: 'gold', name: 'Gold', locked: true, requirement: 'Level 10' },
    { id: 'diamond', name: 'Diamond', locked: true, requirement: 'Level 20' },
    { id: 'fire', name: 'Fire', locked: true, requirement: '30-day streak' },
    { id: 'neon', name: 'Neon', locked: true, requirement: 'Top 10 Season' },
    { id: 'animated', name: 'Animated', locked: true, requirement: 'Special Event' }
  ],
  banner: [
    { id: 'none', name: 'None', locked: false },
    { id: 'elegant', name: 'Elegant', locked: false },
    { id: 'fire', name: 'Fire', locked: true, requirement: 'Sales Champion' },
    { id: 'neon', name: 'Neon', locked: true, requirement: 'Team Leader' }
  ]
}

const BACKGROUND_OPTIONS = [
  { id: 'gradient1', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Purple Dream' },
  { id: 'gradient2', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink Sunset' },
  { id: 'gradient3', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Ocean Blue' },
  { id: 'gradient4', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Mint Fresh' },
  { id: 'gradient5', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Warm Glow' },
  { id: 'gradient6', value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', name: 'Deep Space' },
  { id: 'solid1', value: '#1f2937', name: 'Dark Gray' },
  { id: 'solid2', value: '#1e40af', name: 'Royal Blue' },
  { id: 'solid3', value: '#7c3aed', name: 'Vivid Purple' }
]

export default function BannerCustomizer({ onClose, onSave }) {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(null)
  const [preview, setPreview] = useState(null)
  const [availableBadges, setAvailableBadges] = useState([])
  const [selectedTab, setSelectedTab] = useState('avatar')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    loadCurrentSettings()
  }, [user])

  const loadCurrentSettings = async () => {
    if (!user) return

    try {
      const userDoc = await getDoc(doc(db, 'members', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        const banner = data.banner || {
          avatarUrl: '/images/default-avatar.png',
          avatarFrame: 'basic',
          bannerFrame: 'none',
          backgroundColor: BACKGROUND_OPTIONS[0].value,
          selectedBadges: []
        }
        setCurrentBanner(banner)
        setPreview({ ...banner })
        setAvailableBadges(data.achievements || [])
      }
    } catch (error) {
      console.error('Error loading banner settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingAvatar(true)

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      setPreview(prev => ({ ...prev, avatarUrl: downloadURL }))
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleFrameSelect = (type, frameId) => {
    setPreview(prev => ({
      ...prev,
      [type === 'avatar' ? 'avatarFrame' : 'bannerFrame']: frameId
    }))
  }

  const handleBackgroundSelect = (value) => {
    setPreview(prev => ({ ...prev, backgroundColor: value }))
  }

  const handleBadgeToggle = (badgeId) => {
    const current = preview.selectedBadges || []
    if (current.includes(badgeId)) {
      setPreview(prev => ({
        ...prev,
        selectedBadges: current.filter(b => b !== badgeId)
      }))
    } else if (current.length < 3) {
      setPreview(prev => ({
        ...prev,
        selectedBadges: [...current, badgeId]
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      await updateDoc(doc(db, 'members', user.uid), {
        banner: preview
      })

      if (onSave) onSave(preview)
      onClose()
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('Failed to save banner settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Customize Your Banner</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 bg-gray-800">
          <h3 className="text-sm text-gray-400 mb-3">Preview</h3>
          <UserBanner 
            userId={user.uid}
            userData={{ 
              ...userData,
              banner: preview 
            }}
            variant="full"
            showCheer={false}
          />
        </div>

        {/* Customization Options */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['avatar', 'background', 'badges'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Avatar Tab */}
          {selectedTab === 'avatar' && (
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <h3 className="text-white font-semibold mb-3">Avatar Image</h3>
                <div className="flex items-center gap-4">
                  <AvatarFrame 
                    imageUrl={preview.avatarUrl}
                    frameType={preview.avatarFrame}
                    size="large"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
                    </div>
                  </label>
                </div>
              </div>

              {/* Avatar Frame */}
              <div>
                <h3 className="text-white font-semibold mb-3">Avatar Frame</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {FRAME_OPTIONS.avatar.map(frame => (
                    <button
                      key={frame.id}
                      onClick={() => !frame.locked && handleFrameSelect('avatar', frame.id)}
                      disabled={frame.locked}
                      className={`relative p-3 rounded-lg border-2 transition ${
                        preview.avatarFrame === frame.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : frame.locked
                          ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <AvatarFrame 
                        imageUrl="/images/default-avatar.png"
                        frameType={frame.id}
                        size="small"
                      />
                      <div className="mt-2 text-xs text-gray-300">{frame.name}</div>
                      {frame.locked && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="text-xs text-gray-400 text-center">
                            🔒<br />{frame.requirement}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Background Tab */}
          {selectedTab === 'background' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold mb-3">Background Style</h3>
              <div className="grid grid-cols-3 gap-3">
                {BACKGROUND_OPTIONS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => handleBackgroundSelect(bg.value)}
                    className={`relative h-24 rounded-lg border-2 transition ${
                      preview.backgroundColor === bg.value
                        ? 'border-blue-500 scale-105'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    style={{ background: bg.value }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                      <div className="text-xs text-white">{bg.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Badges Tab */}
          {selectedTab === 'badges' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-3">
                  Select Badges ({preview.selectedBadges?.length || 0}/3)
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {availableBadges.length === 0 ? (
                    <div className="col-span-full text-gray-400 text-center py-8">
                      No badges earned yet. Complete achievements to unlock badges!
                    </div>
                  ) : (
                    availableBadges.map(badgeId => (
                      <button
                        key={badgeId}
                        onClick={() => handleBadgeToggle(badgeId)}
                        className={`p-3 rounded-lg border-2 transition ${
                          preview.selectedBadges?.includes(badgeId)
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <BadgeDisplay badges={[badgeId]} size="small" showTooltip={false} />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}