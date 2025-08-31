'use client'
import { RANKS } from '@/src/models/seasonModels'

export default function RankBadge({ 
  rank = 'bronze', 
  division = 5, 
  size = 'medium',
  showDivision = true,
  animated = false,
  minimal = false 
}) {
  const rankData = RANKS[rank] || RANKS.bronze
  
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  }
  
  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  }
  
  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl',
    xlarge: 'text-5xl'
  }
  
  if (minimal) {
    return (
      <div className="inline-flex items-center gap-1">
        <span className={`${iconSizes[size]}`}>{rankData.icon}</span>
        <div>
          <span className={`font-bold ${textSizes[size]}`} style={{ color: rankData.color }}>
            {rankData.name}
          </span>
          {showDivision && (
            <span className={`ml-1 ${textSizes[size]} text-gray-400`}>
              {division}
            </span>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`relative ${sizeClasses[size]} ${animated ? 'animate-pulse' : ''}`}>
      {/* Outer glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-50"
        style={{ background: rankData.gradient }}
      />
      
      {/* Main badge container */}
      <div 
        className="relative w-full h-full rounded-full flex flex-col items-center justify-center border-2"
        style={{ 
          background: rankData.gradient,
          borderColor: rankData.color,
          boxShadow: `0 0 20px ${rankData.color}40`
        }}
      >
        {/* Rank Icon */}
        <span className={`${iconSizes[size]} drop-shadow-lg`}>
          {rankData.icon}
        </span>
        
        {/* Rank Name */}
        <span className={`font-bold text-white ${textSizes[size]} drop-shadow-md mt-1`}>
          {rankData.name}
        </span>
        
        {/* Division pips */}
        {showDivision && (
          <div className="flex gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < (6 - division)
                    ? 'bg-white shadow-lg'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Decorative corners for higher ranks */}
      {['diamond', 'master', 'grandmaster'].includes(rank) && (
        <>
          <div 
            className="absolute -top-2 -left-2 w-4 h-4 rotate-45"
            style={{ background: rankData.color }}
          />
          <div 
            className="absolute -top-2 -right-2 w-4 h-4 rotate-45"
            style={{ background: rankData.color }}
          />
          <div 
            className="absolute -bottom-2 -left-2 w-4 h-4 rotate-45"
            style={{ background: rankData.color }}
          />
          <div 
            className="absolute -bottom-2 -right-2 w-4 h-4 rotate-45"
            style={{ background: rankData.color }}
          />
        </>
      )}
    </div>
  )
}

// Rank Progress Bar Component
export function RankProgressBar({ currentSR, currentRank, nextRankSR, progress }) {
  const rankData = RANKS[currentRank] || RANKS.bronze
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">Current SR</span>
        <span className="text-lg font-bold text-white">{currentSR}</span>
      </div>
      
      <div className="relative">
        {/* Background bar */}
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div
            className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
            style={{ 
              width: `${Math.min(100, progress)}%`,
              background: rankData.gradient
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
        
        {/* Division markers */}
        <div className="absolute inset-0 flex">
          {[20, 40, 60, 80].map((percent) => (
            <div
              key={percent}
              className="absolute top-0 w-0.5 h-3 bg-gray-600"
              style={{ left: `${percent}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          {Math.round(progress)}% to next division
        </span>
        <span className="text-xs text-gray-500">
          {nextRankSR - currentSR} SR needed
        </span>
      </div>
    </div>
  )
}

// Rank Comparison Component
export function RankComparison({ previousRank, currentRank, previousDivision, currentDivision }) {
  const prevData = RANKS[previousRank] || RANKS.bronze
  const currData = RANKS[currentRank] || RANKS.bronze
  
  const improved = currData.tier > prevData.tier || 
    (currData.tier === prevData.tier && currentDivision < previousDivision)
  
  return (
    <div className="flex items-center gap-3">
      <RankBadge rank={previousRank} division={previousDivision} size="small" />
      
      <div className="flex items-center gap-1">
        {improved ? (
          <>
            <span className="text-green-400">▲</span>
            <span className="text-xs text-green-400">Promoted</span>
          </>
        ) : (
          <>
            <span className="text-gray-400">→</span>
            <span className="text-xs text-gray-400">Placed</span>
          </>
        )}
      </div>
      
      <RankBadge rank={currentRank} division={currentDivision} size="small" animated={improved} />
    </div>
  )
}