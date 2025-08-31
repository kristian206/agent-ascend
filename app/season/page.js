'use client'
import { useState } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import PageLayout from '@/src/components/layout/PageLayout'
import SeasonProgress from '@/src/components/season/SeasonProgress'
import SeasonLeaderboard from '@/src/components/season/SeasonLeaderboard'
import { Trophy, TrendingUp, Info, Gift } from 'lucide-react'
import { RANKS, POINTS_CONFIG } from '@/src/models/seasonModels'

export default function SeasonPage() {
  const { userData } = useAuth()
  const [activeTab, setActiveTab] = useState('progress')

  return (
    <PageLayout user={userData}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Competitive Season
          </h1>
          <p className="text-gray-300">
            Climb the ranks, earn rewards, and compete for the top spot
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'progress'
                ? 'bg-gray-750 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            My Progress
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-gray-750 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'rewards'
                ? 'bg-gray-750 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'info'
                ? 'bg-gray-750 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            How It Works
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'progress' && <SeasonProgress />}
        
        {activeTab === 'leaderboard' && <SeasonLeaderboard />}
        
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Season End Rewards */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Season End Rewards</h2>
              <p className="text-gray-400 mb-6">
                Earn exclusive rewards based on your final rank at the end of the season
              </p>
              
              <div className="space-y-3">
                {Object.entries(RANKS).reverse().map(([key, rank]) => (
                  <div key={key} className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg">
                    <span className="text-2xl">{rank.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{rank.name}</p>
                      <p className="text-sm text-gray-400">
                        {rank.startingBonus} bonus points next season
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">SR Range</p>
                      <p className="text-sm font-medium text-white">
                        {rank.srMin} - {rank.srMax}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus Opportunities */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Bonus Opportunities</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400">+10%</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Individual Goal</p>
                      <p className="text-sm text-gray-400">Complete your personal goals</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400">+10%</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Team Goal</p>
                      <p className="text-sm text-gray-400">Help your team reach its targets</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* How Seasons Work */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">How Seasons Work</h2>
              
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">📅 Monthly Resets</h3>
                  <p>Each season lasts exactly one month. At the end of each month, seasonal points reset but your lifetime XP is preserved forever.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">🎯 Dual Progression</h3>
                  <p>You have two types of progression: Seasonal points (temporary, for monthly competition) and Lifetime XP (permanent, for long-term growth).</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">🔄 Soft Reset</h3>
                  <p>Your final rank determines your starting position next season. Higher ranks get bonus starting points but everyone has a chance to climb.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">🏆 Fair Competition</h3>
                  <p>The ranking system uses a logarithmic scale to ensure fair competition. Early points are easier to earn, but climbing to the top requires consistent excellence.</p>
                </div>
              </div>
            </div>

            {/* Points System */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Points System</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-3">Daily Activities</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Login</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.login} pt</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Intentions</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.dailyIntentions} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nightly Wrap</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.nightlyWrap} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cheers (max 5/day)</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.cheerSent} pt each</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-3">Insurance Policies</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">House</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.policies.house} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Car</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.policies.car} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Condo</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.policies.condo} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Life</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.policies.life} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Other</span>
                      <span className="text-white font-medium">+{POINTS_CONFIG.policies.other} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank Tiers */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Rank Tiers</h2>
              <p className="text-gray-400 mb-6">
                Each rank has 5 divisions. Climb through divisions to reach the next rank!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(RANKS).map(([key, rank]) => (
                  <div key={key} className="text-center p-3 bg-gray-900 rounded-lg">
                    <span className="text-3xl">{rank.icon}</span>
                    <p className="font-medium text-white mt-1">{rank.name}</p>
                    <p className="text-xs text-gray-500">Tier {rank.tier}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}