'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import seasonService from '@/src/services/seasonService'
import RankBadge from './RankBadge'
import Link from 'next/link'
import { 
  Trophy, Medal, Crown, Search, Filter, ChevronRight,
  TrendingUp, Users, User, Globe
} from 'lucide-react'

export default function SeasonLeaderboard() {
  const { user, userData } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState('global') // global, team, friends
  const [selectedRankFilter, setSelectedRankFilter] = useState('all')

  useEffect(() => {
    loadLeaderboard()
  }, [])

  useEffect(() => {
    filterLeaderboard()
  }, [leaderboard, searchQuery, filterMode, selectedRankFilter])

  const loadLeaderboard = async () => {
    try {
      const data = await seasonService.getSeasonLeaderboard(null, 100)
      setLeaderboard(data)
      
      // Find user's rank
      const userPosition = data.findIndex(entry => entry.userId === user?.uid)
      if (userPosition !== -1) {
        setUserRank(userPosition + 1)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLeaderboard = () => {
    let filtered = [...leaderboard]
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply rank filter
    if (selectedRankFilter !== 'all') {
      filtered = filtered.filter(entry => entry.currentRank === selectedRankFilter)
    }
    
    // Apply mode filter
    if (filterMode === 'team' && userData?.teamId) {
      filtered = filtered.filter(entry => entry.teamId === userData.teamId)
    }
    
    setFilteredLeaderboard(filtered)
  }

  const getRankMedal = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />
      default:
        return <span className="text-gray-400 font-medium">#{position}</span>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-800 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Season Leaderboard
          </h2>
          
          {userRank && (
            <div className="px-4 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <span className="text-sm text-gray-400">Your Rank:</span>
              <span className="ml-2 text-lg font-bold text-white">#{userRank}</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mode Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterMode('global')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                filterMode === 'global'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Global
            </button>
            <button
              onClick={() => setFilterMode('team')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                filterMode === 'team'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Team
            </button>
          </div>

          {/* Rank Filter */}
          <select
            value={selectedRankFilter}
            onChange={(e) => setSelectedRankFilter(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ranks</option>
            <option value="grandmaster">Grandmaster</option>
            <option value="master">Master</option>
            <option value="diamond">Diamond</option>
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Top 3 Spotlight */}
        {filterMode === 'global' && !searchQuery && selectedRankFilter === 'all' && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 border-b border-gray-700">
            <div className="grid md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <Link
                  key={entry.userId}
                  href={`/user/${entry.userId}`}
                  className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <div className="text-2xl font-bold">
                    {getRankMedal(index + 1)}
                  </div>
                  <img
                    src={entry.avatarUrl || '/api/placeholder/40/40'}
                    alt={entry.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{entry.name}</p>
                    <p className="text-sm text-gray-400">{entry.seasonPoints} pts</p>
                  </div>
                  <RankBadge
                    rank={entry.currentRank}
                    division={entry.currentDivision}
                    size="small"
                    minimal
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Leaderboard */}
        <div className="divide-y divide-gray-700">
          {filteredLeaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No players found</p>
            </div>
          ) : (
            filteredLeaderboard.map((entry) => {
              const isCurrentUser = entry.userId === user?.uid
              
              return (
                <Link
                  key={entry.userId}
                  href={`/user/${entry.userId}`}
                  className={`flex items-center gap-4 p-4 hover:bg-gray-750 transition-colors ${
                    isCurrentUser ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                  }`}
                >
                  {/* Rank Position */}
                  <div className="w-12 text-center">
                    {getRankMedal(entry.rank)}
                  </div>
                  
                  {/* Player Info */}
                  <img
                    src={entry.avatarUrl || '/api/placeholder/40/40'}
                    alt={entry.name}
                    className="w-10 h-10 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{entry.name}</p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {entry.seasonPoints} points • {entry.currentSR} SR
                    </p>
                  </div>
                  
                  {/* Rank Badge */}
                  <RankBadge
                    rank={entry.currentRank}
                    division={entry.currentDivision}
                    size="small"
                    minimal
                  />
                  
                  {/* Peak Rank Indicator */}
                  {entry.peakRank !== entry.currentRank && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3" />
                      Peak: {entry.peakRank}
                    </div>
                  )}
                  
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </Link>
              )
            })
          )}
        </div>

        {/* Load More */}
        {filteredLeaderboard.length >= 100 && (
          <div className="p-4 text-center border-t border-gray-700">
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-750 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Rank Distribution */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Rank Distribution</h3>
        
        <div className="space-y-2">
          {Object.entries(RANKS).reverse().map(([key, rank]) => {
            const count = leaderboard.filter(e => e.currentRank === key).length
            const percentage = leaderboard.length > 0 ? (count / leaderboard.length) * 100 : 0
            
            return (
              <div key={key} className="flex items-center gap-3">
                <RankBadge rank={key} size="small" minimal showDivision={false} />
                <div className="flex-1">
                  <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: rank.gradient
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}