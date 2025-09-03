'use client'
import { useState } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { useRealtimeUser, useRealtimeCheckin } from '@/src/hooks/useRealtimeUser'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

export default function TestRealtimePage() {
  const { user } = useAuth()
  const { userData, isRealtime, lastUpdate } = useRealtimeUser()
  const { checkinData } = useRealtimeCheckin()
  const [updateLog, setUpdateLog] = useState([])

  const incrementPoints = async (amount) => {
    if (!user) return
    
    try {
      const userRef = doc(db, 'members', user.uid)
      await updateDoc(userRef, {
        todayPoints: increment(amount),
        seasonPoints: increment(amount),
        lifetimePoints: increment(amount),
        xp: increment(amount)
      })
      
      setUpdateLog(prev => [...prev, {
        action: `Added ${amount} points`,
        timestamp: new Date().toLocaleTimeString()
      }])
    } catch (error) {
      console.error('Error updating points:', error)
    }
  }

  const incrementStreak = async () => {
    if (!user) return
    
    try {
      const userRef = doc(db, 'members', user.uid)
      await updateDoc(userRef, {
        streak: increment(1),
        fullStreak: increment(1)
      })
      
      setUpdateLog(prev => [...prev, {
        action: 'Incremented streak',
        timestamp: new Date().toLocaleTimeString()
      }])
    } catch (error) {
      console.error('Error updating streak:', error)
    }
  }

  const resetValues = async () => {
    if (!user) return
    
    try {
      const userRef = doc(db, 'members', user.uid)
      await updateDoc(userRef, {
        todayPoints: 0,
        streak: 0,
        fullStreak: 0
      })
      
      setUpdateLog(prev => [...prev, {
        action: 'Reset values',
        timestamp: new Date().toLocaleTimeString()
      }])
    } catch (error) {
      console.error('Error resetting:', error)
    }
  }

  if (!user) {
    return <div className="p-8">Please login to test real-time updates</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Real-time Updates Test</h1>
        
        {/* Connection Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connection Status</h2>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isRealtime ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-white">{isRealtime ? 'Connected (Real-time)' : 'Not Connected'}</span>
            {lastUpdate && (
              <span className="text-gray-400 text-sm">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Live Data Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Live User Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-sm text-gray-400">Today Points</div>
              <div className="text-2xl font-bold text-green-400">
                {userData?.todayPoints || 0}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-sm text-gray-400">Season Points</div>
              <div className="text-2xl font-bold text-blue-400">
                {userData?.seasonPoints || 0}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-sm text-gray-400">XP</div>
              <div className="text-2xl font-bold text-yellow-400">
                {userData?.xp || 0}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-sm text-gray-400">Streak</div>
              <div className="text-2xl font-bold text-orange-400">
                {userData?.streak || 0}
              </div>
            </div>
          </div>
          
          {checkinData && (
            <div className="mt-4 p-4 bg-gray-700 rounded">
              <div className="text-sm text-gray-400">Today Check-in Status</div>
              <div className="flex gap-4 mt-2">
                <span className={`text-sm ${checkinData.intentions_completed ? 'text-green-400' : 'text-gray-500'}`}>
                  Morning: {checkinData.intentions_completed ? '✅' : '⭕'}
                </span>
                <span className={`text-sm ${checkinData.wrap_completed ? 'text-green-400' : 'text-gray-500'}`}>
                  Evening: {checkinData.wrap_completed ? '✅' : '⭕'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Actions</h2>
          <p className="text-gray-400 text-sm mb-4">
            Open this page in multiple tabs to test real-time synchronization
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => incrementPoints(5)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add 5 Points
            </button>
            <button
              onClick={() => incrementPoints(10)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add 10 Points
            </button>
            <button
              onClick={() => incrementPoints(20)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add 20 Points
            </button>
            <button
              onClick={incrementStreak}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Increment Streak
            </button>
            <button
              onClick={resetValues}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset Values
            </button>
          </div>
        </div>

        {/* Update Log */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Update Log</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {updateLog.length === 0 ? (
              <div className="text-gray-400">No updates yet. Try the test actions above.</div>
            ) : (
              updateLog.map((log, index) => (
                <div key={index} className="flex justify-between p-2 bg-gray-700 rounded">
                  <span className="text-white">{log.action}</span>
                  <span className="text-gray-400 text-sm">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">How to Test Real-time Sync:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
            <li>Open this page in two or more browser tabs</li>
            <li>Click any test action button in one tab</li>
            <li>Watch the values update automatically in all tabs</li>
            <li>The green Live indicator shows real-time connection</li>
            <li>Updates should appear within 1-2 seconds</li>
          </ol>
        </div>
      </div>
    </div>
  )
}