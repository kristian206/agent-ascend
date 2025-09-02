'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function AvatarFrame({ 
  imageUrl = '/images/default-avatar.png',
  frameType = 'basic',
  size = 'medium', // small: 40px, medium: 60px, large: 80px
  className = ''
}) {
  const [imageError, setImageError] = useState(false)
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10'
      case 'large':
        return 'w-20 h-20'
      default:
        return 'w-15 h-15'
    }
  }
  
  const getFrameClasses = () => {
    const baseClasses = 'relative rounded-full overflow-hidden'
    
    switch (frameType) {
      case 'silver':
        return `${baseClasses} ring-2 ring-gray-300 ring-offset-2 ring-offset-gray-900`
      case 'gold':
        return `${baseClasses} ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900`
      case 'diamond':
        return `${baseClasses} ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900 animate-pulse`
      case 'fire':
        return `${baseClasses} ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900`
      case 'neon':
        return `${baseClasses} ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900 shadow-lg shadow-purple-500/50`
      case 'animated':
        return `${baseClasses} ring-2 ring-gradient-to-r from-blue-400 to-purple-600 ring-offset-2 ring-offset-gray-900`
      default:
        return `${baseClasses} ring-1 ring-gray-600 ring-offset-1 ring-offset-gray-900`
    }
  }
  
  const handleImageError = () => {
    setImageError(true)
  }
  
  return (
    <div className={`${getFrameClasses()} ${getSizeClasses()} ${className}`}>
      {imageError || !imageUrl ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {size === 'small' ? '' : '👤'}
          </span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      )}
      
      {/* Special frame effects */}
      {frameType === 'fire' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent animate-pulse" />
        </div>
      )}
      
      {frameType === 'animated' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20 animate-gradient" />
        </div>
      )}
    </div>
  )
}