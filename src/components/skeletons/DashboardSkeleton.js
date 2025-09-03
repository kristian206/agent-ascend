export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-pulse">
      {/* Banners Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="h-32 bg-gray-800 rounded-xl"></div>
        <div className="h-32 bg-gray-800 rounded-xl"></div>
      </div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="h-32 bg-gray-800 rounded-xl"></div>
        <div className="h-32 bg-gray-800 rounded-xl"></div>
        <div className="h-32 bg-gray-800 rounded-xl"></div>
      </div>
      
      {/* Streaks Skeleton */}
      <div className="h-40 bg-gray-800 rounded-xl mb-8"></div>
      
      {/* Progress Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="h-64 bg-gray-800 rounded-xl"></div>
        <div className="h-64 bg-gray-800 rounded-xl"></div>
      </div>
      
      {/* Activity Skeleton */}
      <div className="h-96 bg-gray-800 rounded-xl"></div>
    </div>
  )
}