'use client'

// Skeleton component for loading states
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-surface-200 to-surface-100 rounded-lg ${className}`}
      {...props}
    />
  )
}

// Text skeleton with multiple lines
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4" 
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

// Card skeleton
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass radius-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

// Table row skeleton
export function SkeletonTableRow({ columns = 4 }) {
  return (
    <tr className="border-b border-ink-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Stats card skeleton
export function SkeletonStats() {
  return (
    <div className="glass radius-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

// List item skeleton
export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 glass radius-lg">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

// Dashboard metric skeleton
export function SkeletonMetric() {
  return (
    <div className="glass radius-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-8 w-24 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

// Team member skeleton
export function SkeletonTeamMember() {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

// Notification skeleton
export function SkeletonNotification() {
  return (
    <div className="p-4 hover:bg-gray-800 transition border-b border-gray-700">
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      </div>
    </div>
  )
}