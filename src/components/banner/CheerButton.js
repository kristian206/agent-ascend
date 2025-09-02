'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { Heart, Sparkles } from 'lucide-react'

const DAILY_CHEER_LIMIT = 10

export default function CheerButton({ 
  recipientId,
  recipientName = 'user',
  cheersReceived = 0,
  size = 'medium',
  className = ''
}) {
  const { user } = useAuth()
  const [cheersGivenToday, setCheersGivenToday] = useState(0)
  const [canCheer, setCanCheer] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkCheerLimit()
    }
  }, [user, recipientId])

  const checkCheerLimit = async () => {
    if (!user || user.uid === recipientId) {
      setCanCheer(false)
      setLoading(false)
      return
    }

    try {
      const userDoc = await getDoc(doc(db, 'members', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        const banner = data.banner || {}
        
        // Check if we need to reset daily count
        const lastReset = banner.lastCheerReset?.toDate() || new Date(0)
        const now = new Date()
        const isNewDay = lastReset.toDateString() !== now.toDateString()
        
        if (isNewDay) {
          // Reset daily count
          await updateDoc(doc(db, 'members', user.uid), {
            'banner.cheersGivenToday': 0,
            'banner.lastCheerReset': serverTimestamp()
          })
          setCheersGivenToday(0)
          setCanCheer(true)
        } else {
          const given = banner.cheersGivenToday || 0
          setCheersGivenToday(given)
          setCanCheer(given < DAILY_CHEER_LIMIT)
        }
      }
    } catch (error) {
      console.error('Error checking cheer limit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheer = async () => {
    if (!canCheer || isAnimating || loading) return
    
    setIsAnimating(true)
    
    try {
      // Update giver's count
      await updateDoc(doc(db, 'members', user.uid), {
        'banner.cheersGivenToday': increment(1)
      })
      
      // Update recipient's cheers
      await updateDoc(doc(db, 'members', recipientId), {
        'banner.cheersReceived': increment(1)
      })
      
      // Create cheer record
      const cheerDoc = {
        giverId: user.uid,
        recipientId: recipientId,
        timestamp: serverTimestamp()
      }
      
      await setDoc(
        doc(db, 'cheers', `${user.uid}_${recipientId}_${Date.now()}`),
        cheerDoc
      )
      
      // Update local state
      setCheersGivenToday(prev => prev + 1)
      setCanCheer(cheersGivenToday + 1 < DAILY_CHEER_LIMIT)
      
      // Show success animation
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      
      console.log(`Cheer sent to ${recipientName}!`)
      
    } catch (error) {
      console.error('Error sending cheer:', error)
    } finally {
      setIsAnimating(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs'
      case 'large':
        return 'px-4 py-2 text-base'
      default:
        return 'px-3 py-1.5 text-sm'
    }
  }

  // Don't show button for own profile
  if (!user || user.uid === recipientId) {
    return null
  }

  const remaining = DAILY_CHEER_LIMIT - cheersGivenToday

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleCheer}
        disabled={!canCheer || loading}
        className={`
          ${getSizeClasses()}
          relative flex items-center gap-2 
          bg-gradient-to-r from-pink-500 to-purple-500 
          text-white font-semibold rounded-lg
          transform transition-all duration-200
          ${canCheer ? 'hover:scale-105 active:scale-95' : 'opacity-50 cursor-not-allowed'}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        title={canCheer ? `Send cheer to ${recipientName} (${remaining} left today)` : 'Daily cheer limit reached'}
      >
        <Heart className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} ${isAnimating ? 'animate-bounce' : ''}`} />
        {size !== 'small' && 'Cheer'}
        
        {/* Remaining count badge */}
        {canCheer && size !== 'small' && (
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {remaining}
          </span>
        )}
      </button>
      
      {/* Success animation */}
      {showSuccess && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-ping" />
          </div>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
              +1 Cheer Sent!
            </div>
          </div>
        </div>
      )}
    </div>
  )
}