'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import UserBanner from './UserBanner'

// Configuration options
const BACKGROUNDS = [
  { value: 'default', label: 'Default', preview: 'from-surface-100 to-surface-200' },
  { value: 'midnight', label: 'Midnight', preview: 'from-gray-900 to-black' },
  { value: 'ocean', label: 'Ocean', preview: 'from-blue-900 to-cyan-900' },
  { value: 'sunset', label: 'Sunset', preview: 'from-orange-900 to-pink-900' },
  { value: 'forest', label: 'Forest', preview: 'from-green-900 to-emerald-900' },
  { value: 'royal', label: 'Royal', preview: 'from-purple-900 to-indigo-900' },
  { value: 'crimson', label: 'Crimson', preview: 'from-red-900 to-rose-900' },
  { value: 'cosmic', label: 'Cosmic', preview: 'from-violet-900 via-purple-900 to-pink-900' }
]

const BORDER_STYLES = [
  { value: 'default', label: 'Default', description: 'Simple border' },
  { value: 'silver', label: 'Silver', description: 'Glowing silver border', requiresLevel: 10 },
  { value: 'gold', label: 'Gold', description: 'Glowing gold border', requiresLevel: 25 },
  { value: 'animated', label: 'Animated', description: 'Animated gradient border', requiresLevel: 50 }
]

const ACHIEVEMENT_BADGES = [
  { value: 'topSeller', label: 'Top Seller', icon: '🏆', description: 'Finish #1 in monthly sales' },
  { value: 'streak30', label: '30 Day Streak', icon: '🔥', description: 'Maintain a 30-day streak' },
  { value: 'teamPlayer', label: 'Team Player', icon: '🤝', description: 'Help team reach goals' },
  { value: 'closer', label: 'Deal Closer', icon: '💼', description: 'Close 100+ deals' },
  { value: 'rising', label: 'Rising Star', icon: '📈', description: 'Fastest growth in team' },
  { value: 'veteran', label: 'Veteran', icon: '🎖️', description: '1 year of service' },
  { value: 'mentor', label: 'Mentor', icon: '🎓', description: 'Train 5+ team members' },
  { value: 'champion', label: 'Champion', icon: '🥇', description: 'Win quarterly competition' }
]

