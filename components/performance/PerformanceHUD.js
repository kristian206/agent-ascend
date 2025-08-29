'use client'
import { useState, useEffect } from 'react'

// Coaching Rules Engine
const coachingRules = [
  {
    id: 'close-rate-drop',
    condition: (metrics) => metrics.closeRate?.trend < -5,
    message: 'Your close rate dropped {value}% WoW—try calling warm leads first.',
    priority: 'high',
    type: 'performance'
  },
  {
    id: 'calls-below-target',
    condition: (metrics) => metrics.dailyCalls?.current < metrics.dailyCalls?.target * 0.8,
    message: 'You\'re at {current} calls today, {remaining} more to hit your target. Dial time!',
    priority: 'medium',
    type: 'activity'
  },
  {
    id: 'conversion-improvement',
    condition: (metrics) => metrics.conversionRate?.trend > 10,
    message: 'Your conversion rate is up {value}%! Keep doing what you\'re doing. 🔥',
    priority: 'low',
    type: 'success'
  },
  {
    id: 'hot-leads-waiting',
    condition: (metrics) => metrics.hotLeads?.count > 3,
    message: 'You have {count} hot leads waiting—prioritize these for quick wins.',
    priority: 'high',
    type: 'opportunity'
  },
  {
    id: 'follow-up-overdue',
    condition: (metrics) => metrics.overdueFollowUps?.count > 0,
    message: '{count} follow-ups are overdue. Clear these to maintain momentum.',
    priority: 'high',
    type: 'task'
  },
  {
    id: 'streak-milestone',
    condition: (metrics) => metrics.streak?.days % 10 === 0 && metrics.streak?.days > 0,
    message: '{days} day streak! You\'re on fire—keep the momentum going! 🎯',
    priority: 'low',
    type: 'celebration'
  },
  {
    id: 'quota-behind',
    condition: (metrics) => {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      const dayOfMonth = new Date().getDate()
      const expectedProgress = (dayOfMonth / daysInMonth) * 100
      return metrics.monthlyQuota?.progress < expectedProgress - 10
    },
    message: 'You\'re behind pace for monthly quota. Focus on high-value opportunities.',
    priority: 'medium',
    type: 'warning'
  },
  {
    id: 'best-call-time',
    condition: (metrics) => {
      const hour = new Date().getHours()
      return hour >= 14 && hour <= 16 && metrics.callsToday?.count < 5
    },
    message: '2-4 PM is your best call window. Make some dials now for better connects.',
    priority: 'medium',
    type: 'tip'
  },
  {
    id: 'weekly-goal-close',
    condition: (metrics) => {
      const dayOfWeek = new Date().getDay()
      return dayOfWeek >= 4 && metrics.weeklyGoal?.progress < 80
    },
    message: 'Push to close {remaining}% more to hit your weekly goal!',
    priority: 'high',
    type: 'push'
  },
  {
    id: 'email-response-rate',
    condition: (metrics) => metrics.emailResponseRate?.value < 20,
    message: 'Email response rate is low. Try more personalized subject lines.',
    priority: 'low',
    type: 'tip'
  }
]

// Evaluate coaching rules and return applicable prompts
function evaluateCoachingRules(metrics) {
  const activePrompts = []
  
  for (const rule of coachingRules) {
    if (rule.condition(metrics)) {
      let message = rule.message
      
      // Replace placeholders with actual values
      Object.keys(metrics).forEach(key => {
        if (metrics[key]) {
          Object.keys(metrics[key]).forEach(subKey => {
            const placeholder = `{${subKey}}`
            if (message.includes(placeholder)) {
              message = message.replace(placeholder, Math.abs(metrics[key][subKey]))
            }
          })
          const keyPlaceholder = `{${key}}`
          if (message.includes(keyPlaceholder)) {
            message = message.replace(keyPlaceholder, metrics[key].value || metrics[key].count || metrics[key])
          }
        }
      })
      
      activePrompts.push({
        ...rule,
        message
      })
    }
  }
  
  // Sort by priority and return top prompts
  return activePrompts
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, 3) // Show max 3 coaching prompts
}

