'use client'
import { useState } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { calculateEnhancedStreak } from '@/src/utils/streaks'
import { STREAK_CONFIG } from '@/src/models/streakModels'

export default function TestStreakXPPage() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [currentData, setCurrentData] = useState(null)

  const loadUserData = async () => {
    if (!user) return
    const userDoc = await getDoc(doc(db, 'members', user.uid))
    const data = userDoc.data()
    setCurrentData({
      fullStreak: data?.fullStreak || 0,
      participationStreak: data?.participationStreak || 0,
      xp: data?.xp || 0,
      achievedMilestones: data?.achievedMilestones || {}
    })
  }

  const simulateStreak = async (days, type = 'full') => {
    if (!user) return
    
    const today = new Date().toISOString().split('T')[0]
    
    // Set user's streak to specified days
    const updateData = type === 'full' 
      ? { fullStreak: days, streak: days }
      : { participationStreak: days }
    
    await updateDoc(doc(db, 'members', user.uid), updateData)
    
    // Create checkin for today with sales if full streak
    const checkinData = {
      user_id: user.uid,
      date: today,
      intentions_completed: true,
      wrap_completed: true,
      sales: type === 'full' ? 1 : 0
    }
    
    await setDoc(doc(db, 'checkins', `${user.uid}_${today}`), checkinData)
    
    // Calculate enhanced streak to trigger XP
    const result = await calculateEnhancedStreak(user.uid)
    
    setTestResults(prev => [...prev, {
      action: `Set ${type} streak to ${days}`,
      xpEarned: result.xpEarned || 0,
      newMilestones: result.newMilestones || [],
      timestamp: new Date().toLocaleTimeString()
    }])
    
    await loadUserData()
  }

  const resetMilestones = async () => {
    if (!user) return
    
    await updateDoc(doc(db, 'members', user.uid), {
      achievedMilestones: {},
      xp: 0,
      fullStreak: 0,
      participationStreak: 0,
      streak: 0
    })
    
    setTestResults([{ 
      action: 'Reset all milestones and XP', 
      timestamp: new Date().toLocaleTimeString() 
    }])
    
    await loadUserData()
  }

  if (!user) {
    return <div className="p-8">Please login to test streak XP system</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Streak XP System Test</h1>
        
        {/* Milestone Configuration */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">XP Milestone Values</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(STREAK_CONFIG.xpRewards.milestone).map(([days, xp]) => (
              <div key={days} className="bg-gray-700 p-3 rounded text-center">
                <div className="text-lg font-bold text-yellow-400">{days} days</div>
                <div className="text-sm text-gray-300">+{xp} XP</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Current Status</h2>
            <button 
              onClick={loadUserData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
          {currentData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Full Streak</div>
                <div className="text-2xl font-bold text-orange-400">{currentData.fullStreak}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Participation</div>
                <div className="text-2xl font-bold text-blue-400">{currentData.participationStreak}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Total XP</div>
                <div className="text-2xl font-bold text-yellow-400">{currentData.xp}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-sm text-gray-400">Milestones</div>
                <div className="text-2xl font-bold text-green-400">
                  {Object.keys(currentData.achievedMilestones).length}
                </div>
              </div>
            </div>
          ) : (
            <button onClick={loadUserData} className="text-blue-400 hover:underline">
              Click to load current status
            </button>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Simulate Streaks</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-2">Full Streak (with sales)</h3>
              <div className="flex flex-wrap gap-2">
                {[3, 7, 14, 30, 60, 90, 365].map(days => (
                  <button
                    key={days}
                    onClick={() => simulateStreak(days, 'full')}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-400 mb-2">Participation Streak (no sales)</h3>
              <div className="flex flex-wrap gap-2">
                {[7, 14, 30, 60, 90, 180, 365].map(days => (
                  <button
                    key={days}
                    onClick={() => simulateStreak(days, 'participation')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={resetMilestones}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset All Milestones & XP
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-400">No tests run yet. Simulate a streak above.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-700 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{result.action}</div>
                      {result.xpEarned > 0 && (
                        <div className="text-yellow-400">+{result.xpEarned} XP earned!</div>
                      )}
                      {result.newMilestones?.length > 0 && (
                        <div className="text-sm text-green-400">
                          Milestones: {result.newMilestones.map(m => `${m.days}-day`).join(', ')}
                        </div>
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
          <h3 className="text-lg font-semibold text-blue-400 mb-2">How XP Milestones Work:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
            <li>Each streak milestone awards XP only once</li>
            <li>Full streaks (with sales) have more milestones</li>
            <li>Participation streaks start at 7 days</li>
            <li>XP is never removed, even if streak is lost</li>
            <li>Rebuilding a streak won't re-award previous milestones</li>
          </ol>
        </div>
      </div>
    </div>
  )
}