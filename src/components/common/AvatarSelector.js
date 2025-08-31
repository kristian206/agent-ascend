'use client'
import { useState, useEffect } from 'react'
import { 
  AVATAR_STYLES, 
  generateAvatarUrl, 
  generateAvatarVariations,
  formatAvatarData
} from '@/src/services/avatarService'
import { RefreshCw, Check, Sparkles, User } from 'lucide-react'

export default function AvatarSelector({ 
  onSelect, 
  userName = '',
  showStyleSelector = true 
}) {
  const [selectedStyle, setSelectedStyle] = useState('avataaars')
  const [avatarVariations, setAvatarVariations] = useState([])
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('popular') // popular, all, custom

  // Popular styles for quick access
  const popularStyles = [
    'avataaars',
    'bottts',
    'big-smile',
    'lorelei',
    'micah',
    'personas',
    'pixel-art',
    'adventurer',
    'fun-emoji',
    'notionists'
  ]

  // Generate initial variations
  useEffect(() => {
    generateNewVariations()
  }, [selectedStyle, userName])

  const generateNewVariations = () => {
    setIsLoading(true)
    const variations = generateAvatarVariations(
      userName || 'user',
      selectedStyle,
      12
    )
    console.log('Generated avatar variations:', variations)
    setAvatarVariations(variations)
    setIsLoading(false)
  }

  const handleSelectAvatar = (avatar) => {
    setSelectedAvatar(avatar)
    const avatarData = formatAvatarData(avatar.style, avatar.seed)
    onSelect({
      url: avatar.url,
      data: avatarData,
      style: avatar.style,
      seed: avatar.seed
    })
  }

  const handleStyleChange = (styleId) => {
    setSelectedStyle(styleId)
    setSelectedAvatar(null)
  }

  const getStylesForTab = () => {
    if (activeTab === 'popular') {
      return AVATAR_STYLES.filter(style => popularStyles.includes(style.id))
    }
    return AVATAR_STYLES
  }

  return (
    <div className="space-y-6">
      {showStyleSelector && (
        <>
          {/* Tab Navigation */}
          <div className="flex gap-2 p-1 bg-gray-700 rounded-lg">
            <button
              onClick={() => setActiveTab('popular')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === 'popular'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Popular
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              All Styles
            </button>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Choose Avatar Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-800 rounded-lg">
              {getStylesForTab().map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    ${selectedStyle === style.id
                      ? 'border-blue-500 bg-blue-900/50'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <img
                      src={generateAvatarUrl(style.id, 'preview', { size: 40 })}
                      alt={style.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${style.name}&size=40`
                      }}
                    />
                    {selectedStyle === style.id && (
                      <Check className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-100">{style.name}</div>
                  <div className="text-xs text-gray-400 truncate">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Style Info */}
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-200">
                {AVATAR_STYLES.find(s => s.id === selectedStyle)?.name}
              </div>
              <div className="text-xs text-gray-400">
                {AVATAR_STYLES.find(s => s.id === selectedStyle)?.description}
              </div>
            </div>
            <button
              onClick={generateNewVariations}
              disabled={isLoading}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              title="Generate new variations"
            >
              <RefreshCw className={`w-4 h-4 text-gray-200 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </>
      )}

      {/* Avatar Variations Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Select Your Avatar
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {isLoading ? (
            // Loading skeletons
            Array(12).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-700 rounded-lg animate-pulse" />
            ))
          ) : (
            avatarVariations.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleSelectAvatar(avatar)}
                className={`
                  relative aspect-square p-2 rounded-lg border-2 transition-all
                  ${selectedAvatar?.id === avatar.id
                    ? 'border-blue-500 bg-blue-900/50 scale-105'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-700 hover:scale-105'
                  }
                `}
              >
                <img
                  src={avatar.url}
                  alt={`Avatar option ${avatar.id}`}
                  className="w-full h-full rounded-lg object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Avatar failed to load:', avatar.url)
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${userName || 'User'}`
                  }}
                />
                {selectedAvatar?.id === avatar.id && (
                  <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Preview Section */}
      {selectedAvatar && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-4">
            <img
              src={selectedAvatar.url}
              alt="Selected avatar"
              className="w-20 h-20 rounded-full border-2 border-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-200">Avatar Selected!</div>
              <div className="text-xs text-gray-400">
                Style: {AVATAR_STYLES.find(s => s.id === selectedAvatar.style)?.name}
              </div>
              <div className="text-xs text-blue-400 mt-1">
                This avatar will be your profile picture
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="text-xs text-gray-400 text-center">
        Avatars powered by DiceBear • Free and open source
      </div>
    </div>
  )
}