// Progress Bar Component
function MetricProgressBar({ label, current, target, unit = '', color = 'brand', showTrend = true, trend = 0 }) {
  const percentage = Math.min(Math.round((current / target) * 100), 100)
  
  const getColorClasses = () => {
    const colors = {
      brand: 'from-brand-400 to-brand-600',
      success: 'from-success-400 to-success-600',
      warning: 'from-warning-400 to-warning-600',
      error: 'from-error-400 to-error-600',
      purple: 'from-purple-400 to-purple-600'
    }
    return colors[color] || colors.brand
  }
  
  const getTrendIcon = () => {
    if (trend > 0) {
      return (
        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    } else if (trend < 0) {
      return (
        <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    }
    return null
  }
  
  return (
    <div className="metric-progress">
      <div className="flex items-center justify-between mb-2">
        <span className="type-list-label text-ink-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className="type-list-body text-ink-700 font-medium">
            {current.toLocaleString()}{unit} / {target.toLocaleString()}{unit}
          </span>
          {showTrend && trend !== 0 && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`type-detail-caption ${trend > 0 ? 'text-success' : 'text-error'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="relative h-8 bg-surface-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColorClasses()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`type-list-body font-medium ${percentage > 50 ? 'text-white' : 'text-ink-700'}`}>
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  )
}

// Trend Indicator Component
function TrendIndicator({ label, value, change7d, change30d, format = 'number' }) {
  const formatValue = (val) => {
    switch(format) {
      case 'currency':
        return `$${val.toLocaleString()}`
      case 'percentage':
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }
  
  const getTrendColor = (change) => {
    if (change > 0) return 'text-success'
    if (change < 0) return 'text-error'
    return 'text-ink-500'
  }
  
  const getTrendIcon = (change) => {
    if (change > 0) {
      return '↑'
    } else if (change < 0) {
      return '↓'
    }
    return '→'
  }
  
  return (
    <div className="glass rounded-lg p-4">
      <p className="type-list-label text-ink-500 mb-1">{label}</p>
      <p className="type-dashboard-metric text-primary mb-3">{formatValue(value)}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="type-detail-caption text-ink-400">7-day</p>
          <p className={`type-list-body font-medium ${getTrendColor(change7d)}`}>
            <span className="mr-1">{getTrendIcon(change7d)}</span>
            {Math.abs(change7d)}%
          </p>
        </div>
        <div>
          <p className="type-detail-caption text-ink-400">30-day</p>
          <p className={`type-list-body font-medium ${getTrendColor(change30d)}`}>
            <span className="mr-1">{getTrendIcon(change30d)}</span>
            {Math.abs(change30d)}%
          </p>
        </div>
      </div>
    </div>
  )
}

// Coaching Prompt Component
function CoachingPrompt({ prompt, onDismiss }) {
  const getIcon = () => {
    const icons = {
      performance: '📊',
      activity: '📞',
      success: '✨',
      opportunity: '🔥',
      task: '📋',
      celebration: '🎉',
      warning: '⚠️',
      tip: '💡',
      push: '🚀'
    }
    return icons[prompt.type] || '📌'
  }
  
  const getBgColor = () => {
    const colors = {
      high: 'bg-error/10 border-error/20',
      medium: 'bg-warning/10 border-warning/20',
      low: 'bg-brand-50 border-brand-200'
    }
    return colors[prompt.priority] || 'bg-surface-100 border-ink-200'
  }
  
  return (
    <div className={`p-3 rounded-lg border ${getBgColor()} flex items-start gap-3 animate-slide-in`}>
      <span className="text-xl flex-shrink-0">{getIcon()}</span>
      <p className="type-list-body text-ink-700 flex-1">{prompt.message}</p>
      {onDismiss && (
        <button
          onClick={() => onDismiss(prompt.id)}
          className="text-ink-400 hover:text-ink-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Main Performance HUD Component
export default function PerformanceHUD({ 
  userId, 
  view = 'personal', // 'personal' or 'team'
  compact = false,
  showCoaching = true,
  className = '' 
}) {
  // Sample metrics data - in production this would come from Firebase/API
  const [metrics, setMetrics] = useState({
    // Progress metrics
    monthlyQuota: { current: 87500, target: 100000, trend: 12 },
    weeklyGoal: { current: 18500, target: 25000, trend: -3, progress: 74 },
    dailyCalls: { current: 42, target: 50, trend: 8 },
    
    // Trend metrics
    closeRate: { value: 24, change7d: -5, change30d: 3, trend: -5 },
    avgDealSize: { value: 4200, change7d: 15, change30d: 8 },
    conversionRate: { value: 18, change7d: 12, change30d: 5, trend: 12 },
    responseTime: { value: 2.3, change7d: -20, change30d: -15 },
    
    // Activity metrics
    callsToday: { count: 42 },
    emailsSent: { count: 28 },
    meetingsBooked: { count: 5 },
    
    // Pipeline metrics
    hotLeads: { count: 5 },
    overdueFollowUps: { count: 2 },
    opportunitiesOpen: { count: 12 },
    
    // Gamification
    streak: { days: 20 },
    points: { today: 420, week: 2100 },
    
    // Email metrics
    emailResponseRate: { value: 18 }
  })
  
  const [dismissedPrompts, setDismissedPrompts] = useState([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  
  // Get coaching prompts
  const coachingPrompts = showCoaching 
    ? evaluateCoachingRules(metrics).filter(p => !dismissedPrompts.includes(p.id))
    : []
  
  const handleDismissPrompt = (promptId) => {
    setDismissedPrompts([...dismissedPrompts, promptId])
  }
  
  if (compact) {
    // Compact view for dashboard widget
    return (
      <div className={`performance-hud-compact glass-xl rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="type-list-heading text-primary">Performance</h3>
          <button className="type-detail-caption text-ink-500 hover:text-brand-500">
            View Details →
          </button>
        </div>
        
        {/* Mini Progress Bars */}
        <div className="space-y-3">
          <MetricProgressBar
            label="Monthly"
            current={metrics.monthlyQuota.current}
            target={metrics.monthlyQuota.target}
            unit=""
            color="brand"
            showTrend={true}
            trend={metrics.monthlyQuota.trend}
          />
          <MetricProgressBar
            label="Weekly"
            current={metrics.weeklyGoal.current}
            target={metrics.weeklyGoal.target}
            unit=""
            color="purple"
            showTrend={true}
            trend={metrics.weeklyGoal.trend}
          />
        </div>
        
        {/* Top Coaching Prompt */}
        {coachingPrompts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-ink-100">
            <CoachingPrompt prompt={coachingPrompts[0]} />
          </div>
        )}
      </div>
    )
  }
  
  // Full view
  return (
    <div className={`performance-hud ${className}`}>
      {/* Header */}
      <div className="glass-xl rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="type-dashboard-title text-primary">
              {view === 'team' ? 'Team Performance' : 'Your Performance'}
            </h2>
            <p className="type-detail-body text-secondary mt-1">
              Real-time metrics and insights
            </p>
          </div>
          
          {/* Timeframe Toggle */}
          <div className="flex items-center gap-2 glass rounded-lg p-1">
            <button
              onClick={() => setSelectedTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg type-list-body transition-all ${
                selectedTimeframe === '7d' 
                  ? 'glass-brand text-white' 
                  : 'text-ink-600 hover:bg-surface-100'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg type-list-body transition-all ${
                selectedTimeframe === '30d' 
                  ? 'glass-brand text-white' 
                  : 'text-ink-600 hover:bg-surface-100'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('mtd')}
              className={`px-3 py-1.5 rounded-lg type-list-body transition-all ${
                selectedTimeframe === 'mtd' 
                  ? 'glass-brand text-white' 
                  : 'text-ink-600 hover:bg-surface-100'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="space-y-4">
          <MetricProgressBar
            label="Monthly Quota"
            current={metrics.monthlyQuota.current}
            target={metrics.monthlyQuota.target}
            unit="$"
            color="brand"
            showTrend={true}
            trend={metrics.monthlyQuota.trend}
          />
          <MetricProgressBar
            label="Weekly Goal"
            current={metrics.weeklyGoal.current}
            target={metrics.weeklyGoal.target}
            unit="$"
            color="purple"
            showTrend={true}
            trend={metrics.weeklyGoal.trend}
          />
          <MetricProgressBar
            label="Daily Calls"
            current={metrics.dailyCalls.current}
            target={metrics.dailyCalls.target}
            unit=""
            color="success"
            showTrend={true}
            trend={metrics.dailyCalls.trend}
          />
        </div>
      </div>
      
      {/* Trend Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <TrendIndicator
          label="Close Rate"
          value={metrics.closeRate.value}
          change7d={metrics.closeRate.change7d}
          change30d={metrics.closeRate.change30d}
          format="percentage"
        />
        <TrendIndicator
          label="Avg Deal Size"
          value={metrics.avgDealSize.value}
          change7d={metrics.avgDealSize.change7d}
          change30d={metrics.avgDealSize.change30d}
          format="currency"
        />
        <TrendIndicator
          label="Conversion"
          value={metrics.conversionRate.value}
          change7d={metrics.conversionRate.change7d}
          change30d={metrics.conversionRate.change30d}
          format="percentage"
        />
        <TrendIndicator
          label="Response Time"
          value={metrics.responseTime.value}
          change7d={metrics.responseTime.change7d}
          change30d={metrics.responseTime.change30d}
          format="number"
        />
      </div>
      
      {/* Coaching Prompts */}
      {showCoaching && coachingPrompts.length > 0 && (
        <div className="space-y-3">
          <h3 className="type-list-heading text-primary mb-3">Coaching Insights</h3>
          {coachingPrompts.map(prompt => (
            <CoachingPrompt
              key={prompt.id}
              prompt={prompt}
              onDismiss={handleDismissPrompt}
            />
          ))}
        </div>
      )}
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}