'use client'
import { useEffect, useState } from 'react'

export default function Toast({ notification, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10)
    
    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose()
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 10)
  }

  if (!notification) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-white/10 p-4 min-w-[320px] max-w-md">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{notification.icon}</div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm mb-1">
              {notification.title}
            </h3>
            <p className="text-gray-300 text-xs">
              {notification.message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-shrink"
            style={{
              animation: `shrink ${duration}ms linear`
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}