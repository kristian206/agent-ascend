'use client'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import MetricsDashboard from '@/components/MetricsDashboard'
import PerformanceChart from '@/components/PerformanceChart'
import { useState } from 'react'

export default function MetricsPage() {
  const { user, userData } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navigation user={userData} />
      
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white">
            📊 Performance Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            Deep insights into your sales performance and activity
          </p>
        </header>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Metrics Dashboard
          </button>
          <button
            onClick={() => setActiveView('trends')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeView === 'trends'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Trend Analysis
          </button>
        </div>

        {activeView === 'dashboard' ? (
          <MetricsDashboard />
        ) : (
          <div className="space-y-6">
            <PerformanceChart />
            
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">💡 Insights</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <div>
                    <div className="text-white">Track your daily performance</div>
                    <div className="text-sm text-gray-400">Monitor sales, points, and check-ins over time</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <div>
                    <div className="text-white">Identify patterns and trends</div>
                    <div className="text-sm text-gray-400">See which days are most productive</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <div>
                    <div className="text-white">Export your data</div>
                    <div className="text-sm text-gray-400">Download CSV reports for further analysis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}