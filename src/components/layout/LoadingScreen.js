'use client'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-3xl font-black text-black">A</span>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-2">Agency Max+</h2>
        <p className="text-gray-300 animate-pulse">Loading your dashboard...</p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}