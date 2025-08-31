'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Shield, Info, X } from 'lucide-react'

export default function SecurityNotification({ type = 'info', message, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (type === 'success') {
      // Auto-dismiss success messages after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [type])

  const handleDismiss = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onDismiss) onDismiss()
    }, 300)
  }

  if (!isVisible) return null

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-900',
          subtext: 'text-green-700',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          iconBg: 'bg-green-100'
        }
      case 'security':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-900',
          subtext: 'text-blue-700',
          icon: <Shield className="w-5 h-5 text-blue-500" />,
          iconBg: 'bg-blue-100'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-400',
          text: 'text-gray-900',
          subtext: 'text-gray-700',
          icon: <Info className="w-5 h-5 text-gray-400" />,
          iconBg: 'bg-gray-100'
        }
    }
  }

  const styles = getStyles()

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 max-w-md
        ${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-in-out
        ${isAnimating ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="flex items-start">
        <div className={`${styles.iconBg} rounded-full p-2 mr-3 flex-shrink-0`}>
          {styles.icon}
        </div>
        
        <div className="flex-1">
          {type === 'success' && (
            <p className={`${styles.text} font-semibold mb-1`}>
              Security Update Successful!
            </p>
          )}
          {type === 'security' && (
            <p className={`${styles.text} font-semibold mb-1`}>
              Enhanced Security Active
            </p>
          )}
          
          <p className={`${styles.subtext} text-sm`}>
            {message}
          </p>
          
          {type === 'security' && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center text-xs text-blue-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                12+ character passwords required
              </div>
              <div className="flex items-center text-xs text-blue-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Session timeout after 30 minutes
              </div>
              <div className="flex items-center text-xs text-blue-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Rate limiting on login attempts
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className={`ml-3 ${styles.text} hover:opacity-70 transition-opacity`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {type === 'success' && (
        <div className="mt-3 bg-green-100 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-green-500 animate-countdown"
            style={{
              animation: 'countdown 5s linear forwards'
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Usage Hook
export function useSecurityNotification() {
  const [notification, setNotification] = useState(null)

  const showNotification = (type, message) => {
    setNotification({ type, message })
  }

  const dismissNotification = () => {
    setNotification(null)
  }

  return {
    notification,
    showNotification,
    dismissNotification
  }
}