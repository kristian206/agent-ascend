'use client'
import { useState, useEffect, useRef } from 'react'
import { 
  generateAvatarOptions, 
  loadAvatarWithRetry,
  generateInitialsDataUrl,
  getAvatarSystemStatus,
  LOCAL_AVATARS 
} from '@/src/services/avatarServiceV2'
import { 
  RefreshCw, Check, Sparkles, User, Upload, 
  AlertCircle, Loader2, Camera, Grid, Palette,
  Server, HardDrive, Zap
} from 'lucide-react'

export default function AvatarSelectorV2({ 
  onSelect, 
  currentAvatar, 
  userName = 'User',
  showUpload = true,
  showStatus = false 
}) {
  const [avatarOptions, setAvatarOptions] = useState([])
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState({})
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'api', 'local', 'upload'
  const [systemStatus, setSystemStatus] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef(null)
  const [uploadedAvatar, setUploadedAvatar] = useState(null)

  // Load avatar options on mount
  useEffect(() => {
    loadAvatars()
    if (showStatus) {
      checkSystemStatus()
    }
  }, [userName])

  const loadAvatars = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const options = await generateAvatarOptions(userName, 24)
      setAvatarOptions(options)
      
      // Pre-select current avatar if it exists
      if (currentAvatar) {
        const existing = options.find(opt => opt.url === currentAvatar)
        if (existing) {
          setSelectedAvatar(existing)
        }
      }
    } catch (error) {
      console.error('Error loading avatars:', error)
      setError('Failed to load avatar options. Using fallback avatars.')
      
      // Fallback to local avatars and initials
      const fallbackOptions = [
        ...LOCAL_AVATARS.map((avatar, index) => ({
          id: `local_${avatar.id}`,
          type: 'local',
          url: avatar.path,
          name: avatar.name,
          source: 'Local File',
          available: true
        })),
        ...Array(4).fill(0).map((_, i) => ({
          id: `initials_fallback_${i}`,
          type: 'initials',
          url: generateInitialsDataUrl(userName, {
            background: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][i]
          }),
          name: `Initials ${i + 1}`,
          source: 'Generated',
          available: true
        }))
      ]
      setAvatarOptions(fallbackOptions)
    } finally {
      setIsLoading(false)
    }
  }

  const checkSystemStatus = async () => {
    try {
      const status = await getAvatarSystemStatus()
      setSystemStatus(status)
    } catch (error) {
      console.error('Error checking system status:', error)
    }
  }

  const handleAvatarSelect = async (avatar) => {
    setLoadingStates(prev => ({ ...prev, [avatar.id]: true }))
    
    try {
      // Try to load the avatar with retry
      await loadAvatarWithRetry(avatar.url, 3, 1000)
      
      setSelectedAvatar(avatar)
      onSelect({
        url: avatar.url,
        type: avatar.type,
        source: avatar.source,
        data: avatar
      })
    } catch (error) {
      console.error('Error loading avatar:', error)
      // Try fallback
      const fallbackUrl = generateInitialsDataUrl(userName)
      onSelect({
        url: fallbackUrl,
        type: 'initials',
        source: 'Fallback',
        data: { url: fallbackUrl }
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, [avatar.id]: false }))
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const avatarUrl = e.target.result
        setUploadedAvatar(avatarUrl)
        
        const uploadedData = {
          id: 'uploaded',
          type: 'custom',
          url: avatarUrl,
          name: 'Uploaded Photo',
          source: 'Upload',
          available: true
        }
        
        setSelectedAvatar(uploadedData)
        onSelect({
          url: avatarUrl,
          type: 'custom',
          source: 'Upload',
          data: uploadedData
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const refreshAvatars = async () => {
    setRetryCount(prev => prev + 1)
    await loadAvatars()
    if (showStatus) {
      await checkSystemStatus()
    }
  }

  const getFilteredAvatars = () => {
    if (activeTab === 'all') return avatarOptions
    if (activeTab === 'api') return avatarOptions.filter(a => 
      ['dicebear', 'uiAvatars', 'robohash'].includes(a.type)
    )
    if (activeTab === 'local') return avatarOptions.filter(a => 
      a.type === 'local' || a.type === 'initials'
    )
    return []
  }

  const renderSystemStatus = () => {
    if (!showStatus || !systemStatus) return null

    return (
      <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <Server className="w-4 h-4" />
            Avatar System Status
          </h4>
          <button
            onClick={checkSystemStatus}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(systemStatus.apis).map(([key, api]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                api.available ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-gray-400">{api.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <HardDrive className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">{systemStatus.localAvatars} local</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">{systemStatus.cacheSize} cached</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* System Status */}
      {renderSystemStatus()}

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-700 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-sm ${
            activeTab === 'all'
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          All Options
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex-1 py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-sm ${
            activeTab === 'api'
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Generated
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={`flex-1 py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-sm ${
            activeTab === 'local'
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          Local
        </button>
        {showUpload && (
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-sm ${
              activeTab === 'upload'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={refreshAvatars}
              className="text-red-400 hover:text-red-300 text-xs mt-1 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Avatar Grid */}
      {activeTab !== 'upload' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-200">
              Select Your Avatar
            </label>
            <button
              onClick={refreshAvatars}
              disabled={isLoading}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              title="Generate new options"
            >
              <RefreshCw className={`w-4 h-4 text-gray-200 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {isLoading ? (
              // Loading skeletons
              Array(12).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-700 rounded-lg animate-pulse" />
              ))
            ) : (
              getFilteredAvatars().map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar)}
                  disabled={loadingStates[avatar.id]}
                  className={`
                    relative aspect-square p-1 rounded-lg border-2 transition-all group
                    ${selectedAvatar?.id === avatar.id
                      ? 'border-blue-500 bg-blue-900/50 scale-105'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700 hover:scale-105'
                    }
                    ${loadingStates[avatar.id] ? 'cursor-wait' : 'cursor-pointer'}
                  `}
                  title={`${avatar.name} (${avatar.source})`}
                >
                  {loadingStates[avatar.id] ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(e) => {
                          console.warn('Avatar display error:', avatar.url)
                          e.target.src = generateInitialsDataUrl(userName)
                        }}
                      />
                      {selectedAvatar?.id === avatar.id && (
                        <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">{avatar.source}</p>
                      </div>
                    </>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Retry count indicator */}
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Retried {retryCount} time{retryCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Upload Section */}
      {showUpload && activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            {uploadedAvatar ? (
              <div className="space-y-4">
                <img
                  src={uploadedAvatar}
                  alt="Uploaded avatar"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-500"
                />
                <p className="text-green-400 text-sm">Photo uploaded successfully!</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-300 mb-2">Upload your profile photo</p>
                  <p className="text-gray-500 text-sm mb-4">JPG, PNG or GIF. Max 5MB.</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Selected Avatar Preview */}
      {selectedAvatar && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-4">
            <img
              src={selectedAvatar.url}
              alt="Selected avatar"
              className="w-20 h-20 rounded-full border-2 border-blue-500"
              onError={(e) => {
                e.target.src = generateInitialsDataUrl(userName)
              }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-200">Avatar Selected!</div>
              <div className="text-xs text-gray-400">
                {selectedAvatar.name} • {selectedAvatar.source}
              </div>
              <div className="text-xs text-blue-400 mt-1">
                This will be your profile picture
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="text-xs text-gray-400 text-center">
        Multiple avatar sources available • Automatic fallbacks enabled • Cached for performance
      </div>
    </div>
  )
}