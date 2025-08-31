'use client'

export default function Stats({ stats, columns = 4 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  }

  return (
    <div className={`grid ${gridCols[columns] || gridCols[4]} gap-4`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}

export function StatCard({ 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  color = 'primary',
  subtitle,
  progress,
  maxValue,
}) {
  const colors = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success to-success-dark',
    warning: 'from-warning to-warning-dark',
    error: 'from-error to-error-dark',
    purple: 'from-purple-400 to-purple-600',
    pink: 'from-pink-400 to-pink-600',
  }

  const changeColors = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-text-tertiary',
  }

  const progressPercentage = progress !== undefined && maxValue 
    ? Math.min((progress / maxValue) * 100, 100) 
    : null

  return (
    <div className="glass rounded-2xl p-6 hover:glass-strong transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs text-text-gray-400 uppercase tracking-wider font-medium">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className={`text-2xl font-bold bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
              {value}
            </p>
            {change && (
              <span className={`text-xs font-medium ${changeColors[changeType]}`}>
                {changeType === 'positive' && '↑'}
                {changeType === 'negative' && '↓'}
                {change}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-text-gray-300 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`
            w-10 h-10 rounded-xl 
            bg-gradient-to-br ${colors[color]}
            flex items-center justify-center
            text-white text-lg
            shadow-lg group-hover:scale-110 transition-transform
          `}>
            {icon}
          </div>
        )}
      </div>
      
      {progressPercentage !== null && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-primary-100/30 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors[color]} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function StatGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  )
}