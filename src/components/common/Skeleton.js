'use client'

export function SkeletonStats() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-gray-700 rounded w-1/2"></div>
    </div>
  )
}

export function SkeletonListItem() {
  return (
    <div className="animate-pulse p-4">
      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  )
}

export function SkeletonTeamMember() {
  return (
    <div className="animate-pulse p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-24"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  )
}

export default { SkeletonStats, SkeletonListItem, SkeletonCard, SkeletonTeamMember }