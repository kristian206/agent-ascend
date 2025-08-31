'use client'
import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { calculateStreakForToday } from '@/src/utils/gamification'
import MicroCelebration from '@/src/components/common/MicroCelebration'
import { useNotification } from '@/src/components/notifications/NotificationProvider'
import { createNotification, NOTIFICATION_TYPES } from '@/src/services/notifications'

export default function DailyIntentions() {
  const { user } = useAuth()
  const { showToast } = useNotification()
  const [formData, setFormData] = useState({
    victory: '',
    focus: '',
    stuck: '',
    todaysFocus: ''  // New simple focus field
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [todayEntry, setTodayEntry] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null)
  const firstInputRef = useRef(null)
  
  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]
  const greeting = getGreeting()

  useEffect(() => {
    if (user) {
      checkExistingEntry()
      // Focus first input on mount
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [user])

  // Autosave on form change
  useEffect(() => {
    if (formData.victory || formData.focus || formData.stuck) {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
      const timeout = setTimeout(() => {
        saveDraft()
      }, 2000)
      setAutoSaveTimeout(timeout)
    }
  }, [formData])

  const checkExistingEntry = async () => {
    try {
      const docRef = doc(db, 'checkins', `${user.uid}_${todayKey}`)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists() && docSnap.data().intentions_completed) {
        setTodayEntry(docSnap.data())
      } else if (docSnap.exists()) {
        // Load draft
        const data = docSnap.data()
        setFormData({
          victory: data.victory || '',
          focus: data.focus || '',
          stuck: data.stuck || '',
          todaysFocus: data.todaysFocus || ''
        })
      }
    } catch (error) {
      console.error('Error checking entry:', error)
    }
  }

  const saveDraft = async () => {
    if (!user) return
    try {
      await setDoc(doc(db, 'checkins', `${user.uid}_${todayKey}`), {
        user_id: user.uid,
        date: todayKey,
        victory: formData.victory,
        focus: formData.focus,
        stuck: formData.stuck,
        todaysFocus: formData.todaysFocus,
        intentions_completed: false,
        updated_at: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Draft save error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const intentionsData = {
        user_id: user.uid,
        date: todayKey,
        victory: formData.victory,
        focus: formData.focus,
        stuck: formData.stuck,
        todaysFocus: formData.todaysFocus,
        intentions_completed: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }
      
      await setDoc(doc(db, 'checkins', `${user.uid}_${todayKey}`), intentionsData, { merge: true })
      
      // Calculate streak and achievements
      const result = await calculateStreakForToday(user.uid)
      
      // Log event
      console.log('intentions_submitted', { user_id: user.uid, streak: result.streak })
      
      // Check for milestones and create notifications
      if (result.newAchievements?.length > 0) {
        for (const achievement of result.newAchievements) {
          await createNotification(user.uid, NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED, {
            achievementName: achievement
          })
          showToast({
            icon: '🏆',
            title: 'Achievement Unlocked!',
            message: `You earned "${achievement}"!`
          })
        }
      }
      
      setTodayEntry(intentionsData)
      setShowCelebration(true)
      
      // Hide celebration after animation
      setTimeout(() => setShowCelebration(false), 2000)
      
    } catch (error) {
      console.error('Error saving:', error)
    }
    
    setIsSubmitting(false)
  }

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  if (todayEntry?.intentions_completed) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Intentions Set!</h2>
          <p className="text-gray-200">You&apos;re ready to tackle the day.</p>
          
          <div className="mt-6 space-y-3 text-left">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-300 mb-1">Victory</p>
              <p className="text-white">{todayEntry.victory}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-300 mb-1">Focus</p>
              <p className="text-white">{todayEntry.focus}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-300 mb-1">Working Through</p>
              <p className="text-white">{todayEntry.stuck}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      {showCelebration && <MicroCelebration />}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{greeting}! ☀️</h1>
        <p className="text-gray-300 text-sm mt-1">Let&apos;s set your intentions</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 focus-within:border-yellow-500/50 transition">
          <label className="block text-sm text-gray-200 mb-2">
            What&apos;s a victory from yesterday? 🏆
          </label>
          <textarea
            ref={firstInputRef}
            value={formData.victory}
            onChange={(e) => setFormData({...formData, victory: e.target.value})}
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none"
            rows="2"
            placeholder="I closed a deal, helped a client, finished that report..."
            required
          />
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 focus-within:border-yellow-500/50 transition">
          <label className="block text-sm text-gray-200 mb-2">
            What&apos;s your main focus today? 🎯
          </label>
          <textarea
            value={formData.focus}
            onChange={(e) => setFormData({...formData, focus: e.target.value})}
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none"
            rows="2"
            placeholder="Follow up with leads, team meeting prep, client proposals..."
            required
          />
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 focus-within:border-yellow-500/50 transition">
          <label className="block text-sm text-gray-200 mb-2">
            What are you working through? 🤔
          </label>
          <textarea
            value={formData.stuck}
            onChange={(e) => setFormData({...formData, stuck: e.target.value})}
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none"
            rows="2"
            placeholder="Difficult client situation, learning new system, time management..."
            required
          />
        </div>
        
        {/* New Simple Focus Question */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
          <label className="block text-sm text-yellow-400 mb-2">
            💬 How many conversations will you have today?
          </label>
          <input
            type="text"
            value={formData.todaysFocus}
            onChange={(e) => setFormData({...formData, todaysFocus: e.target.value})}
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg font-semibold"
            placeholder="Set a target (e.g., Talk to 10 people)"
            maxLength={50}
          />
          <p className="text-xs text-gray-400 mt-1">Optional: Set your conversation goal</p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !formData.victory || !formData.focus || !formData.stuck}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? '...' : 'Set Intentions →'}
        </button>
      </form>
      
      <p className="text-center text-gray-400 text-xs mt-4">
        Auto-saving as you type
      </p>
    </div>
  )
}