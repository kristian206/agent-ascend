'use client'
import { useState } from 'react'

/**
 * DashboardCard component provides a flexible container for displaying metrics,
 * content, and actions in a glass morphism design.
 * 
 * Features:
 * - Glass morphism styling with hover effects
 * - Density-aware spacing (comfortable/condensed modes)
 * - Expandable details section
 * - Primary action button
 * - Trend indicators with directional colors
 * - Custom content area for complex layouts
 * 
 * @param {Object} props - Component properties
 * @param {string} props.title - Card title/heading text
 * @param {string|number} [props.metric] - Primary metric value to display
 * @param {string} [props.metricLabel] - Label/description for the metric
 * @param {string} [props.trend] - Trend indicator text (e.g., "+12%", "-5%")
 * @param {string} [props.trendDirection] - Trend direction: 'up', 'down', or neutral
 * @param {Object} [props.primaryAction] - Primary action button configuration
 * @param {string} props.primaryAction.label - Button text
 * @param {Function} props.primaryAction.onClick - Button click handler
 * @param {React.ReactNode} [props.details] - Expandable details content
 * @param {boolean} [props.isCondensed=false] - Use condensed density mode
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Custom content for the card body
 * 
 * @returns {JSX.Element} Rendered DashboardCard component
 * 
 * @example
 * // Basic metric card
 * <DashboardCard 
 *   title="Sales This Month"
 *   metric="42"
 *   metricLabel="Policies sold"
 *   trend="+12%"
 *   trendDirection="up"
 * />
 * 
 * @example
 * // Card with action and details
 * <DashboardCard 
 *   title="Recent Activity"
 *   primaryAction={{
 *     label: 'View All',
 *     onClick: () => navigate('/activities')
 *   }}
 *   details={<ActivityDetails />}
 * >
 *   <ActivitySummary />
 * </DashboardCard>
 * 
 * @example
 * // Condensed card for compact layouts
 * <DashboardCard 
 *   title="Quick Stats"
 *   metric="128"
 *   isCondensed={true}
 *   className="col-span-1"
 * />
 */
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

/**
 * ListCard component provides a specialized card layout for displaying
 * lists of items with pagination and interactive elements.
 * 
 * Features:
 * - Automatic pagination with "Show all" expansion
 * - Interactive list items with hover states
 * - Badge support for item status indicators
 * - Empty state handling
 * - Density-aware spacing
 * - Keyboard navigation support
 * 
 * @param {Object} props - Component properties
 * @param {string} props.title - Card title
 * @param {Array} props.items - Array of list items to display
 * @param {string} props.items[].id - Unique identifier for the item
 * @param {string} props.items[].title - Primary text for the item
 * @param {string} [props.items[].subtitle] - Secondary text for the item
 * @param {string} [props.items[].icon] - Icon/emoji for the item
 * @param {Object} [props.items[].badge] - Badge configuration
 * @param {string} props.items[].badge.type - Badge type: 'hot', 'new', 'default'
 * @param {string} props.items[].badge.label - Badge text
 * @param {string} [props.items[].meta] - Metadata text (e.g., timestamp)
 * @param {Function} [props.items[].onClick] - Click handler for the item
 * @param {string} [props.emptyMessage] - Message to show when list is empty
 * @param {Object} [props.primaryAction] - Primary action button configuration
 * @param {string} props.primaryAction.label - Button text
 * @param {Function} props.primaryAction.onClick - Button click handler
 * @param {boolean} [props.isCondensed=false] - Use condensed density mode
 * @param {number} [props.maxItems=5] - Maximum items to show initially
 * 
 * @returns {JSX.Element} Rendered ListCard component
 * 
 * @example
 * // Basic list card
 * <ListCard 
 *   title="Recent Activities"
 *   items={activities}
 *   emptyMessage="No recent activity"
 *   maxItems={3}
 * />
 * 
 * @example
 * // List with badges and actions
 * <ListCard 
 *   title="Hot Leads"
 *   items={[
 *     {
 *       id: '1',
 *       title: 'John Doe - Auto Quote',
 *       subtitle: 'Interested in comprehensive coverage',
 *       badge: { type: 'hot', label: 'Hot' },
 *       meta: '2 hours ago',
 *       onClick: () => openLead('1')
 *     }
 *   ]}
 *   primaryAction={{
 *     label: 'View All Leads',
 *     onClick: () => navigate('/leads')
 *   }}
 * />
 */
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
                className={`${itemSpacing} border-b border-ink-50 last:border-0 flex items-center justify-between group cursor-pointer hover:bg-gray-800 -mx-2 px-2 rounded transition-colors`}
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