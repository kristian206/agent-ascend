'use client'
import { useState } from 'react'
import { Award, Star, Trophy, Target, Zap, Shield, Heart } from 'lucide-react'

const BADGE_ICONS = {
  hot_streak: { icon: '🔥', name: 'Hot Streak', color: 'text-orange-500' },
  week_warrior: { icon: '⚡', name: 'Week Warrior', color: 'text-yellow-500' },
  streak_hero: { icon: '🦸', name: 'Streak Hero', color: 'text-blue-500' },
  streak_legend: { icon: '👑', name: 'Streak Legend', color: 'text-purple-500' },
  closer: { icon: '💰', name: 'Closer', color: 'text-green-500' },
  sales_champion: { icon: '🏆', name: 'Sales Champion', color: 'text-yellow-600' },
  consistency_champ: { icon: '⭐', name: 'Consistency Champion', color: 'text-cyan-500' },
  sales_streak_7: { icon: '🎯', name: '7-Day Sales Streak', color: 'text-red-500' },
  sales_streak_30: { icon: '💎', name: '30-Day Sales Streak', color: 'text-indigo-500' },
  participation_week: { icon: '✨', name: 'Week Participant', color: 'text-blue-400' },
  participation_month: { icon: '🌟', name: 'Month Participant', color: 'text-purple-400' },
  first_sale: { icon: '🎉', name: 'First Sale', color: 'text-green-400' },
  team_player: { icon: '🤝', name: 'Team Player', color: 'text-blue-500' },
  motivator: { icon: '📣', name: 'Motivator', color: 'text-pink-500' },
  early_bird: { icon: '🌅', name: 'Early Bird', color: 'text-yellow-400' },
  night_owl: { icon: '🦉', name: 'Night Owl', color: 'text-indigo-600' }
}

export default function BadgeDisplay({ 
  badges = [], 
  size = 'medium', // small, medium, large
  showTooltip = true,
  className = '' 
}) {
  const [hoveredBadge, setHoveredBadge] = useState(null)
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-xs'
      case 'large':
        return 'w-12 h-12 text-lg'
      default:
        return 'w-10 h-10 text-sm'
    }
  }
  
  // Take only first 3 badges
  const displayBadges = badges.slice(0, 3)
  
  if (displayBadges.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {[1, 2, 3].map(i => (
          <div 
            key={i}
            className={`${getSizeClasses()} rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center`}
          >
            <span className="text-gray-500">?</span>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {displayBadges.map((badgeId, index) => {
        const badge = BADGE_ICONS[badgeId] || { 
          icon: '🏅', 
          name: badgeId, 
          color: 'text-gray-400' 
        }
        
        return (
          <div
            key={badgeId}
            className="relative"
            onMouseEnter={() => setHoveredBadge(badgeId)}
            onMouseLeave={() => setHoveredBadge(null)}
          >
            <div 
              className={`${getSizeClasses()} rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center transform hover:scale-110 transition-all cursor-pointer ${badge.color}`}
            >
              <span className="text-2xl" style={{ fontSize: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px' }}>
                {badge.icon}
              </span>
            </div>
            
            {/* Tooltip */}
            {showTooltip && hoveredBadge === badgeId && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-gray-700">
                  <div className="text-sm font-semibold">{badge.name}</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
      
      {/* Show +X if more than 3 badges */}
      {badges.length > 3 && (
        <div className={`${getSizeClasses()} rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center text-gray-400 font-semibold`}>
          +{badges.length - 3}
        </div>
      )}
    </div>
  )
}