'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import seasonService from '@/src/services/seasonService'
import { SeasonUtils, POINTS_CONFIG } from '@/src/models/seasonModels'
import RankBadge, { RankProgressBar } from './RankBadge'
import { 
  Trophy, TrendingUp, Calendar, Target, Award, Zap,
  ChevronUp, Clock, Star, Activity, Gift
} from 'lucide-react'

export default function SeasonProgress() {
  const { user } = useAuth()
  const [seasonData, setSeasonData] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [lifetimeStats, setLifetimeStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      loadSeasonData()
    }
  }, [user])

  const loadSeasonData = async () => {
    try {
      // Get current season
      const season = await seasonService.getCurrentSeason()
      setSeasonData(season)

      // Get user's season progress
      const progress = await seasonService.getUserSeasonProgress(user.uid)
      setUserProgress(progress)

      // Get lifetime stats
      const { getDoc, doc } = await import('firebase/firestore')
      const { db } = await import('@/src/services/firebase')
      const lifetimeDoc = await getDoc(doc(db, 'lifetimeProgression', user.uid))
      if (lifetimeDoc.exists()) {
        setLifetimeStats(lifetimeDoc.data())
      }
    } catch (error) {
      console.error('Error loading season data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-800 rounded-xl" />
        <div className="h-48 bg-gray-800 rounded-xl" />
      </div>
    )
  }

  const progressToNext = userProgress?.progressToNext || { progress: 0, pointsNeeded: 0 }
  const daysRemaining = SeasonUtils.getDaysRemaining()

  return (
    <div className="space-y-6">
      {/* Season Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{seasonData?.name || 'Current Season'}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-4 h-4" />
                {daysRemaining} days remaining
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <Trophy className="w-4 h-4" />
                Season {seasonData?.seasonNumber || 1}
              </span>
            </div>
          </div>
          
          {/* Current Rank Badge */}
          <RankBadge 
            rank={userProgress?.currentRank || 'bronze'}
            division={userProgress?.currentDivision || 5}
            size="medium"
          />
        </div>

        {/* Rank Progress */}
        <RankProgressBar
          currentSR={userProgress?.currentSR || 0}
          currentRank={userProgress?.currentRank || 'bronze'}
          nextRankSR={(userProgress?.currentSR || 0) + progressToNext.pointsNeeded}
          progress={progressToNext.progress}
        />
      </div>

      {/* Dual Progress Tracking */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Season Points (Temporary) */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Season Points
            </h3>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
              Resets Monthly
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Points</span>
              <span className="text-2xl font-bold text-white">
                {userProgress?.seasonPoints || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Today&apos;s Points</span>
              <span className="text-lg font-semibold text-green-400">
                +{userProgress?.dailyPoints?.[new Date().toISOString().split('T')[0]] || 0}
              </span>
            </div>
            
            {/* Bonuses Applied */}
            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Bonuses</span>
                <div className="flex gap-2">
                  {userProgress?.individualGoalBonus && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      +10% Individual
                    </span>
                  )}
                  {userProgress?.teamGoalBonus && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      +10% Team
                    </span>
                  )}
                  {!userProgress?.individualGoalBonus && !userProgress?.teamGoalBonus && (
                    <span className="text-xs text-gray-500">None active</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime XP (Permanent) */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              Lifetime Progress
            </h3>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
              Never Resets
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Level</span>
              <span className="text-2xl font-bold text-white">
                {lifetimeStats?.level || 1}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total XP</span>
              <span className="text-lg font-semibold text-white">
                {lifetimeStats?.lifetimeXP || 0}
              </span>
            </div>
            
            {/* XP Progress to Next Level */}
            <div className="pt-3 border-t border-gray-700">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-gray-400">
                  {(lifetimeStats?.lifetimeXP || 0) % 1000}/1000 XP
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${((lifetimeStats?.lifetimeXP || 0) % 1000) / 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Season Activity
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Login Days</p>
            <p className="text-xl font-bold text-white">{userProgress?.loginDays || 0}</p>
            <p className="text-xs text-gray-500">+{POINTS_CONFIG.login} pts each</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Intentions</p>
            <p className="text-xl font-bold text-white">{userProgress?.intentionsCompleted || 0}</p>
            <p className="text-xs text-gray-500">+{POINTS_CONFIG.dailyIntentions} pts each</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Wraps</p>
            <p className="text-xl font-bold text-white">{userProgress?.wrapsCompleted || 0}</p>
            <p className="text-xs text-gray-500">+{POINTS_CONFIG.nightlyWrap} pts each</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Total Policies</p>
            <p className="text-xl font-bold text-white">
              {Object.values(userProgress?.policiesSold || {}).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-xs text-gray-500">20-50 pts each</p>
          </div>
        </div>
      </div>

      {/* Peak Rank & Placement */}
      {userProgress?.placementRank && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Season Journey</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Placement</p>
              <RankBadge 
                rank={userProgress.placementRank}
                division={5}
                size="small"
                minimal
              />
            </div>
            
            <ChevronUp className="w-6 h-6 text-gray-600" />
            
            <div>
              <p className="text-sm text-gray-400 mb-2">Current</p>
              <RankBadge 
                rank={userProgress.currentRank}
                division={userProgress.currentDivision}
                size="small"
                minimal
              />
            </div>
            
            {userProgress.peakRank !== userProgress.currentRank && (
              <>
                <ChevronUp className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-400 mb-2">Peak</p>
                  <RankBadge 
                    rank={userProgress.peakRank}
                    division={1}
                    size="small"
                    minimal
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}