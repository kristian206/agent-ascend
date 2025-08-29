'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { collection, query, orderBy, limit, startAfter, getDocs, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import { withCache, debounce } from '@/lib/cache'
import { withRetry, getUserMessage } from '@/lib/errorHandler'
import { SkeletonTableRow } from '@/components/ui/Skeleton'
import ErrorBoundary from '@/components/ErrorBoundary'

const PAGE_SIZE = 20
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export default function PaginatedLeaderboard({ timeframe = 'all' }) {
  const { user, userData } = useAuth()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [userRank, setUserRank] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // Load initial data
  useEffect(() => {
    loadLeaderboard()
  }, [timeframe])

  // Load leaderboard with caching and retry
  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const cacheKey = `leaderboard_${timeframe}_page1`
      
      const data = await withCache(
        cacheKey,
        async () => {
          return await withRetry(
            async () => {
              // Determine which field to sort by
              const sortField = timeframe === 'month' ? 'monthPoints' : 
                               timeframe === 'week' ? 'weekPoints' : 
                               'lifetimePoints'
              
              const q = query(
                collection(db, 'members'),
                orderBy(sortField, 'desc'),
                limit(PAGE_SIZE)
              )
              
              const snapshot = await getDocs(q)
              const leaderboardData = []
              
              snapshot.forEach((doc) => {
                const data = doc.data()
                leaderboardData.push({
                  id: doc.id,
                  userId: data.userId || '------',
                  name: data.name || 'Anonymous',
                  points: data[sortField] || 0,
                  level: data.level || 1,
                  streak: data.streak || 0,
                  teamId: data.teamId
                })
              })
              
              return {
                players: leaderboardData,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
                hasMore: snapshot.docs.length === PAGE_SIZE
              }
            },
            3,
            1000,
            (attempt) => setRetryCount(attempt)
          )
        },
        CACHE_TTL
      )
      
      setPlayers(data.players)
      setLastDoc(data.lastDoc)
      setHasMore(data.hasMore)
      
      // Find user's rank
      if (user) {
        await loadUserRank()
      }
      
    } catch (err) {
      console.error('Error loading leaderboard:', err)
      setError(getUserMessage(err))
    } finally {
      setLoading(false)
      setRetryCount(0)
    }
  }, [timeframe, user])

  // Load more pages
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return
    
    setLoadingMore(true)
    setError(null)
    
    try {
      const sortField = timeframe === 'month' ? 'monthPoints' : 
                       timeframe === 'week' ? 'weekPoints' : 
                       'lifetimePoints'
      
      const q = query(
        collection(db, 'members'),
        orderBy(sortField, 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      )
      
      const snapshot = await getDocs(q)
      const newPlayers = []
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        newPlayers.push({
          id: doc.id,
          userId: data.userId || '------',
          name: data.name || 'Anonymous',
          points: data[sortField] || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          teamId: data.teamId
        })
      })
      
      setPlayers(prev => [...prev, ...newPlayers])
      setLastDoc(snapshot.docs[snapshot.docs.length - 1])
      setHasMore(snapshot.docs.length === PAGE_SIZE)
      
    } catch (err) {
      console.error('Error loading more:', err)
      setError(getUserMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loadingMore, lastDoc, timeframe])

  // Load user's rank
  const loadUserRank = async () => {
    if (!user || !userData) return
    
    try {
      const sortField = timeframe === 'month' ? 'monthPoints' : 
                       timeframe === 'week' ? 'weekPoints' : 
                       'lifetimePoints'
      
      const userPoints = userData[sortField] || 0
      
      // Count how many users have more points
      const q = query(
        collection(db, 'members'),
        where(sortField, '>', userPoints)
      )
      
      const snapshot = await getDocs(q)
      setUserRank(snapshot.size + 1)
      
    } catch (err) {
      console.error('Error loading user rank:', err)
    }
  }

  // Debounced search
  const handleSearch = useMemo(
    () => debounce((searchTerm) => {
      // Implement search logic here
      console.log('Searching for:', searchTerm)
    }, 300),
    []
  )

  // Retry handler
  const handleRetry = () => {
    setError(null)
    loadLeaderboard()
  }

  // Render player row
  const renderPlayer = (player, index) => {
    const rank = index + 1
    const isCurrentUser = player.id === user?.uid
    
    return (
      <tr 
        key={player.id}
        className={`border-b border-white/10 hover:bg-white/5 transition ${
          isCurrentUser ? 'bg-yellow-500/10' : ''
        }`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {rank <= 3 && (
              <span className="text-2xl">
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
              </span>
            )}
            <span className={`font-bold ${rank <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
              #{rank}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
              {player.name[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-white font-semibold">
                {player.name}
                {isCurrentUser && <span className="text-xs text-yellow-400 ml-2">(You)</span>}
              </p>
              <p className="text-xs text-gray-500">ID: {player.userId}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-white font-bold">{player.points.toLocaleString()}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-gray-400">Level {player.level}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-orange-400">{player.streak} 🔥</span>
        </td>
      </tr>
    )
  }

  return (
    <ErrorBoundary area="component">
      <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          {userRank && (
            <div className="text-sm text-gray-400">
              Your Rank: <span className="text-yellow-400 font-bold">#{userRank}</span>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Retry Indicator */}
        {retryCount > 0 && (
          <div className="mb-4 p-2 bg-yellow-500/10 rounded text-yellow-400 text-sm">
            Retrying... Attempt {retryCount}/3
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Rank</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Player</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">Points</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">Level</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">Streak</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={5} />
                ))
              ) : (
                players.map((player, index) => renderPlayer(player, index))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {!loading && hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2 bg-yellow-500/20 text-yellow-400 font-bold rounded-lg hover:bg-yellow-500/30 transition disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></span>
                  Loading...
                </span>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}

        {/* No more data */}
        {!loading && !hasMore && players.length > 0 && (
          <p className="text-center text-gray-500 mt-6">
            Showing top {players.length} players
          </p>
        )}

        {/* Empty state */}
        {!loading && players.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No players found</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}