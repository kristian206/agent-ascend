'use client'
import { useState } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { awardDailyActivityPoints, DAILY_POINTS } from '@/src/utils/gamification'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

export default function TestPointsPage() {
  const { user, userData } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [currentPoints, setCurrentPoints] = useState(null)

  const loadCurrentPoints = async () => {
    if (!user) return
    const userRef = doc(db, 'members', user.uid)
    const userDoc = await getDoc(userRef)
    const data = userDoc.data()
    setCurrentPoints({
      todayPoints: data?.todayPoints || 0,
      seasonPoints: data?.seasonPoints || 0,
      lifetimePoints: data?.lifetimePoints || 0,
      xp: data?.xp || 0
    })
  }

  const testMorningIntentions = async () => {
    const result = await awardDailyActivityPoints(user.uid, 'morning_intentions')
    setTestResults(prev => [...prev, {
      activity: 'Morning Intentions',
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }])
    await loadCurrentPoints()
  }

  const testEveningWrap = async () => {
    const result = await awardDailyActivityPoints(user.uid, 'evening_wrap')
    setTestResults(prev => [...prev, {
      activity: 'Evening Wrap',
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }])
    await loadCurrentPoints()
  }

  const resetTodayPoints = async () => {
    const userRef = doc(db, 'members', user.uid)
    await updateDoc(userRef, { todayPoints: 0 })
    
    // Clear today's checkin points tracking
    const today = new Date().toISOString().split('T')[0]
    const checkinRef = doc(db, 'checkins', `${user.uid}_${today}`)
    await updateDoc(checkinRef, { 
      pointsAwarded: {},
      totalDailyPoints: 0
    })
    
    setTestResults([{ activity: 'Reset', message: 'Today points reset', timestamp: new Date().toLocaleTimeString() }])
    await loadCurrentPoints()
  }

  if (!user) {
    return <div className="p-8">Please login to test points system</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Points System Test Page</h1>
        
        {/* Point Values */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Point Values</h2>
          <div className="space-y-2 text-gray-300">
            <div>Morning Intentions: {DAILY_POINTS.MORNING_INTENTIONS} points</div>
            <div>Evening Wrap: {DAILY_POINTS.EVENING_WRAP} points</div>
            <div>Daily Bonus (both completed): {DAILY_POINTS.DAILY_BONUS} points</div>
            <div className="text-green-400 font-semibold">Total Possible Daily: {DAILY_POINTS.MORNING_INTENTIONS + DAILY_POINTS.EVENING_WRAP + DAILY_POINTS.DAILY_BONUS} points</div>
          </div>
        </div>

        {/* Current Points */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Current Points</h2>
            <button 
              onClick={loadCurrentPoints}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
          {currentPoints ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Today</div>
                <div className="text-2xl font-bold text-green-400">{currentPoints.todayPoints}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Season</div>
                <div className="text-2xl font-bold text-blue-400">{currentPoints.seasonPoints}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Lifetime</div>
                <div className="text-2xl font-bold text-purple-400">{currentPoints.lifetimePoints}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">XP</div>
                <div className="text-2xl font-bold text-yellow-400">{currentPoints.xp}</div>
              </div>
            </div>
          ) : (
            <button onClick={loadCurrentPoints} className="text-blue-400 hover:underline">
              Click to load current points
            </button>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Activities</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testMorningIntentions}
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Complete Morning Intentions
            </button>
            <button
              onClick={testEveningWrap}
              className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Complete Evening Wrap
            </button>
            <button
              onClick={resetTodayPoints}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset Today Points
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
          <div className="space-y-2">
            {testResults.length === 0 ? (
              <div className="text-gray-400">No tests run yet. Click a button above to test.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className={`p-3 rounded ${result.success ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-white">{result.activity}</div>
                      {result.pointsAwarded !== undefined && (
                        <div className="text-sm text-gray-300">
                          Points Awarded: {result.pointsAwarded}
                          {result.totalToday && ` (Total Today: ${result.totalToday})`}
                        </div>
                      )}
                      {result.message && (
                        <div className="text-sm text-gray-400">{result.message}</div>
                      )}
                      {result.error && (
                        <div className="text-sm text-red-400">Error: {result.error}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{result.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">How Points Work:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
            <li>Complete Morning Intentions: +5 points</li>
            <li>Complete Evening Wrap: +5 points</li>
            <li>Complete both in same day: +10 bonus (20 total)</li>
            <li>Points are added to today, season, lifetime, and XP totals</li>
            <li>Each activity can only earn points once per day</li>
          </ol>
        </div>
      </div>
    </div>
  )
}