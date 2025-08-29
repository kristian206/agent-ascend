'use client'
import { useState } from 'react'

export default function DashboardCard({
  title,
  metric,
  metricLabel,
  trend,
  trendDirection,
  primaryAction,
  details,
  isCondensed = false,
  className = '',
  children
}) {
  const [showDetails, setShowDetails] = useState(false)

  // Density-aware spacing
  const padding = isCondensed ? 'p-3' : 'p-4'
  const gap = isCondensed ? 'gap-2' : 'gap-3'
  const titleSize = isCondensed ? 'type-list-body' : 'type-list-heading'
  const metricSize = isCondensed ? 'type-dashboard-metric text-2xl' : 'type-dashboard-metric'
  const labelSize = isCondensed ? 'type-detail-caption text-xs' : 'type-list-label'

  return (
    <div className={`glass radius-lg ${padding} elev-1 hover:elev-2 transition-all ${className}`}>
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`${titleSize} text-primary font-medium`}>{title}</h3>
        </div>
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 type-list-body font-medium transition-colors"
          >
            {primaryAction.label}
          </button>
        )}
      </div>

      {/* Metric Section */}
      {metric !== undefined && (
        <div className={`${gap} mb-3`}>
          <div className="flex items-baseline gap-3">
            <span className={`${metricSize} text-primary font-semibold`}>
              {metric}
            </span>
            {trend && (
              <span className={`
                ${labelSize} font-medium
                ${trendDirection === 'up' ? 'text-success' : 
                  trendDirection === 'down' ? 'text-error' : 'text-ink-400'}
              `}>
                {trendDirection === 'up' && '↑'}
                {trendDirection === 'down' && '↓'}
                {trend}
              </span>
            )}
          </div>
          {metricLabel && (
            <p className={`${labelSize} text-ink-400 mt-1`}>
              {metricLabel}
            </p>
          )}
        </div>
      )}

      {/* Custom Content */}
      {children}

      {/* Details Section */}
      {details && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-brand-500 hover:text-brand-600 type-list-body font-medium transition-colors mt-3"
          >
            <span>Details</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-ink-100 animate-fade-in">
              {details}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Specialized card for lists
export function ListCard({
  title,
  items,
  emptyMessage,
  primaryAction,
  isCondensed = false,
  maxItems = 5
}) {
  const [showAll, setShowAll] = useState(false)
  const displayItems = showAll ? items : items?.slice(0, maxItems)
  
  const padding = isCondensed ? 'p-3' : 'p-4'
  const titleSize = isCondensed ? 'type-list-body' : 'type-list-heading'
  const itemSpacing = isCondensed ? 'py-2' : 'py-3'

  return (
    <div className={`glass radius-lg ${padding} elev-1 hover:elev-2 transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`${titleSize} text-primary font-medium`}>{title}</h3>
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 type-list-body font-medium transition-colors"
          >
            {primaryAction.label}
          </button>
        )}
      </div>

      {/* List Items */}
      {items && items.length > 0 ? (
        <>
          <div className="space-y-1">
            {displayItems.map((item, index) => (
              <div 
                key={item.id || index}
                className={`${itemSpacing} border-b border-ink-50 last:border-0 flex items-center justify-between group cursor-pointer hover:bg-surface-100 -mx-2 px-2 rounded transition-colors`}
                onClick={item.onClick}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <p className="type-list-body text-primary font-medium truncate">
                      {item.title}
                    </p>
                    {item.badge && (
                      <span className={`
                        px-2 py-0.5 rounded-full type-detail-caption font-medium
                        ${item.badge.type === 'hot' ? 'bg-error/10 text-error' :
                          item.badge.type === 'new' ? 'bg-brand-50 text-brand-600' :
                          'bg-ink-100 text-ink-600'}
                      `}>
                        {item.badge.label}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="type-detail-caption text-ink-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.meta && (
                    <span className="type-detail-caption text-ink-400">
                      {item.meta}
                    </span>
                  )}
                  <svg className="w-4 h-4 text-ink-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          {items.length > maxItems && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 text-brand-500 hover:text-brand-600 type-list-body font-medium"
            >
              {showAll ? `Show less` : `Show all (${items.length})`}
            </button>
          )}
        </>
      ) : (
        <p className="type-list-body text-ink-400 py-4 text-center">
          {emptyMessage || 'No items'}
        </p>
      )}
    </div>
  )
}