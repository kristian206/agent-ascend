import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { useAuth } from '@/src/components/auth/AuthProvider'

/**
 * Custom hook for real-time user data updates
 * Subscribes to Firestore document changes and provides live updates
 */
export function useRealtimeUser() {
  const { user, userData: initialData } = useAuth()
  const [realtimeData, setRealtimeData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    if (!user?.uid) {
      setRealtimeData(null)
      return
    }

    setLoading(true)
    setError(null)

    // Subscribe to user document changes
    // NOTE: 'members' collection stores USER accounts (historical naming)
    const userRef = doc(db, 'members', user.uid)
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const newData = snapshot.data()
          
          // Check if data actually changed to prevent unnecessary renders
          const hasChanged = JSON.stringify(newData) !== JSON.stringify(realtimeData)
          
          if (hasChanged) {
            setRealtimeData(newData)
            setLastUpdate(new Date())
            
            // Log significant changes for debugging
            if (realtimeData) {
              const changes = []
              if (newData.todayPoints !== realtimeData.todayPoints) {
                changes.push(`todayPoints: ${realtimeData.todayPoints} → ${newData.todayPoints}`)
              }
              if (newData.streak !== realtimeData.streak) {
                changes.push(`streak: ${realtimeData.streak} → ${newData.streak}`)
              }
              if (newData.xp !== realtimeData.xp) {
                changes.push(`xp: ${realtimeData.xp} → ${newData.xp}`)
              }
              
              if (changes.length > 0) {
                console.log('🔄 Real-time update:', changes.join(', '))
              }
            }
          }
        } else {
          setRealtimeData(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Real-time listener error:', error)
        setError(error)
        setLoading(false)
      }
    )

    // Cleanup function
    return () => {
      console.log('🔌 Unsubscribing from real-time updates')
      unsubscribe()
    }
  }, [user?.uid])

  return {
    userData: realtimeData || initialData,
    loading,
    error,
    lastUpdate,
    isRealtime: !!realtimeData
  }
}

/**
 * Hook for real-time today's checkin data
 */
export function useRealtimeCheckin() {
  const { user } = useAuth()
  const [checkinData, setCheckinData] = useState(null)
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!user?.uid) {
      setCheckinData(null)
      return
    }

    setLoading(true)

    // Subscribe to today's checkin document
    const checkinRef = doc(db, 'checkins', `${user.uid}_${today}`)
    const unsubscribe = onSnapshot(
      checkinRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setCheckinData(snapshot.data())
        } else {
          setCheckinData(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Checkin listener error:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, today])

  return { checkinData, loading }
}

/**
 * Hook for animating number changes
 */
export function useAnimatedValue(value, duration = 500) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value === displayValue) return

    setIsAnimating(true)
    const startValue = displayValue
    const endValue = value
    const startTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart)
      
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return { displayValue, isAnimating }
}