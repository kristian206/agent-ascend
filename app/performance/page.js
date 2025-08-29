'use client'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/navigation/AppShell'
import PerformanceHUD from '@/components/performance/PerformanceHUD'

export default function PerformancePage() {
  const { user, userData } = useAuth()
  const [view, setView] = useState('personal') // 'personal' or 'team'
  
  if (!user) return null

  return (
    <AppShell user={userData}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="type-dashboard-title text-primary">
                Performance Center
              </h1>
              <p className="type-detail-body text-secondary mt-1">
                Track your progress and get personalized coaching
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 glass rounded-lg p-1">
              <button
                onClick={() => setView('personal')}
                className={`px-4 py-2 rounded-lg type-list-body font-medium transition-all ${
                  view === 'personal' 
                    ? 'glass-brand text-white' 
                    : 'text-ink-600 hover:bg-surface-100'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setView('team')}
                className={`px-4 py-2 rounded-lg type-list-body font-medium transition-all ${
                  view === 'team' 
                    ? 'glass-brand text-white' 
                    : 'text-ink-600 hover:bg-surface-100'
                }`}
              >
                Team
              </button>
            </div>
          </div>
        </header>

        {/* Full Performance HUD */}
        <PerformanceHUD 
          userId={userData?.uid}
          view={view}
          compact={false}
          showCoaching={true}
        />

        {/* Additional Performance Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Activity Summary */}
          <div className="glass-xl rounded-lg p-6">
            <h3 className="type-list-heading text-primary mb-4">Today&apos;s Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-ink-50">
                <span className="type-list-body text-ink-600">Calls Made</span>
                <span className="type-list-body font-medium text-primary">42 / 50</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-ink-50">
                <span className="type-list-body text-ink-600">Emails Sent</span>
                <span className="type-list-body font-medium text-primary">28 / 30</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-ink-50">
                <span className="type-list-body text-ink-600">Meetings Booked</span>
                <span className="type-list-body font-medium text-primary">5 / 3</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-ink-50">
                <span className="type-list-body text-ink-600">Quotes Sent</span>
                <span className="type-list-body font-medium text-primary">8 / 10</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="type-list-body text-ink-600">Policies Bound</span>
                <span className="type-list-body font-medium text-success">3 / 2</span>
              </div>
            </div>
          </div>

          {/* Win Tracker */}
          <div className="glass-xl rounded-lg p-6">
            <h3 className="type-list-heading text-primary mb-4">Recent Wins</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="type-list-body font-medium text-primary">Closed $8,500 Bundle</p>
                    <p className="type-detail-caption text-ink-500">Sarah Johnson - Auto + Home</p>
                    <p className="type-detail-caption text-success mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg glass">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="type-list-body font-medium text-primary">50 Call Milestone</p>
                    <p className="type-detail-caption text-ink-500">Hit daily call target</p>
                    <p className="type-detail-caption text-ink-400 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg glass">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="type-list-body font-medium text-primary">20 Day Streak</p>
                    <p className="type-detail-caption text-ink-500">Consistent daily activity</p>
                    <p className="type-detail-caption text-ink-400 mt-1">Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="glass-xl rounded-lg p-6 mt-6">
          <h3 className="type-list-heading text-primary mb-4">Performance Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg glass">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="type-list-body font-medium text-primary mb-1">Best Call Times</p>
                  <p className="type-detail-caption text-ink-600">Your highest connect rate is 10-11 AM and 2-4 PM</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg glass">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="type-list-body font-medium text-primary mb-1">Email Subject Lines</p>
                  <p className="type-detail-caption text-ink-600">Questions in subject lines get 23% more opens</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg glass">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="type-list-body font-medium text-primary mb-1">Follow-up Timing</p>
                  <p className="type-detail-caption text-ink-600">48-hour follow-ups convert 35% better</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}