'use client'
import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

export default function JournalInsights({ userData, todayStats }) {
  const [insights, setInsights] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    generateInsights()
  }, [userData, todayStats])
  
  const generateInsights = async () => {
    const newInsights = []
    const newSuggestions = []
    
    // Performance-based insights
    if (userData) {
      // Call activity insight
      const avgCalls = userData.avgDailyCalls || 20
      if (todayStats?.calls < avgCalls * 0.5) {
        newInsights.push({
          type: 'warning',
          icon: '📞',
          title: 'Low Call Activity',
          message: `You are at ${todayStats.calls} calls today. Your average is ${avgCalls}.`,
          suggestion: 'Block 30 minutes for uninterrupted calling'
        })
        newSuggestions.push({
          category: 'activity',
          text: 'Try the "Power Hour" - 60 minutes of back-to-back calls',
          priority: 'high'
        })
      } else if (todayStats?.calls > avgCalls * 1.5) {
        newInsights.push({
          type: 'success',
          icon: '🌟',
          title: 'Exceptional Activity!',
          message: `${todayStats.calls} calls! That's ${Math.round((todayStats.calls/avgCalls - 1) * 100)}% above your average!`,
          suggestion: 'Keep this momentum tomorrow'
        })
      }
      
      // Sales conversion insight
      if (todayStats?.calls > 10 && todayStats?.sales === 0) {
        newInsights.push({
          type: 'tip',
          icon: '💡',
          title: 'Conversion Opportunity',
          message: 'Good call volume but no sales yet today',
          suggestion: 'Focus on asking for the sale - "Would you like to get started today?"'
        })
        newSuggestions.push({
          category: 'technique',
          text: 'Use the "3 Yes" technique - get 3 small agreements before the big ask',
          priority: 'medium'
        })
      }
      
      // Streak insights
      if (userData.streak > 0) {
        if (userData.streak === 6) {
          newInsights.push({
            type: 'milestone',
            icon: '🔥',
            title: 'One Day to Week Streak!',
            message: 'Complete tomorrow for a 7-day streak and bonus XP!',
            suggestion: 'Set an alarm to check in early tomorrow'
          })
        } else if (userData.streak % 10 === 0) {
          newInsights.push({
            type: 'celebration',
            icon: '🎉',
            title: `${userData.streak} Day Streak!`,
            message: 'You are in the top 5% of consistent performers!',
            suggestion: 'Share your success with the team'
          })
        }
      }
      
      // Time-based suggestions
      const hour = new Date().getHours()
      const day = new Date().getDay()
      
      if (hour < 10 && todayStats?.calls === 0) {
        newSuggestions.push({
          category: 'timing',
          text: 'Early bird gets the sale - make your first call before 9am',
          priority: 'high'
        })
      }
      
      if (day === 1) { // Monday
        newSuggestions.push({
          category: 'weekly',
          text: 'Monday Momentum: Review weekend leads first',
          priority: 'medium'
        })
      } else if (day === 5) { // Friday
        newSuggestions.push({
          category: 'weekly',
          text: 'Friday Focus: Close pending deals before the weekend',
          priority: 'high'
        })
      }
      
      // Product mix suggestions
      if (todayStats?.products && !todayStats.products.some(p => p.includes('Life'))) {
        newSuggestions.push({
          category: 'product',
          text: 'Life insurance has the highest points (20) - lead with life benefits',
          priority: 'medium'
        })
      }
      
      // Motivational insights based on patterns
      if (userData.todayPoints > 100) {
        newInsights.push({
          type: 'celebration',
          icon: '💯',
          title: 'Century Club!',
          message: 'Over 100 points today - you are crushing it!',
          suggestion: 'Document what worked today for future reference'
        })
      }
    }
    
    setInsights(newInsights)
    setSuggestions(newSuggestions)
    setLoading(false)
  }
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-800 rounded-xl"></div>
        <div className="h-32 bg-gray-800 rounded-xl"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🤖</span> AI Insights
        </h3>
        
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <div 
                key={i}
                className={`p-4 rounded-xl border ${
                  insight.type === 'warning' ? 'bg-red-500/10 border-red-500/20' :
                  insight.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
                  insight.type === 'celebration' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-300 mb-2">{insight.message}</p>
                    {insight.suggestion && (
                      <p className="text-xs text-blue-400">
                        💡 {insight.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Complete more activities to unlock insights</p>
        )}
      </div>
      
      {/* Smart Suggestions */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>💡</span> Today Suggestions
        </h3>
        
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions
              .sort((a, b) => {
                const priority = { high: 0, medium: 1, low: 2 }
                return priority[a.priority] - priority[b.priority]
              })
              .map((suggestion, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition"
                >
                  <span className={`w-2 h-2 rounded-full mt-2 ${
                    suggestion.priority === 'high' ? 'bg-red-500' :
                    suggestion.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></span>
                  <div className="flex-1">
                    <p className="text-sm text-white">{suggestion.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {suggestion.category}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-400">No suggestions at this time</p>
        )}
      </div>
      
      {/* Weekly Patterns */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>📊</span> Your Patterns
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Best Performance Day</p>
            <p className="text-xl font-bold text-white">
              {userData?.bestDay || 'Tuesday'} 
              <span className="text-sm text-gray-400 ml-2">avg {userData?.bestDayAvg || 25} calls</span>
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 mb-2">Peak Hours</p>
            <p className="text-xl font-bold text-white">
              {userData?.peakHours || '10am - 12pm'}
              <span className="text-sm text-gray-400 ml-2">highest conversions</span>
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 mb-2">Success Formula</p>
            <p className="text-sm text-white">
              When you make {userData?.successThreshold || '20'}+ calls, your close rate doubles
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}