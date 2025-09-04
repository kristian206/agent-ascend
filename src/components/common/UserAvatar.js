'use client'
import { useState, useEffect } from 'react'
import { parseAvatarData, generateInitialsAvatar } from '@/src/services/avatarService'

/**
 * UserAvatar component displays user profile pictures with intelligent fallbacks
 * and optional status indicators.
 * 
 * Features:
 * - Supports multiple avatar sources (DiceBear, uploads, URLs, initials)
 * - Automatic fallback to initials on image load failure
 * - Optional online/offline status indicator
 * - Optional user level badge
 * - Responsive sizing with consistent proportions
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.user - User object containing avatar and profile data
 * @param {string} props.user.avatar - Avatar URL or DiceBear identifier
 * @param {string} [props.user.name] - User's display name for initials fallback
 * @param {string} [props.user.displayName] - Alternative display name field
 * @param {number} [props.user.level] - User's level for badge display
 * @param {boolean} [props.user.isOnline] - User's online status
 * @param {string} [props.size='md'] - Avatar size: xs, sm, md, lg, xl, 2xl, 3xl
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.showStatus=false] - Show online/offline status indicator
 * @param {boolean} [props.showLevel=false] - Show user level badge
 * 
 * @returns {JSX.Element} Rendered UserAvatar component
 * 
 * @example
 * // Basic avatar
 * <UserAvatar user={currentUser} />
 * 
 * @example
 * // Avatar with status and level indicators
 * <UserAvatar 
 *   user={currentUser} 
 *   size="lg" 
 *   showStatus={true} 
 *   showLevel={true} 
 * />
 * 
 * @example
 * // Custom styling
 * <UserAvatar 
 *   user={currentUser} 
 *   className="ring-2 ring-blue-500 shadow-lg" 
 * />
 */
export default function UserAvatar({
  user,
  size = 'md',
  className = '',
  showStatus = false,
  showLevel = false,
}) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [imageError, setImageError] = useState(false)

  // Size mappings
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24',
  }

  const statusSizeMap = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
    '3xl': 'w-6 h-6',
  }

  const levelSizeMap = {
    xs: 'text-[8px] px-1',
    sm: 'text-[9px] px-1',
    md: 'text-[10px] px-1.5',
    lg: 'text-xs px-2',
    xl: 'text-sm px-2',
    '2xl': 'text-base px-2.5',
    '3xl': 'text-lg px-3',
  }

  useEffect(() => {
    // Determine avatar URL based on user data
    if (user?.avatar) {
      // If avatar is a URL (custom upload or direct URL)
      if (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) {
        setAvatarUrl(user.avatar)
      } 
      // If avatar is DiceBear data (style:seed format)
      else if (user.avatarData) {
        const parsed = parseAvatarData(user.avatarData)
        if (parsed) {
          setAvatarUrl(parsed.url)
        } else {
          // Fallback to initials
          setAvatarUrl(generateInitialsAvatar(user.name || user.displayName || 'User'))
        }
      }
      // Legacy avatar path
      else if (user.avatar.startsWith('/')) {
        setAvatarUrl(user.avatar)
      }
      else {
        // Assume it's a DiceBear URL if it contains api.dicebear.com
        setAvatarUrl(user.avatar)
      }
    } else {
      // Generate initials avatar as fallback
      setAvatarUrl(generateInitialsAvatar(user?.name || user?.displayName || 'User'))
    }
  }, [user])

  const handleImageError = () => {
    setImageError(true)
    // Fallback to initials avatar on error
    setAvatarUrl(generateInitialsAvatar(user?.name || user?.displayName || 'User'))
  }

  // Get user initials for fallback
  const getInitials = () => {
    const name = user?.name || user?.displayName || 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Determine online status
  const isOnline = user?.isOnline || false
  const statusColor = isOnline ? 'bg-green-500' : 'bg-gray-500'

  return (
    <div className={`relative inline-block ${className}`}>
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={user?.name || 'User avatar'}
          className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-gray-700`}
          onError={handleImageError}
        />
      ) : (
        // Fallback to initials
        <div
          className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ring-2 ring-gray-700`}
        >
          <span className={size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}>
            {getInitials()}
          </span>
        </div>
      )}

      {/* Online Status Indicator */}
      {showStatus && (
        <div
          className={`absolute bottom-0 right-0 ${statusSizeMap[size]} ${statusColor} rounded-full border-2 border-gray-900`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}

      {/* Level Badge */}
      {showLevel && user?.level && (
        <div
          className={`absolute -top-1 -right-1 bg-blue-500 text-white rounded-full ${levelSizeMap[size]} font-bold`}
        >
          {user.level}
        </div>
      )}
    </div>
  )
}