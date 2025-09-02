'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import AvatarFrame from './AvatarFrame'
import BadgeDisplay from './BadgeDisplay'
import CheerButton from './CheerButton'
import { User, Users, Trophy, Star } from 'lucide-react'

export default function UserBanner({ 
  userId, 
  userData, 
  variant = 'full', // full, compact, mini
  showCheer = true,
  className = '' 
}) {
  const router = useRouter()
  const [bannerData, setBannerData] = useState(null)
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBannerData()
  }, [userId])

  const loadBannerData = async () => {
    try {
      // Get user's banner data
      const userDoc = await getDoc(doc(db, 'members', userId))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setBannerData(data.banner || getDefaultBanner())
        
        // Get team name if user has a team
        if (data.teamId) {
          const teamDoc = await getDoc(doc(db, 'teams', data.teamId))
          if (teamDoc.exists()) {
            setTeamName(teamDoc.data().name)
          }
        }
      }
    } catch (error) {
      console.error('Error loading banner:', error)
      setBannerData(getDefaultBanner())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultBanner = () => ({
    avatarUrl: '/images/default-avatar.png',
    avatarFrame: 'basic',
    bannerFrame: 'none',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    selectedBadges: [],
    cheersReceived: 0
  })

  const handleNameClick = () => {
    router.push(`/profile/${userId}`)
  }

  const handleTeamClick = () => {
    if (userData?.teamId) {
      router.push(`/team/${userData.teamId}`)
    }
  }

  const handleRankClick = () => {
    router.push(`/leaderboard?highlight=${userId}`)
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-800 rounded-xl p-4 ${className}`}>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    )
  }

  // Mini variant for leaderboards
  if (variant === 'mini') {
    return (
      <div className={`flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg ${className}`}>
        <AvatarFrame 
          imageUrl={bannerData?.avatarUrl}
          frameType={bannerData?.avatarFrame}
          size="small"
        />
        <div className="flex-1 min-w-0">
          <button 
            onClick={handleNameClick}
            className="text-white font-semibold hover:text-blue-400 transition truncate block"
          >
            {userData?.name || 'User'}
          </button>
          {teamName && (
            <div className="text-xs text-gray-400 truncate">{teamName}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Lvl {userData?.level || 1}</span>
          {showCheer && (
            <CheerButton 
              recipientId={userId}
              recipientName={userData?.name}
              size="small"
            />
          )}
        </div>
      </div>
    )
  }

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center gap-4 p-3 rounded-xl border border-gray-700 ${className}`}
        style={{ background: bannerData?.backgroundColor || '#1f2937' }}
      >
        <AvatarFrame 
          imageUrl={bannerData?.avatarUrl}
          frameType={bannerData?.avatarFrame}
          size="medium"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleNameClick}
              className="text-lg font-bold text-white hover:text-blue-400 transition"
            >
              {userData?.name || 'User'}
            </button>
            {teamName && (
              <button 
                onClick={handleTeamClick}
                className="text-sm text-gray-300 hover:text-blue-400 transition"
              >
                {teamName}
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <button 
              onClick={handleRankClick}
              className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1"
            >
              <Trophy className="w-3 h-3" />
              Rank #{userData?.seasonRank || '—'}
            </button>
            <span className="text-sm text-gray-400">
              Level {userData?.level || 1}
            </span>
          </div>
        </div>
        
        {bannerData?.selectedBadges?.length > 0 && (
          <BadgeDisplay badges={bannerData.selectedBadges} size="small" />
        )}
        
        {showCheer && (
          <CheerButton 
            recipientId={userId}
            recipientName={userData?.name}
            cheersReceived={bannerData?.cheersReceived}
          />
        )}
      </div>
    )
  }

  // Full variant (default)
  return (
    <div 
      className={`relative rounded-2xl overflow-hidden border border-gray-700 ${className}`}
      style={{ background: bannerData?.backgroundColor || '#1f2937' }}
    >
      {/* Banner Frame Decoration */}
      {bannerData?.bannerFrame && bannerData.bannerFrame !== 'none' && (
        <div className={`absolute inset-0 pointer-events-none ${getBannerFrameClass(bannerData.bannerFrame)}`} />
      )}
      
      <div className="relative p-6 flex items-center gap-6">
        {/* Avatar Section */}
        <AvatarFrame 
          imageUrl={bannerData?.avatarUrl}
          frameType={bannerData?.avatarFrame}
          size="large"
        />
        
        {/* Info Section */}
        <div className="flex-1">
          <div className="flex items-baseline gap-4 mb-2">
            <button 
              onClick={handleNameClick}
              className="text-2xl font-bold text-white hover:text-blue-400 transition flex items-center gap-2"
            >
              {userData?.name || 'User'}
              <User className="w-5 h-5 opacity-50" />
            </button>
            
            {teamName && (
              <button 
                onClick={handleTeamClick}
                className="text-lg text-gray-300 hover:text-blue-400 transition flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {teamName}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={handleRankClick}
              className="text-gray-400 hover:text-white transition flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Season Rank #{userData?.seasonRank || '—'}
            </button>
            
            <div className="text-gray-400 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Level {userData?.level || 1}
            </div>
            
            <div className="text-gray-400">
              {userData?.xp || 0} XP
            </div>
          </div>
        </div>
        
        {/* Badges Section */}
        {bannerData?.selectedBadges?.length > 0 && (
          <div className="flex items-center">
            <BadgeDisplay badges={bannerData.selectedBadges} />
          </div>
        )}
        
        {/* Cheer Section */}
        {showCheer && (
          <div className="flex flex-col items-center">
            <CheerButton 
              recipientId={userId}
              recipientName={userData?.name}
              cheersReceived={bannerData?.cheersReceived}
              size="large"
            />
            <div className="text-xs text-gray-400 mt-1">
              {bannerData?.cheersReceived || 0} cheers
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getBannerFrameClass(frameType) {
  switch (frameType) {
    case 'elegant':
      return 'border-2 border-gradient-to-r from-yellow-400 to-yellow-600'
    case 'fire':
      return 'border-2 border-gradient-to-r from-red-500 to-orange-500'
    case 'neon':
      return 'border-2 border-gradient-to-r from-blue-400 to-purple-600'
    default:
      return ''
  }
}