'use client'
import { useAuth } from '@/components/AuthProvider'
import PageLayout from '@/components/PageLayout'
import { useNotification } from '@/components/NotificationProvider'
import { createNotification, NOTIFICATION_TYPES, generateWeeklySummary } from '@/lib/notifications'
import { useState } from 'react'

export default function TestNotificationsPage() {
  const { user, userData } = useAuth()
  const { showToast } = useNotification()
  const [loading, setLoading] = useState(false)

  const testNotifications = [
    {
      type: NOTIFICATION_TYPES.STREAK_MILESTONE,
      data: { days: 7 },
      label: '7 Day Streak'
    },
    {
      type: NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED,
      data: { achievementName: 'Week Warrior' },
      label: 'Achievement Unlocked'
    },
    {
      type: NOTIFICATION_TYPES.LEVEL_UP,
      data: { level: 5, xp: 500 },
      label: 'Level Up'
    },
    {
      type: NOTIFICATION_TYPES.TEAM_MILESTONE,
      data: { teamName: 'Alpha Squad', milestone: '100 collective check-ins!' },
      label: 'Team Milestone'
    }
  ]

  const handleTestNotification = async (test) => {
    if (!user) return
    
    setLoading(true)
    
    // Create persistent notification in Firebase
    await createNotification(user.uid, test.type, test.data)
    
    // Show toast notification
    const template = {
      [NOTIFICATION_TYPES.STREAK_MILESTONE]: {
        icon: '🔥',
        title: `${test.data.days} Day Streak!`,
        message: `Amazing! You&apos;ve maintained a ${test.data.days} day streak.`
      },
      [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: {
        icon: '🏆',
        title: 'Achievement Unlocked!',
        message: `You&apos;ve earned "${test.data.achievementName}"!`
      },
      [NOTIFICATION_TYPES.LEVEL_UP]: {
        icon: '⭐',
        title: `Level ${test.data.level} Reached!`,
        message: `Congratulations! You&apos;re now level ${test.data.level}.`
      },
      [NOTIFICATION_TYPES.TEAM_MILESTONE]: {
        icon: '🎯',
        title: 'Team Milestone!',
        message: test.data.milestone
      }
    }
    
    showToast(template[test.type])
    setLoading(false)
  }

  const handleWeeklySummary = async () => {
    if (!user) return
    setLoading(true)
    await generateWeeklySummary(user.uid)
    showToast({
      icon: '📊',
      title: 'Weekly Summary Generated',
      message: 'Check your notifications for your weekly stats!'
    })
    setLoading(false)
  }

  if (!user) return null

  return (
    <PageLayout user={userData}>
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-white">Test Notifications</h1>
          <p className="text-gray-400 mt-2">Click any button to trigger a test notification</p>
        </header>
        
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Test Individual Notifications */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">System Notifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testNotifications.map((test, index) => (
                <button
                  key={index}
                  onClick={() => handleTestNotification(test)}
                  disabled={loading}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition disabled:opacity-50"
                >
                  <div className="text-2xl mb-2">{test.type === NOTIFICATION_TYPES.STREAK_MILESTONE ? '🔥' : test.type === NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED ? '🏆' : test.type === NOTIFICATION_TYPES.LEVEL_UP ? '⭐' : '🎯'}</div>
                  <p className="text-white font-semibold">{test.label}</p>
                  <p className="text-xs text-gray-400 mt-1">Click to test</p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Weekly Summary */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Weekly Summary</h2>
            <button
              onClick={handleWeeklySummary}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              Generate Weekly Summary
            </button>
            <p className="text-xs text-gray-400 mt-2">
              This will analyze your last 7 days of activity
            </p>
          </div>
          
          {/* Instructions */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">How it works</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Click any button to trigger a notification</li>
              <li>• Toast notifications appear in the bottom-right corner</li>
              <li>• All notifications are saved and viewable in the bell icon</li>
              <li>• Unread count appears as a badge on the bell</li>
              <li>• Notifications expire after 30 days</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}