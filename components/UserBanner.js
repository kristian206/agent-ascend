'use client'
import { useState, useEffect, memo, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import Link from 'next/link'

// Role badge configurations
const ROLE_BADGES = {
  leader: { label: 'Leader', color: 'from-yellow-500 to-orange-500', icon: '👑' },
  coLeader: { label: 'Co-Leader', color: 'from-purple-500 to-pink-500', icon: '⭐' },
  senior: { label: 'Senior', color: 'from-blue-500 to-cyan-500', icon: '💎' },
  member: { label: 'Member', color: 'from-gray-500 to-gray-600', icon: '🔷' }
}

// Season rank tiers
const SEASON_RANKS = {
  bronze: { label: 'Bronze', color: 'from-orange-700 to-orange-900', minPoints: 0 },
  silver: { label: 'Silver', color: 'from-gray-400 to-gray-600', minPoints: 1000 },
  gold: { label: 'Gold', color: 'from-yellow-400 to-yellow-600', minPoints: 2500 },
  platinum: { label: 'Platinum', color: 'from-cyan-400 to-blue-500', minPoints: 5000 },
  diamond: { label: 'Diamond', color: 'from-purple-400 to-pink-500', minPoints: 10000 },
  master: { label: 'Master', color: 'from-red-500 to-purple-600', minPoints: 20000 }
}

// Achievement badges
const ACHIEVEMENT_BADGES = {
  topSeller: { icon: '🏆', label: 'Top Seller', color: 'bg-yellow-500' },
  streak30: { icon: '🔥', label: '30 Day Streak', color: 'bg-orange-500' },
  teamPlayer: { icon: '🤝', label: 'Team Player', color: 'bg-blue-500' },
  closer: { icon: '💼', label: 'Deal Closer', color: 'bg-green-500' },
  rising: { icon: '📈', label: 'Rising Star', color: 'bg-purple-500' },
  veteran: { icon: '🎖️', label: 'Veteran', color: 'bg-gray-600' },
  mentor: { icon: '🎓', label: 'Mentor', color: 'bg-indigo-500' },
  champion: { icon: '🥇', label: 'Champion', color: 'bg-red-500' }
}

// Banner border styles
const BORDER_STYLES = {
  default: 'border-2 border-ink-200',
  silver: 'border-2 border-gray-400 shadow-[0_0_10px_rgba(192,192,192,0.5)]',
  gold: 'border-2 border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.6)]',
  animated: 'border-2 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-border animate-gradient-x'
}

// Banner background gradients
const BACKGROUND_GRADIENTS = {
  default: 'from-surface-100 to-surface-200',
  midnight: 'from-gray-900 to-black',
  ocean: 'from-blue-900 to-cyan-900',
  sunset: 'from-orange-900 to-pink-900',
  forest: 'from-green-900 to-emerald-900',
  royal: 'from-purple-900 to-indigo-900',
  crimson: 'from-red-900 to-rose-900',
  cosmic: 'from-violet-900 via-purple-900 to-pink-900'
}

const UserBanner = memo(({ 
  userData, 
  viewerData = null, 
  context = 'leaderboard', 
  size = 'medium',
  onAction = null 
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [bannerSettings, setBannerSettings] = useState({
    background: 'default',
    borderStyle: 'default',
    showcaseBadges: []
  })

  // Load banner customization settings
  useEffect(() => {
    if (userData?.bannerSettings) {
      setBannerSettings(userData.bannerSettings)
    }
  }, [userData])

  // Calculate season rank
  const getSeasonRank = useCallback((points) => {
    const entries = Object.entries(SEASON_RANKS).reverse()
    for (const [key, rank] of entries) {
      if (points >= rank.minPoints) {
        const tier = Math.min(3, Math.floor((points - rank.minPoints) / (rank.minPoints * 0.3)) + 1)
        return { ...rank, tier, key }
      }
    }
    return { ...SEASON_RANKS.bronze, tier: 1, key: 'bronze' }
  }, [])

  // Get role configuration
  const getRoleConfig = useCallback(() => {
    if (userData?.isLeader) return ROLE_BADGES.leader
    if (userData?.isCoLeader) return ROLE_BADGES.coLeader
    if (userData?.isSenior) return ROLE_BADGES.senior
    return ROLE_BADGES.member
  }, [userData])

  // Determine action buttons based on context
  const getActionButtons = useCallback(() => {
    const buttons = []
    const isOwnProfile = user?.uid === userData?.id
    const isLeader = viewerData?.isLeader
    const isSameTeam = viewerData?.teamId === userData?.teamId

    if (isOwnProfile) {
      buttons.push({ 
        label: 'Edit Banner', 
        action: 'edit', 
        className: 'glass-brand',
        icon: '✏️'
      })
    } else if (isLeader && isSameTeam) {
      if (!userData?.isLeader) {
        buttons.push({ 
          label: 'Promote', 
          action: 'promote', 
          className: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
          icon: '⬆️'
        })
      }
      buttons.push({ 
        label: 'Kick', 
        action: 'kick', 
        className: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
        icon: '🚫'
      })
    } else if (isSameTeam) {
      buttons.push({ 
        label: 'Cheer', 
        action: 'cheer', 
        className: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
        icon: '👏'
      })
      buttons.push({ 
        label: 'Profile', 
        action: 'profile', 
        className: 'glass hover:bg-surface-100',
        icon: '👤'
      })
    } else if (!isSameTeam && userData?.teamId) {
      buttons.push({ 
        label: 'Invite', 
        action: 'invite', 
        className: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
        icon: '📨'
      })
    }

    return buttons
  }, [user, userData, viewerData])

  // Handle action button clicks
  const handleAction = useCallback((action) => {
    if (onAction) {
      onAction(action, userData)
    } else {
      switch(action) {
        case 'edit':
          router.push('/profile?tab=banner')
          break
        case 'profile':
          router.push(`/profile/${userData.id}`)
          break
        case 'cheer':
          // Implement cheer functionality
          console.log('Cheer for', userData.name)
          break
        default:
          console.log('Action:', action, userData)
      }
    }
  }, [onAction, userData, router])

  if (!userData) return null

  const roleConfig = getRoleConfig()
  const seasonRank = getSeasonRank(userData.monthPoints || 0)
  const currentMonth = new Date().getMonth() + 1
  const showcaseBadges = bannerSettings.showcaseBadges.slice(0, size === 'large' ? 4 : 3)

  // Size-based classes
  const sizeClasses = {
    small: 'h-20 text-xs',
    medium: 'h-28 text-sm',
    large: 'h-36 text-base'
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl transition-all duration-300
        ${sizeClasses[size]}
        ${BORDER_STYLES[bannerSettings.borderStyle]}
        ${isHovered ? 'transform scale-[1.02] z-10' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-br 
        ${BACKGROUND_GRADIENTS[bannerSettings.background]}
        opacity-90
      `} />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative h-full flex items-center p-3 gap-3">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <div className={`
            ${size === 'large' ? 'w-24 h-24' : size === 'medium' ? 'w-20 h-20' : 'w-14 h-14'}
            rounded-lg bg-gradient-to-br from-brand-400 to-brand-600
            flex items-center justify-center shadow-lg
            border-2 border-white/20
          `}>
            <span className={`text-white font-bold ${size === 'large' ? 'text-3xl' : size === 'medium' ? 'text-2xl' : 'text-lg'}`}>
              {userData.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>

        {/* Main Info Section */}
        <div className="flex-1 min-w-0">
          {/* Username and Role */}
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href={`/profile/${userData.id}`}
              className="font-bold text-white hover:text-brand-400 transition-colors truncate"
              style={{ fontSize: size === 'large' ? '1.25rem' : size === 'medium' ? '1rem' : '0.875rem' }}
            >
              {userData.name || 'Agent'}
            </Link>
            <div className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-gradient-to-r ${roleConfig.color}
              text-white text-xs font-medium
            `}>
              <span>{roleConfig.icon}</span>
              <span>{roleConfig.label}</span>
            </div>
          </div>

          {/* Team Name */}
          {userData.teamName && (
            <Link 
              href={`/team/${userData.teamId}`}
              className="text-white/70 hover:text-white transition-colors block truncate mb-1"
              style={{ fontSize: size === 'large' ? '0.875rem' : '0.75rem' }}
            >
              {userData.teamName}
            </Link>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-white/80">
            {/* Season Rank */}
            <div className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded
              bg-gradient-to-r ${seasonRank.color}
            `}>
              <span className="font-medium">
                {seasonRank.label} {seasonRank.tier}
              </span>
              <span className="text-xs opacity-80">M{currentMonth}</span>
            </div>

            {/* Level */}
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="font-medium">Lvl {userData.level || 1}</span>
            </div>

            {/* Streak */}
            {userData.streak > 0 && (
              <div className="flex items-center gap-1">
                <span>🔥</span>
                <span className="font-medium">{userData.streak}d</span>
              </div>
            )}
          </div>
        </div>

        {/* Badges Section */}
        {showcaseBadges.length > 0 && size !== 'small' && (
          <div className="flex items-center gap-2">
            {showcaseBadges.map((badgeKey) => {
              const badge = ACHIEVEMENT_BADGES[badgeKey]
              if (!badge) return null
              return (
                <div
                  key={badgeKey}
                  className={`
                    ${size === 'large' ? 'w-10 h-10' : 'w-8 h-8'}
                    rounded-lg ${badge.color} flex items-center justify-center
                    shadow-lg border border-white/20
                    hover:scale-110 transition-transform cursor-pointer
                  `}
                  title={badge.label}
                >
                  <span className={size === 'large' ? 'text-xl' : 'text-lg'}>
                    {badge.icon}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Action Buttons */}
        {context !== 'compact' && (
          <div className="flex items-center gap-2">
            {getActionButtons().map((button, index) => (
              <button
                key={index}
                onClick={() => handleAction(button.action)}
                className={`
                  px-3 py-1.5 rounded-lg font-medium transition-all
                  flex items-center gap-1 whitespace-nowrap
                  ${button.className}
                  ${size === 'small' ? 'text-xs' : 'text-sm'}
                `}
              >
                <span>{button.icon}</span>
                {size !== 'small' && <span>{button.label}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for performance
  return (
    prevProps.userData?.id === nextProps.userData?.id &&
    prevProps.userData?.level === nextProps.userData?.level &&
    prevProps.userData?.monthPoints === nextProps.userData?.monthPoints &&
    prevProps.userData?.streak === nextProps.userData?.streak &&
    prevProps.context === nextProps.context &&
    prevProps.size === nextProps.size
  )
})

UserBanner.displayName = 'UserBanner'

export default UserBanner