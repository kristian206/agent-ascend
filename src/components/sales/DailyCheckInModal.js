'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { db } from '@/src/services/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { X, Sun, Moon, Target, TrendingUp, MessageSquare } from 'lucide-react'

export default function DailyCheckInModal() {
  const { user, userData } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('morning') // 'morning' or 'evening'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [todayIntentions, setTodayIntentions] = useState(null)
  
  // Form states
  const [morningData, setMorningData] = useState({
    primaryGoal: '',
    salesTarget: '',
    keyActivities: '',
    motivation: ''
  })
  
  const [eveningData, setEveningData] = useState({
    goalAchieved: '',
    actualSales: '',
    wins: '',
    improvements: '',
    tomorrowFocus: ''
  })

  // Check if check-in should be shown
  useEffect(() => {
    if (!user) return

    const checkDailyStatus = async () => {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      
      try {
        // Get today's check-in document
        const checkInRef = doc(db, 'dailyCheckIns', `${user.uid}_${today}`)
        const checkInDoc = await getDoc(checkInRef)
        
        if (checkInDoc.exists()) {
          const data = checkInDoc.data()
          
          // Store morning intentions for evening reflection
          if (data.morning) {
            setTodayIntentions(data.morning)
          }
          
          // Check if morning check-in is done
          if (!data.morning) {
            // Show morning check-in on first login
            setModalType('morning')
            setShowModal(true)
          }
          // Check if it's after 4:30 PM and evening check-in not done
          else if (hour >= 16 && minute >= 30 && !data.evening) {
            setModalType('evening')
            setShowModal(true)
          }
        } else {
          // No check-in for today yet
          if (hour < 16 || (hour === 16 && minute < 30)) {
            // Before 4:30 PM - show morning check-in
            setModalType('morning')
            setShowModal(true)
          } else {
            // After 4:30 PM - user missed morning, go straight to evening
            setModalType('evening')
            setShowModal(true)
          }
        }
      } catch (error) {
        console.error('Error checking daily status:', error)
      }
    }

    // Check immediately on mount
    checkDailyStatus()

    // Set up interval to check for evening check-in
    const interval = setInterval(() => {
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      
      // Check at 4:30 PM
      if (hour === 16 && minute === 30) {
        checkDailyStatus()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [user])

  // Handle morning check-in submission
  const handleMorningSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    
    setIsSubmitting(true)
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const checkInRef = doc(db, 'dailyCheckIns', `${user.uid}_${today}`)
      
      // Save morning check-in
      await setDoc(checkInRef, {
        userId: user.uid,
        date: today,
        morning: {
          ...morningData,
          completedAt: serverTimestamp(),
          skipped: false
        }
      }, { merge: true })
      
      // Store for evening reference
      setTodayIntentions(morningData)
      
      // Close modal
      setShowModal(false)
      
      // Reset form
      setMorningData({
        primaryGoal: '',
        salesTarget: '',
        keyActivities: '',
        motivation: ''
      })
    } catch (error) {
      console.error('Error saving morning check-in:', error)
      alert('Failed to save check-in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle evening reflection submission
  const handleEveningSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    
    setIsSubmitting(true)
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const checkInRef = doc(db, 'dailyCheckIns', `${user.uid}_${today}`)
      
      // Save evening reflection
      await setDoc(checkInRef, {
        userId: user.uid,
        date: today,
        evening: {
          ...eveningData,
          completedAt: serverTimestamp(),
          skipped: false
        }
      }, { merge: true })
      
      // Close modal
      setShowModal(false)
      
      // Reset form
      setEveningData({
        goalAchieved: '',
        actualSales: '',
        wins: '',
        improvements: '',
        tomorrowFocus: ''
      })
    } catch (error) {
      console.error('Error saving evening reflection:', error)
      alert('Failed to save reflection. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle skip
  const handleSkip = async () => {
    if (!user) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const checkInRef = doc(db, 'dailyCheckIns', `${user.uid}_${today}`)
      
      // Mark as skipped
      await setDoc(checkInRef, {
        userId: user.uid,
        date: today,
        [modalType]: {
          skipped: true,
          skippedAt: serverTimestamp()
        }
      }, { merge: true })
      
      setShowModal(false)
    } catch (error) {
      console.error('Error marking as skipped:', error)
    }
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-8500 bg-gray-900">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${
          modalType === 'morning' 
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {modalType === 'morning' ? (
                <Sun className="w-8 h-8 text-yellow-500" />
              ) : (
                <Moon className="w-8 h-8 text-purple-500" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'morning' ? 'Set Your Daily Intentions' : 'End of Day Reflection'}
                </h2>
                <p className="text-gray-400 mt-1">
                  {modalType === 'morning' 
                    ? 'Start your day with clear goals and purpose'
                    : 'Reflect on your progress and plan for tomorrow'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Morning Check-in Form */}
        {modalType === 'morning' && (
          <form onSubmit={handleMorningSubmit} className="p-6 space-y-6">
            {/* Primary Goal */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4" />
                What's your primary goal for today?
              </label>
              <textarea
                value={morningData.primaryGoal}
                onChange={(e) => setMorningData({ ...morningData, primaryGoal: e.target.value })}
                placeholder="e.g., Close 3 deals, complete all follow-ups, reach out to 20 new prospects..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                rows={2}
                required
              />
            </div>

            {/* Sales Target */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4" />
                Sales target for today
              </label>
              <input
                type="text"
                value={morningData.salesTarget}
                onChange={(e) => setMorningData({ ...morningData, salesTarget: e.target.value })}
                placeholder="e.g., $5,000 in premiums, 3 new policies..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                required
              />
            </div>

            {/* Key Activities */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4" />
                Key activities to accomplish
              </label>
              <textarea
                value={morningData.keyActivities}
                onChange={(e) => setMorningData({ ...morningData, keyActivities: e.target.value })}
                placeholder="List your top 3-5 activities for today..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                rows={3}
                required
              />
            </div>

            {/* Motivation */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                What's motivating you today?
              </label>
              <input
                type="text"
                value={morningData.motivation}
                onChange={(e) => setMorningData({ ...morningData, motivation: e.target.value })}
                placeholder="e.g., Team competition, personal best, helping clients..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-2 text-gray-400 hover:text-gray-800 transition-colors"
              >
                Skip for today
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Set Intentions'}
              </button>
            </div>
          </form>
        )}

        {/* Evening Reflection Form */}
        {modalType === 'evening' && (
          <form onSubmit={handleEveningSubmit} className="p-6 space-y-6">
            {/* Show morning intentions if available */}
            {todayIntentions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Your Morning Intentions:</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Goal:</strong> {todayIntentions.primaryGoal}</p>
                  <p><strong>Target:</strong> {todayIntentions.salesTarget}</p>
                  <p><strong>Activities:</strong> {todayIntentions.keyActivities}</p>
                </div>
              </div>
            )}

            {/* Goal Achievement */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                How well did you achieve your primary goal?
              </label>
              <select
                value={eveningData.goalAchieved}
                onChange={(e) => setEveningData({ ...eveningData, goalAchieved: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select...</option>
                <option value="exceeded">Exceeded expectations 🎉</option>
                <option value="achieved">Fully achieved ✅</option>
                <option value="partial">Partially achieved 📈</option>
                <option value="missed">Missed target 📊</option>
              </select>
            </div>

            {/* Actual Sales */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                What were your actual sales/results?
              </label>
              <input
                type="text"
                value={eveningData.actualSales}
                onChange={(e) => setEveningData({ ...eveningData, actualSales: e.target.value })}
                placeholder="e.g., $3,500 in premiums, 2 policies sold..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            {/* Wins */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                What went well today? (Wins)
              </label>
              <textarea
                value={eveningData.wins}
                onChange={(e) => setEveningData({ ...eveningData, wins: e.target.value })}
                placeholder="Celebrate your successes, no matter how small..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows={2}
                required
              />
            </div>

            {/* Improvements */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                What could have been better?
              </label>
              <textarea
                value={eveningData.improvements}
                onChange={(e) => setEveningData({ ...eveningData, improvements: e.target.value })}
                placeholder="Areas for improvement or lessons learned..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows={2}
              />
            </div>

            {/* Tomorrow Focus */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Top priority for tomorrow?
              </label>
              <input
                type="text"
                value={eveningData.tomorrowFocus}
                onChange={(e) => setEveningData({ ...eveningData, tomorrowFocus: e.target.value })}
                placeholder="What's the #1 thing you'll focus on tomorrow?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-2 text-gray-400 hover:text-gray-800 transition-colors"
              >
                Skip reflection
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Complete Reflection'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}