'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import PageLayout from '@/src/components/layout/PageLayout'
import DailyIntentions from '@/src/components/sales/DailyIntentions'
import NightlyWrap from '@/src/components/performance/NightlyWrap'
import JournalInsights from '@/src/components/journal/JournalInsights'
import JournalHistory from '@/src/components/journal/JournalHistory'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

export default function JournalPage() {
  const { user, userData } = useAuth()
  const [activeTab, setActiveTab] = useState('today')
  const [todayStats, setTodayStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const today = new Date()
  const hour = today.getHours()
  const isEvening = hour >= 16 // After 4pm show evening wrap
  
  useEffect(() => {
    if (user) {
      loadTodayStats()
    }
  }, [user])
  
  const loadTodayStats = async () => {
    try {
      const todayKey = today.toISOString().split('T')[0]
      
      // Load today's sales
      const salesQuery = query(
        collection(db, 'sales'),
        where('userId', '==', user.uid),
        where('date', '==', todayKey),
        orderBy('timestamp', 'desc')
      )
      const salesSnap = await getDocs(salesQuery)
      
      let totalSales = 0
      let totalCommission = 0
      let products = []
      
      salesSnap.forEach(doc => {
        const data = doc.data()
        totalSales++
        totalCommission += data.totalCommission || 0
        products.push(data.productsSummary)
      })
      
      setTodayStats({
        sales: totalSales,
        commission: totalCommission,
        products: products,
        calls: userData?.todayCalls || 0,
        points: userData?.todayPoints || 0,
        streak: userData?.streak || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
    setLoading(false)
  }
  
  if (!user) return null
  
  return (
    <PageLayout user={userData}>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            📓 Daily Journal
          </h1>
          <p className="text-gray-300">
            Track your intentions, progress, and reflections
          </p>
        </header>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'today' 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'insights' 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'history' 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Today's Stats Bar */}
            {todayStats && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-sm text-gray-400 mb-4">Today Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{todayStats.calls}</p>
                    <p className="text-xs text-gray-400">Calls</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{todayStats.sales}</p>
                    <p className="text-xs text-gray-400">Sales</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">${todayStats.commission}</p>
                    <p className="text-xs text-gray-400">Commission</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{todayStats.points}</p>
                    <p className="text-xs text-gray-400">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">🔥 {todayStats.streak}</p>
                    <p className="text-xs text-gray-400">Streak</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Morning/Evening Components */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>☀️</span> Morning Intentions
                </h2>
                <DailyIntentions />
              </div>
              
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>🌙</span> Evening Wrap
                </h2>
                <NightlyWrap />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'insights' && (
          <JournalInsights 
            userData={userData} 
            todayStats={todayStats}
          />
        )}
        
        {activeTab === 'history' && (
          <JournalHistory userId={user.uid} />
        )}
      </div>
    </PageLayout>
  )
}