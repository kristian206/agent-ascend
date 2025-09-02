'use client'
import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { calculateStreakForToday } from '@/src/utils/gamification'
import { calculateEnhancedStreak } from '@/src/utils/streaks'
import MicroCelebration from '@/src/components/common/MicroCelebration'
import { useNotification } from '@/src/components/notifications/NotificationProvider'
import { createNotification, NOTIFICATION_TYPES } from '@/src/services/notifications'

export default function NightlyWrap() {
  const { user } = useAuth()
  const { showToast } = useNotification()
  const [morningData, setMorningData] = useState(null)
  const [formData, setFormData] = useState({
    victoryDone: false,
    focusDone: false,
    stuckDone: false,
    accomplished: '',
    conversations: '',  // New field for conversation count
    quotes: '',
    sales: '',
    tomorrow: ''
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
      loadTodayData()
    }
  }, [user])

  // Autosave on form change
  useEffect(() => {
    if (formData.accomplished || formData.tomorrow || formData.quotes || formData.sales) {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
      const timeout = setTimeout(() => {
        saveDraft()
      }, 2000)
      setAutoSaveTimeout(timeout)
    }
  }, [formData])

  const loadTodayData = async () => {
    try {
      const docRef = doc(db, 'checkins', `${user.uid}_${todayKey}`)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Check if morning intentions exist
        if (data.intentions_completed) {
          setMorningData({
            victory: data.victory,
            focus: data.focus,
            stuck: data.stuck,
            todaysFocus: data.todaysFocus
          })
        }
        
        // Check if wrap is completed
        if (data.wrap_completed) {
          setTodayEntry(data)
        } else {
          // Load draft if exists
          setFormData({
            victoryDone: data.victoryDone || false,
            focusDone: data.focusDone || false,
            stuckDone: data.stuckDone || false,
            accomplished: data.accomplished || '',
            conversations: data.conversations || '',
            quotes: data.quotes || '',
            sales: data.sales || '',
            tomorrow: data.tomorrow || ''
          })
        }
      }
      
      // Focus first input after load
      setTimeout(() => firstInputRef.current?.focus(), 100)
    } catch (error) {
      // Error loading data
    }
  }

  const saveDraft = async () => {
    if (!user || !morningData) return
    try {
      await setDoc(doc(db, 'checkins', `${user.uid}_${todayKey}`), {
        ...formData,
        wrap_completed: false,
        updated_at: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      // Draft save error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const wrapData = {
        user_id: user.uid,
        date: todayKey,
        victoryDone: formData.victoryDone,
        focusDone: formData.focusDone,
        stuckDone: formData.stuckDone,
        accomplished: formData.accomplished,
        conversations: parseInt(formData.conversations) || 0,
        quotes: parseInt(formData.quotes) || 0,
        sales: parseInt(formData.sales) || 0,
        tomorrow: formData.tomorrow,
        wrap_completed: true,
        updated_at: serverTimestamp()
      }
      
      await setDoc(doc(db, 'checkins', `${user.uid}_${todayKey}`), wrapData, { merge: true })
      
      // Award points for completing evening wrap
      const { awardDailyActivityPoints } = await import('@/src/utils/gamification')
      const pointsResult = await awardDailyActivityPoints(user.uid, 'evening_wrap')
      
      // Calculate enhanced streak (with sales requirement)
      const result = await calculateEnhancedStreak(user.uid)
      
      // Log events for analytics
      // wrap_submitted event tracked
      
      // Show points earned notification
      if (pointsResult.success && pointsResult.pointsAwarded > 0) {
        showToast({
          icon: '🌙',
          title: `+${pointsResult.pointsAwarded} Points!`,
          message: pointsResult.pointsAwarded >= 15 ? 'Daily bonus earned! Perfect day!' : 'Evening wrap complete!'
        })
      }
      
      // Show XP earned from milestones
      if (result.xpEarned > 0) {
        showToast({
          icon: '⭐',
          title: `+${result.xpEarned} XP!`,
          message: 'Streak milestone reached!',
          duration: 5000
        })
      }
      
      // Show milestone notifications
      if (result.newMilestones?.length > 0) {
        for (const milestone of result.newMilestones) {
          showToast({
            icon: milestone.type === 'full' ? '🔥' : '✨',
            title: `${milestone.days}-Day ${milestone.type === 'full' ? 'Full' : 'Participation'} Streak!`,
            message: `+${milestone.xp} XP earned!`,
            duration: 6000
          })
        }
      }
      
      // Show appropriate streak message
      if (result.hasFullStreakToday) {
        showToast({
          icon: '🔥',
          title: `Full Streak Day ${result.fullStreak}!`,
          message: 'Check-ins + Sales = Perfect day!',
          duration: 5000
        })
      } else if (result.hasParticipationToday) {
        showToast({
          icon: '✨',
          title: `Participation Streak Day ${result.participationStreak}!`,
          message: 'Great consistency! Ring a bell tomorrow for full streak!',
          duration: 5000
        })
      }
      
      if (result.fullStreak > 0) {
        // Full streak tracking
        
        // Check for streak milestones
        if ([3, 7, 14, 30, 60, 90, 100].includes(result.fullStreak)) {
          await createNotification(user.uid, NOTIFICATION_TYPES.STREAK_MILESTONE, {
            days: result.fullStreak
          })
          showToast({
            icon: '🔥',
            title: `${result.fullStreak} Day Full Streak!`,
            message: `Amazing consistency with sales! Keep it up!`
          })
        }
      }
      
      if (result.newAchievements?.length > 0) {
        for (const achievement of result.newAchievements) {
          // Achievement unlocked tracking
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
      
      // Check for level up
      const prevLevel = Math.floor((result.previousXp || 0) / 100)
      const currentLevel = Math.floor((result.xp || 0) / 100)
      if (currentLevel > prevLevel) {
        await createNotification(user.uid, NOTIFICATION_TYPES.LEVEL_UP, {
          level: currentLevel,
          xp: result.xp
        })
        showToast({
          icon: '⭐',
          title: `Level ${currentLevel} Reached!`,
          message: `You're making great progress!`
        })
      }
      
      setTodayEntry(wrapData)
      setShowCelebration(true)
      
      // Hide celebration after animation
      setTimeout(() => setShowCelebration(false), 3000)
      
    } catch (error) {
      // Error saving wrap data
    }
    
    setIsSubmitting(false)
  }

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 17) return "Wrapping up early"
    if (hour < 20) return "Evening reflection"
    return "Late night wrap"
  }

  if (todayEntry?.wrap_completed) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h2 className="text-2xl font-bold text-purple-400 mb-2">Day Complete!</h2>
          <p className="text-gray-200">Rest well, you&apos;ve earned it.</p>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-3xl font-bold text-white">{todayEntry.quotes || 0}</p>
              <p className="text-xs text-gray-300">Quotes</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-3xl font-bold text-white">{todayEntry.sales || 0}</p>
              <p className="text-xs text-gray-300">Sales</p>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-800 rounded-lg p-4 text-left">
            <p className="text-xs text-gray-300 mb-1">Tomorrow&apos;s Focus</p>
            <p className="text-white">{todayEntry.tomorrow}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!morningData) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">☀️</div>
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Morning First!</h2>
          <p className="text-gray-200 mb-6">Complete your Daily Intentions to unlock Evening Wrap</p>
          <a 
            href="/daily-intentions"
            className="inline-block bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition"
          >
            Go to Morning Intentions →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      {showCelebration && <MicroCelebration type="evening" />}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{greeting} 🌙</h1>
        <p className="text-gray-300 text-sm mt-1">How did today go?</p>
      </div>
      
      {/* Morning Intentions Review */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
        <p className="text-sm text-gray-200 mb-3">This morning you planned to:</p>
        
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.victoryDone}
              onChange={(e) => setFormData({...formData, victoryDone: e.target.checked})}
              className="mt-1 w-4 h-4 rounded bg-gray-750 border-gray-600 text-green-500 focus:ring-0 focus:ring-offset-0"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-300">Victory to build on</p>
              <p className="text-white group-hover:text-gray-100">{morningData.victory}</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.focusDone}
              onChange={(e) => setFormData({...formData, focusDone: e.target.checked})}
              className="mt-1 w-4 h-4 rounded bg-gray-750 border-gray-600 text-green-500 focus:ring-0 focus:ring-offset-0"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-300">Main focus</p>
              <p className="text-white group-hover:text-gray-100">{morningData.focus}</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.stuckDone}
              onChange={(e) => setFormData({...formData, stuckDone: e.target.checked})}
              className="mt-1 w-4 h-4 rounded bg-gray-750 border-gray-600 text-green-500 focus:ring-0 focus:ring-offset-0"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-300">Working through</p>
              <p className="text-white group-hover:text-gray-100">{morningData.stuck}</p>
            </div>
          </label>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 focus-within:border-purple-500/50 transition">
          <label className="block text-sm text-gray-200 mb-2">
            What did you accomplish today? ✨
          </label>
          <textarea
            ref={firstInputRef}
            value={formData.accomplished}
            onChange={(e) => setFormData({...formData, accomplished: e.target.value})}
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none"
            rows="2"
            placeholder="Closed 2 deals, helped team member, cleared inbox..."
            required
          />
        </div>
        
        {/* Conversation Count Field */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
          <label className="block text-sm text-purple-400 mb-2">
            💬 How many conversations did you have today?
          </label>
          <input
            type="number"
            value={formData.conversations}
            onChange={(e) => setFormData({...formData, conversations: e.target.value})}
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-2xl font-bold"
            placeholder="0"
            min="0"
            max="999"
          />
          {morningData?.todaysFocus && (
            <p className="text-xs text-gray-400 mt-2">
              Your goal was: {morningData.todaysFocus}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 focus-within:border-purple-500/50 transition">
            <label className="block text-sm text-gray-200 mb-2">
              Quotes 📝
            </label>
            <input
              type="number"
              min="0"
              value={formData.quotes}
              onChange={(e) => setFormData({...formData, quotes: e.target.value})}
              className="w-full bg-transparent text-white text-2xl font-bold placeholder-gray-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 focus-within:border-purple-500/50 transition">
            <label className="block text-sm text-gray-200 mb-2">
              Sales 💰
            </label>
            <input
              type="number"
              min="0"
              value={formData.sales}
              onChange={(e) => setFormData({...formData, sales: e.target.value})}
              className="w-full bg-transparent text-white text-2xl font-bold placeholder-gray-500 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 focus-within:border-purple-500/50 transition">
          <label className="block text-sm text-gray-200 mb-2">
            What&apos;s priority #1 tomorrow? 🚀
          </label>
          <textarea
            value={formData.tomorrow}
            onChange={(e) => setFormData({...formData, tomorrow: e.target.value})}
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none"
            rows="2"
            placeholder="Follow up with hot leads, team training, proposal deadline..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !formData.accomplished || !formData.tomorrow}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? '...' : 'Complete Day →'}
        </button>
      </form>
      
      <p className="text-center text-gray-400 text-xs mt-4">
        Auto-saving as you type
      </p>
    </div>
  )
}