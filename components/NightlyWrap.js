'use client'
import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import { calculateStreakForToday } from '@/lib/gamification'
import MicroCelebration from '@/components/MicroCelebration'

export default function NightlyWrap() {
  const { user } = useAuth()
  const [morningData, setMorningData] = useState(null)
  const [formData, setFormData] = useState({
    victoryDone: false,
    focusDone: false,
    stuckDone: false,
    accomplished: '',
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
            stuck: data.stuck
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
            quotes: data.quotes || '',
            sales: data.sales || '',
            tomorrow: data.tomorrow || ''
          })
        }
      }
      
      // Focus first input after load
      setTimeout(() => firstInputRef.current?.focus(), 100)
    } catch (error) {
      console.error('Error loading data:', error)
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
      console.error('Draft save error:', error)
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
        quotes: parseInt(formData.quotes) || 0,
        sales: parseInt(formData.sales) || 0,
        tomorrow: formData.tomorrow,
        wrap_completed: true,
        updated_at: serverTimestamp()
      }
      
      await setDoc(doc(db, 'checkins', `${user.uid}_${todayKey}`), wrapData, { merge: true })
      
      // Calculate streak and achievements
      const result = await calculateStreakForToday(user.uid)
      
      // Log events
      console.log('wrap_submitted', { 
        user_id: user.uid, 
        streak: result.streak,
        sales: wrapData.sales,
        quotes: wrapData.quotes
      })
      
      if (result.newStreak) {
        console.log('streak_incremented', { user_id: user.uid, streak: result.streak })
      }
      
      if (result.newAchievements?.length > 0) {
        result.newAchievements.forEach(achievement => {
          console.log('achievement_unlocked', { user_id: user.uid, achievement })
        })
      }
      
      setTodayEntry(wrapData)
      setShowCelebration(true)
      
      // Hide celebration after animation
      setTimeout(() => setShowCelebration(false), 3000)
      
    } catch (error) {
      console.error('Error saving:', error)
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
          <p className="text-gray-300">Rest well, you've earned it.</p>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-3xl font-bold text-white">{todayEntry.quotes || 0}</p>
              <p className="text-xs text-gray-400">Quotes</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-3xl font-bold text-white">{todayEntry.sales || 0}</p>
              <p className="text-xs text-gray-400">Sales</p>
            </div>
          </div>
          
          <div className="mt-4 bg-white/5 rounded-lg p-4 text-left">
            <p className="text-xs text-gray-400 mb-1">Tomorrow's Focus</p>
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
          <p className="text-gray-300 mb-6">Complete your Daily Intentions to unlock Evening Wrap</p>
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
        <p className="text-gray-400 text-sm mt-1">How did today go?</p>
      </div>
      
      {/* Morning Intentions Review */}
      <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
        <p className="text-sm text-gray-300 mb-3">This morning you planned to:</p>
        
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.victoryDone}
              onChange={(e) => setFormData({...formData, victoryDone: e.target.checked})}
              className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-green-500 focus:ring-0 focus:ring-offset-0"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Victory to build on</p>
              <p className="text-white group-hover:text-gray-200">{morningData.victory}</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.focusDone}
              onChange={(e) => setFormData({...formData, focusDone: e.target.checked})}
              className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-green-500 focus:ring-0 focus:ring-offset-0"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Main focus</p>
              <p className="text-white group-hover:text-gray-200">{morningData.focus}</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.stuckDone}
              onChange={(e) => setFormData({...formData, stuckDone: e.target.checked})}
              className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-green-500 focus:ring-0 focus:ring-offset-0"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Working through</p>
              <p className="text-white group-hover:text-gray-200">{morningData.stuck}</p>
            </div>
          </label>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 focus-within:border-purple-500/50 transition">
          <label className="block text-sm text-gray-300 mb-2">
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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 focus-within:border-purple-500/50 transition">
            <label className="block text-sm text-gray-300 mb-2">
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
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 focus-within:border-purple-500/50 transition">
            <label className="block text-sm text-gray-300 mb-2">
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
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 focus-within:border-purple-500/50 transition">
          <label className="block text-sm text-gray-300 mb-2">
            What's priority #1 tomorrow? 🚀
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
      
      <p className="text-center text-gray-500 text-xs mt-4">
        Auto-saving as you type
      </p>
    </div>
  )
}