export default function BannerCustomizer() {
  const { user, userData } = useAuth()
  const [settings, setSettings] = useState({
    background: 'default',
    borderStyle: 'default',
    showcaseBadges: []
  })
  const [previewData, setPreviewData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [unlockedBadges, setUnlockedBadges] = useState([])

  // Load current settings and unlocked badges
  useEffect(() => {
    if (userData) {
      // Load saved settings
      if (userData.bannerSettings) {
        setSettings(userData.bannerSettings)
      }
      
      // Create preview data
      setPreviewData({
        ...userData,
        bannerSettings: userData.bannerSettings || settings
      })
      
      // Determine unlocked badges based on achievements
      const unlocked = []
      
      // Check for unlocked badges based on user stats
      if (userData.totalSales >= 100) unlocked.push('closer')
      if (userData.streak >= 30) unlocked.push('streak30')
      if (userData.level >= 20) unlocked.push('rising')
      if (userData.isTopSeller) unlocked.push('topSeller')
      if (userData.teamContribution >= 1000) unlocked.push('teamPlayer')
      if (userData.accountAge >= 365) unlocked.push('veteran')
      if (userData.mentees >= 5) unlocked.push('mentor')
      if (userData.quarterlyWins >= 1) unlocked.push('champion')
      
      setUnlockedBadges(unlocked)
    }
  }, [userData])

  // Handle background change
  const handleBackgroundChange = (value) => {
    const newSettings = { ...settings, background: value }
    setSettings(newSettings)
    setPreviewData({ ...previewData, bannerSettings: newSettings })
  }

  // Handle border style change
  const handleBorderChange = (value) => {
    const borderOption = BORDER_STYLES.find(b => b.value === value)
    
    // Check if user has required level
    if (borderOption.requiresLevel && userData.level < borderOption.requiresLevel) {
      alert(`You need to reach level ${borderOption.requiresLevel} to unlock this border style!`)
      return
    }
    
    const newSettings = { ...settings, borderStyle: value }
    setSettings(newSettings)
    setPreviewData({ ...previewData, bannerSettings: newSettings })
  }

  // Handle badge selection
  const handleBadgeToggle = (badgeValue) => {
    // Check if badge is unlocked
    if (!unlockedBadges.includes(badgeValue)) {
      const badge = ACHIEVEMENT_BADGES.find(b => b.value === badgeValue)
      alert(`You haven't unlocked this badge yet! ${badge.description}`)
      return
    }
    
    let newBadges = [...settings.showcaseBadges]
    
    if (newBadges.includes(badgeValue)) {
      // Remove badge
      newBadges = newBadges.filter(b => b !== badgeValue)
    } else {
      // Add badge (max 4)
      if (newBadges.length >= 4) {
        alert('You can showcase a maximum of 4 badges!')
        return
      }
      newBadges.push(badgeValue)
    }
    
    const newSettings = { ...settings, showcaseBadges: newBadges }
    setSettings(newSettings)
    setPreviewData({ ...previewData, bannerSettings: newSettings })
  }

  // Save settings to Firebase
  const handleSave = async () => {
    if (!user?.uid) return
    
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        bannerSettings: settings
      })
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving banner settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!userData) {
    return (
      <div className="glass radius-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="type-list-body text-secondary">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      <div className="glass radius-xl p-6 elev-1">
        <h2 className="type-list-heading text-primary mb-4">Banner Preview</h2>
        <div className="bg-surface-50 rounded-lg p-4">
          {previewData && (
            <UserBanner
              userData={previewData}
              viewerData={userData}
              context="preview"
              size="large"
            />
          )}
        </div>
      </div>

      {/* Customization Options */}
      <div className="glass radius-xl p-6 elev-1">
        <h2 className="type-list-heading text-primary mb-6">Customize Your Banner</h2>
        
        {/* Background Selection */}
        <div className="mb-8">
          <h3 className="type-list-label text-secondary mb-3">Background Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BACKGROUNDS.map(bg => (
              <button
                key={bg.value}
                onClick={() => handleBackgroundChange(bg.value)}
                className={`
                  relative h-20 rounded-lg overflow-hidden border-2 transition-all
                  ${settings.background === bg.value 
                    ? 'border-brand-500 scale-105' 
                    : 'border-ink-200 hover:border-ink-300'}
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${bg.preview}`} />
                <div className="relative h-full flex items-center justify-center">
                  <span className="type-detail-body text-white font-medium drop-shadow-lg">
                    {bg.label}
                  </span>
                </div>
                {settings.background === bg.value && (
                  <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Border Style Selection */}
        <div className="mb-8">
          <h3 className="type-list-label text-secondary mb-3">Border Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BORDER_STYLES.map(border => {
              const isLocked = border.requiresLevel && userData.level < border.requiresLevel
              return (
                <button
                  key={border.value}
                  onClick={() => !isLocked && handleBorderChange(border.value)}
                  disabled={isLocked}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${settings.borderStyle === border.value 
                      ? 'border-brand-500 bg-brand-500/10' 
                      : isLocked
                      ? 'border-ink-200 bg-surface-50 opacity-50 cursor-not-allowed'
                      : 'border-ink-200 hover:border-ink-300 hover:bg-surface-50'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="type-list-body text-primary font-medium">{border.label}</p>
                      <p className="type-detail-caption text-secondary">{border.description}</p>
                    </div>
                    {isLocked ? (
                      <div className="text-center">
                        <span className="text-2xl">🔒</span>
                        <p className="type-detail-caption text-tertiary">Lvl {border.requiresLevel}</p>
                      </div>
                    ) : settings.borderStyle === border.value ? (
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Badge Showcase Selection */}
        <div className="mb-8">
          <h3 className="type-list-label text-secondary mb-3">
            Showcase Badges ({settings.showcaseBadges.length}/4 selected)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACHIEVEMENT_BADGES.map(badge => {
              const isUnlocked = unlockedBadges.includes(badge.value)
              const isSelected = settings.showcaseBadges.includes(badge.value)
              
              return (
                <button
                  key={badge.value}
                  onClick={() => handleBadgeToggle(badge.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-brand-500 bg-brand-500/10' 
                      : !isUnlocked
                      ? 'border-ink-200 bg-surface-50 opacity-50'
                      : 'border-ink-200 hover:border-ink-300 hover:bg-surface-50'}
                  `}
                >
                  <div className="text-center">
                    <span className="text-3xl block mb-1">{badge.icon}</span>
                    <p className="type-detail-body text-primary font-medium">{badge.label}</p>
                    {!isUnlocked && (
                      <p className="type-detail-caption text-tertiary mt-1">🔒 Locked</p>
                    )}
                    {isSelected && (
                      <div className="mt-2 inline-block w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <p className="type-list-body text-success flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Settings saved successfully!
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-lg glass-brand type-list-body text-white font-medium disabled:opacity-50 hover:scale-105 transition-all"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="glass radius-xl p-6 elev-1">
        <h3 className="type-list-heading text-primary mb-4">Achievement Progress</h3>
        <div className="space-y-3">
          {ACHIEVEMENT_BADGES.map(badge => {
            const isUnlocked = unlockedBadges.includes(badge.value)
            
            return (
              <div key={badge.value} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="type-list-body text-primary font-medium">{badge.label}</p>
                    <p className="type-detail-caption text-secondary">{badge.description}</p>
                  </div>
                </div>
                {isUnlocked ? (
                  <span className="px-3 py-1 rounded-full bg-success/10 type-detail-caption text-success font-medium">
                    ✓ Unlocked
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-ink-100 type-detail-caption text-ink-400">
                    🔒 Locked
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}