'use client'
import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

export default function JournalHistory({ userId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, intentions, wraps
  
  useEffect(() => {
    loadHistory()
  }, [userId, filter])
  
  const loadHistory = async () => {
    setLoading(true)
    try {
      const entriesQuery = query(
        collection(db, 'checkins'),
        where('user_id', '==', userId),
        orderBy('date', 'desc'),
        limit(30)
      )
      
      const snapshot = await getDocs(entriesQuery)
      const historyData = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        if (filter === 'all' || 
            (filter === 'intentions' && data.intentions_completed) ||
            (filter === 'wraps' && data.wrap_completed)) {
          historyData.push({
            id: doc.id,
            ...data
          })
        }
      })
      
      setEntries(historyData)
    } catch (error) {
      console.error('Error loading history:', error)
    }
    setLoading(false)
  }
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Today'
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-900 p-1 rounded-xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
            filter === 'all' 
              ? 'bg-gray-800 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All Entries
        </button>
        <button
          onClick={() => setFilter('intentions')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
            filter === 'intentions' 
              ? 'bg-gray-800 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Morning
        </button>
        <button
          onClick={() => setFilter('wraps')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
            filter === 'wraps' 
              ? 'bg-gray-800 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Evening
        </button>
      </div>
      
      {/* Entries List */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map(entry => (
            <div 
              key={entry.id}
              className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {formatDate(entry.date)}
                  </h4>
                  <div className="flex gap-4 mt-1">
                    {entry.intentions_completed && (
                      <span className="text-xs text-yellow-400">☀️ Morning</span>
                    )}
                    {entry.wrap_completed && (
                      <span className="text-xs text-purple-400">🌙 Evening</span>
                    )}
                  </div>
                </div>
                
                {/* Daily Stats */}
                {entry.wrap_completed && (
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-white">{entry.conversations || 0}</p>
                      <p className="text-xs text-gray-400">Talks</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white">{entry.quotes || 0}</p>
                      <p className="text-xs text-gray-400">Quotes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white">{entry.sales || 0}</p>
                      <p className="text-xs text-gray-400">Sales</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Morning Intentions */}
              {entry.intentions_completed && (
                <div className="space-y-3 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Victory</p>
                    <p className="text-sm text-white">{entry.victory}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Focus</p>
                    <p className="text-sm text-white">{entry.focus}</p>
                  </div>
                  {entry.todaysFocus && (
                    <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                      <p className="text-xs text-yellow-400 mb-1">Goal</p>
                      <p className="text-sm text-white">{entry.todaysFocus}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Evening Wrap */}
              {entry.wrap_completed && (
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Accomplished</p>
                    <p className="text-sm text-white">{entry.accomplished}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <p className="text-xs text-purple-400 mb-1">Tomorrow's Priority</p>
                    <p className="text-sm text-white">{entry.tomorrow}</p>
                  </div>
                  
                  {/* Checkboxes Status */}
                  <div className="flex gap-4 text-xs">
                    <span className={entry.victoryDone ? 'text-green-400' : 'text-gray-500'}>
                      {entry.victoryDone ? '✅' : '⬜'} Victory
                    </span>
                    <span className={entry.focusDone ? 'text-green-400' : 'text-gray-500'}>
                      {entry.focusDone ? '✅' : '⬜'} Focus
                    </span>
                    <span className={entry.stuckDone ? 'text-green-400' : 'text-gray-500'}>
                      {entry.stuckDone ? '✅' : '⬜'} Progress
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No journal entries yet</p>
          <p className="text-sm text-gray-500 mt-2">Start with today's intentions</p>
        </div>
      )}
    </div>
  )
}