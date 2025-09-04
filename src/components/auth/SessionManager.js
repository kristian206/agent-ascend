'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/src/services/firebase'
import { signOut } from 'firebase/auth'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const WARNING_TIME = 5 * 60 * 1000 // 5 minutes before timeout

export default function SessionManager({ children }) {
  const router = useRouter()
  const timeoutRef = useRef(null)
  const warningRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  const resetTimers = () => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)

    // Update last activity
    lastActivityRef.current = Date.now()
    localStorage.setItem('lastActivity', Date.now().toString())

    // Set warning timer
    warningRef.current = setTimeout(() => {
      if (auth.currentUser) {
        const remaining = Math.ceil(WARNING_TIME / 1000 / 60)
        // Session warning logged
        
        // Show warning notification if user has permissions
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Session Expiring Soon', {
            body: `Your session will expire in ${remaining} minutes due to inactivity`,
            icon: '/images/logo/agency-max-plus-logo.svg'
          })
        }
      }
    }, SESSION_TIMEOUT - WARNING_TIME)

    // Set timeout timer
    timeoutRef.current = setTimeout(async () => {
      if (auth.currentUser) {
        // Session expired due to inactivity
        try {
          await signOut(auth)
          localStorage.setItem('sessionExpired', 'true')
          router.push('/?sessionExpired=true')
        } catch (error) {
          console.error('Error signing out:', error)
        }
      }
    }, SESSION_TIMEOUT)
  }

  useEffect(() => {
    // Activity event listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityRef.current
      
      // Only reset timers if it's been more than 1 second since last activity
      // This prevents excessive timer resets
      if (timeSinceLastActivity > 1000) {
        resetTimers()
      }
    }

    // Check for existing session on mount
    const checkExistingSession = () => {
      const lastActivity = localStorage.getItem('lastActivity')
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
          // Session has expired while away
          if (auth.currentUser) {
            signOut(auth).then(() => {
              localStorage.setItem('sessionExpired', 'true')
              router.push('/?sessionExpired=true')
            })
          }
        } else {
          // Resume session
          resetTimers()
        }
      } else {
        // New session
        resetTimers()
      }
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, check if session is still valid
        const lastActivity = localStorage.getItem('lastActivity')
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
          if (timeSinceLastActivity > SESSION_TIMEOUT && auth.currentUser) {
            signOut(auth).then(() => {
              localStorage.setItem('sessionExpired', 'true')
              router.push('/?sessionExpired=true')
            })
          } else {
            resetTimers()
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initialize
    if (auth.currentUser) {
      checkExistingSession()
    }

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        resetTimers()
      } else {
        // Clear timers when logged out
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (warningRef.current) clearTimeout(warningRef.current)
        localStorage.removeItem('lastActivity')
      }
    })

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      unsubscribe()
    }
  }, [router])

  return children
}