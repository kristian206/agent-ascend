'use client'
import { useState } from 'react'
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { useAuth } from '@/src/components/auth/AuthProvider'

export default function DailyCheckIn() {
  const { user, userData } = useAuth()
  const [intentions, setIntentions] = useState(['', '', ''])
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  const handleCheckIn = async () => {
    if (!user || intentions.some(i => !i.trim())) return

    // Save check-in
    await addDoc(collection(db, 'checkins'), {
      userId: user.uid,
      intentions,
      timestamp: serverTimestamp(),
      completed: false
    })

    // Award points
    await updateDoc(doc(db, 'members', user.uid), {
      todayPoints: (userData?.todayPoints || 0) + 10,
      seasonPoints: (userData?.seasonPoints || 0) + 10,
      xp: (userData?.xp || 0) + 10
    })

    setHasCheckedIn(true)
  }

  if (hasCheckedIn) {
    return (
      <div className="bg-gray-800 bg-gray-900 p-6 rounded-2xl border border-gray-700">
        <h2 className="text-xl font-black text-white mb-4">Daily Check-In ✅</h2>
        <p className="text-green-400">Great job! You&apos;ve set your intentions for today.</p>
        <div className="mt-4 space-y-2">
          {intentions.map((intention, i) => (
            <div key={i} className="p-3 bg-gray-800 rounded-lg text-gray-200">
              {i + 1}. {intention}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 bg-gray-900 p-6 rounded-2xl border border-gray-700">
      <h2 className="text-xl font-black text-white mb-4">Daily Check-In</h2>
      <p className="text-gray-300 mb-4">Set 3 meaningful work intentions for today:</p>
      
      <div className="space-y-3">
        {intentions.map((intention, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Intention ${i + 1}`}
            value={intention}
            onChange={(e) => {
              const newIntentions = [...intentions]
              newIntentions[i] = e.target.value
              setIntentions(newIntentions)
            }}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500"
          />
        ))}
      </div>
      
      <button
        onClick={handleCheckIn}
        disabled={intentions.some(i => !i.trim())}
        className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Set Intentions (+10 pts)
      </button>
    </div>
  )
}