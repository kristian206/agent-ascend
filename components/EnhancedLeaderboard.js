'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, startAfter, getDocs, getDoc, doc } from 'firebase/firestore'
import { withCache, debounce } from '@/lib/cache'
import { withRetry, getUserMessage } from '@/lib/errorHandler'
import UserBanner from './UserBanner'
import { SkeletonCard } from './ui/Skeleton'
import ErrorBoundary from './ErrorBoundary'

const PAGE_SIZE = 20
const CACHE_TTL = 3 * 60 * 1000 // 3 minutes

// Sort options for players and teams
const SORT_OPTIONS = {
  players: [
    { value: 'monthPoints', label: 'Season Points', field: 'monthPoints' },
    { value: 'level', label: 'Experience Level', field: 'level' },
    { value: 'totalSales', label: 'Total Sales', field: 'totalSales' },
    { value: 'streak', label: 'Current Streak', field: 'streak' },
    { value: 'lifetimePoints', label: 'All-Time Points', field: 'lifetimePoints' }
  ],
  teams: [
    { value: 'memberCount', label: 'Team Size', field: 'memberCount' },
    { value: 'totalSales', label: 'Total Sales', field: 'totalSales' },
    { value: 'avgLevel', label: 'Average Level', field: 'avgLevel' },
    { value: 'createdAt', label: 'Date Created', field: 'createdAt' },
    { value: 'monthlyRevenue', label: 'Monthly Revenue', field: 'monthlyRevenue' }
  ]
}

export default function EnhancedLeaderboard() {
  const { user, userData } = useAuth()
  const [activeTab, setActiveTab] = useState('players') // 'players' or 'teams'
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('monthPoints')
  const [filters, setFilters] = useState({
    levelMin: null,
    levelMax: null,
    teamSizeMin: null,
    teamSizeMax: null,
    activeOnly: false
  })
  const [showFilters, setShowFilters] = useState(false)
  
  // Data states
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [displayResults, setDisplayResults] = useState([])
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  
  // Pagination
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  
  // Refs
  const searchInputRef = useRef(null)
  const observerTarget = useRef(null)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [activeTab, sortBy])

  // Load data based on active tab
  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setPage(0)
    setLastDoc(null)
    setHasMore(true)

    try {
      const cacheKey = `leaderboard_${activeTab}_${sortBy}_page1`
      
      const data = await withCache(
        cacheKey,
        async () => {
          return await withRetry(async () => {
            if (activeTab === 'players') {
              return await loadPlayers(null, sortBy)
            } else {
              return await loadTeams(null, sortBy)
            }
          }, 3, 1000)
        },
        CACHE_TTL
      )

      if (activeTab === 'players') {
        setPlayers(data.results)
        setFilteredResults(data.results)
      } else {
        setTeams(data.results)
        setFilteredResults(data.results)
      }
      
      setDisplayResults(data.results.slice(0, PAGE_SIZE))
      setLastDoc(data.lastDoc)
      setHasMore(data.hasMore)
      setPage(1)
      
    } catch (err) {
      console.error('Error loading leaderboard:', err)
      setError(getUserMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, sortBy])

  // Load players data
  const loadPlayers = async (startAfterDoc = null, sortField = 'monthPoints') => {
    const sortOption = SORT_OPTIONS.players.find(opt => opt.value === sortField)
    const q = query(
      collection(db, 'users'),
      orderBy(sortOption.field, 'desc'),
      ...(startAfterDoc ? [startAfter(startAfterDoc)] : []),
      limit(50) // Load more for client-side filtering
    )
    
    const snapshot = await getDocs(q)
    const results = []
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      
      // Get team name if user has teamId
      let teamName = null
      if (data.teamId) {
        try {
          const teamDoc = await getDoc(doc(db, 'teams', data.teamId))
          if (teamDoc.exists()) {
            teamName = teamDoc.data().name
          }
        } catch (err) {
          console.warn('Error fetching team name:', err)
        }
      }
      
      results.push({
        id: docSnap.id,
        ...data,
        teamName,
        type: 'player'
      })
    }
    
    return {
      results,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === 50
    }
  }

  // Load teams data
  const loadTeams = async (startAfterDoc = null, sortField = 'memberCount') => {
    const sortOption = SORT_OPTIONS.teams.find(opt => opt.value === sortField)
    const q = query(
      collection(db, 'teams'),
      orderBy(sortOption.field, 'desc'),
      ...(startAfterDoc ? [startAfter(startAfterDoc)] : []),
      limit(50)
    )
    
    const snapshot = await getDocs(q)
    const results = []
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      
      // Calculate team stats
      const membersQuery = query(
        collection(db, 'users'),
        where('teamId', '==', docSnap.id)
      )
      const membersSnapshot = await getDocs(membersQuery)
      
      let totalLevel = 0
      let totalSales = 0
      membersSnapshot.forEach(memberDoc => {
        const memberData = memberDoc.data()
        totalLevel += memberData.level || 0
        totalSales += memberData.totalSales || 0
      })
      
      const memberCount = membersSnapshot.size
      const avgLevel = memberCount > 0 ? Math.round(totalLevel / memberCount) : 0
      
      results.push({
        id: docSnap.id,
        ...data,
        memberCount,
        avgLevel,
        totalSales,
        type: 'team'
      })
    }
    
    return {
      results,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === 50
    }
  }

  // Load more results (pagination)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    
    try {
      const nextPage = page + 1
      const startIndex = (nextPage - 1) * PAGE_SIZE
      const endIndex = startIndex + PAGE_SIZE
      
      // Check if we have enough filtered results
      if (startIndex < filteredResults.length) {
        const newResults = filteredResults.slice(startIndex, endIndex)
        setDisplayResults(prev => [...prev, ...newResults])
        setPage(nextPage)
        
        // Check if we need more data from server
        if (endIndex >= filteredResults.length && hasMore) {
          // Load more from server
          const data = await withRetry(async () => {
            if (activeTab === 'players') {
              return await loadPlayers(lastDoc, sortBy)
            } else {
              return await loadTeams(lastDoc, sortBy)
            }
          }, 3, 1000)
          
          const allResults = [...filteredResults, ...data.results]
          const filtered = applyFilters(allResults)
          setFilteredResults(filtered)
          
          if (activeTab === 'players') {
            setPlayers(allResults)
          } else {
            setTeams(allResults)
          }
          
          setLastDoc(data.lastDoc)
          setHasMore(data.hasMore)
        }
      }
    } catch (err) {
      console.error('Error loading more:', err)
      setError(getUserMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page, filteredResults, lastDoc, sortBy, activeTab])

  // Debounced search
  const performSearch = useMemo(
    () => debounce((term) => {
      setIsSearching(true)
      const searchLower = term.toLowerCase()
      
      const baseResults = activeTab === 'players' ? players : teams
      let filtered = baseResults
      
      if (term) {
        filtered = baseResults.filter(item => {
          if (activeTab === 'players') {
            return (
              item.name?.toLowerCase().includes(searchLower) ||
              item.teamName?.toLowerCase().includes(searchLower) ||
              item.userId?.toLowerCase().includes(searchLower)
            )
          } else {
            return (
              item.name?.toLowerCase().includes(searchLower) ||
              item.code?.toLowerCase().includes(searchLower)
            )
          }
        })
      }
      
      // Apply other filters
      filtered = applyFilters(filtered)
      setFilteredResults(filtered)
      setDisplayResults(filtered.slice(0, PAGE_SIZE))
      setPage(1)
      setIsSearching(false)
    }, 300),
    [players, teams, activeTab, filters]
  )

  // Apply filters to results
  const applyFilters = useCallback((results) => {
    let filtered = [...results]
    
    if (activeTab === 'players') {
      // Level filter
      if (filters.levelMin !== null) {
        filtered = filtered.filter(p => (p.level || 0) >= filters.levelMin)
      }
      if (filters.levelMax !== null) {
        filtered = filtered.filter(p => (p.level || 0) <= filters.levelMax)
      }
      
      // Active only filter
      if (filters.activeOnly) {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(p => {
          const lastActive = p.lastActivityDate?.toMillis?.() || p.lastActivityDate || 0
          return lastActive > sevenDaysAgo
        })
      }
    } else {
      // Team size filter
      if (filters.teamSizeMin !== null) {
        filtered = filtered.filter(t => (t.memberCount || 0) >= filters.teamSizeMin)
      }
      if (filters.teamSizeMax !== null) {
        filtered = filtered.filter(t => (t.memberCount || 0) <= filters.teamSizeMax)
      }
    }
    
    return filtered
  }, [activeTab, filters])

  // Handle search input
  const handleSearch = useCallback((e) => {
    const term = e.target.value
    setSearchTerm(term)
    performSearch(term)
  }, [performSearch])

  // Handle filter changes
  const handleFilterChange = useCallback((filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value }
    setFilters(newFilters)
    
    // Reapply search with new filters
    const searchLower = searchTerm.toLowerCase()
    const baseResults = activeTab === 'players' ? players : teams
    
    let filtered = baseResults
    if (searchTerm) {
      filtered = baseResults.filter(item => {
        if (activeTab === 'players') {
          return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.teamName?.toLowerCase().includes(searchLower) ||
            item.userId?.toLowerCase().includes(searchLower)
          )
        } else {
          return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.code?.toLowerCase().includes(searchLower)
          )
        }
      })
    }
    
    filtered = applyFilters(filtered)
    setFilteredResults(filtered)
    setDisplayResults(filtered.slice(0, PAGE_SIZE))
    setPage(1)
  }, [filters, searchTerm, activeTab, players, teams, applyFilters])

  // Handle sort change
  const handleSortChange = useCallback((value) => {
    setSortBy(value)
  }, [])

  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setSearchTerm('')
    setFilters({
      levelMin: null,
      levelMax: null,
      teamSizeMin: null,
      teamSizeMax: null,
      activeOnly: false
    })
    setSortBy(tab === 'players' ? 'monthPoints' : 'memberCount')
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }
    
    return () => observer.disconnect()
  }, [loadMore, hasMore, loadingMore])

  return (
    <ErrorBoundary area="leaderboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass radius-xl p-6 elev-1">
          <h1 className="type-dashboard-title text-primary mb-4">Leaderboard & Search</h1>
          
          {/* Tab Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleTabChange('players')}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all
                ${activeTab === 'players' 
                  ? 'glass-brand text-white' 
                  : 'glass hover:bg-surface-100 text-ink-600'}
              `}
            >
              Players
            </button>
            <button
              onClick={() => handleTabChange('teams')}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all
                ${activeTab === 'teams' 
                  ? 'glass-brand text-white' 
                  : 'glass hover:bg-surface-100 text-ink-600'}
              `}
            >
              Teams
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={activeTab === 'players' 
                ? "Search by username, team name, or ID..." 
                : "Search by team name or code..."}
              className="w-full px-4 py-3 pl-12 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full inline-block"></span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`
            ${showFilters ? 'w-80' : 'w-0 overflow-hidden'}
            transition-all duration-300
            lg:w-80
          `}>
            <div className="glass radius-xl p-6 elev-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="type-list-heading text-primary">Filters & Sort</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sort Options */}
              <div>
                <label className="type-list-label text-secondary mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
                >
                  {SORT_OPTIONS[activeTab].map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Player Filters */}
              {activeTab === 'players' && (
                <>
                  {/* Level Range */}
                  <div>
                    <label className="type-list-label text-secondary mb-2 block">Level Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.levelMin || ''}
                        onChange={(e) => handleFilterChange('levelMin', e.target.value ? parseInt(e.target.value) : null)}
                        className="flex-1 px-3 py-2 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
                      />
                      <span className="self-center text-ink-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.levelMax || ''}
                        onChange={(e) => handleFilterChange('levelMax', e.target.value ? parseInt(e.target.value) : null)}
                        className="flex-1 px-3 py-2 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Active Filter */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.activeOnly}
                        onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                        className="w-4 h-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="type-list-body text-primary">Active in last 7 days</span>
                    </label>
                  </div>
                </>
              )}

              {/* Team Filters */}
              {activeTab === 'teams' && (
                <>
                  {/* Team Size Range */}
                  <div>
                    <label className="type-list-label text-secondary mb-2 block">Team Size</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.teamSizeMin || ''}
                        onChange={(e) => handleFilterChange('teamSizeMin', e.target.value ? parseInt(e.target.value) : null)}
                        className="flex-1 px-3 py-2 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
                      />
                      <span className="self-center text-ink-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.teamSizeMax || ''}
                        onChange={(e) => handleFilterChange('teamSizeMax', e.target.value ? parseInt(e.target.value) : null)}
                        className="flex-1 px-3 py-2 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({
                    levelMin: null,
                    levelMax: null,
                    teamSizeMin: null,
                    teamSizeMax: null,
                    activeOnly: false
                  })
                  setSearchTerm('')
                  loadInitialData()
                }}
                className="w-full px-4 py-2 rounded-lg glass hover:bg-surface-100 type-list-body text-ink-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Results Area */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mb-4 px-4 py-2 rounded-lg glass hover:bg-surface-100 type-list-body text-ink-600 transition-colors"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters & Sort
            </button>

            {/* Error State */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Results Count */}
            {!isLoading && (
              <div className="mb-4 type-list-body text-secondary">
                Found {filteredResults.length} {activeTab === 'players' ? 'players' : 'teams'}
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            )}

            {/* Results Grid */}
            <div className="space-y-3">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} height="112px" />
                ))
              ) : displayResults.length > 0 ? (
                // Results
                displayResults.map((item) => (
                  activeTab === 'players' ? (
                    <UserBanner
                      key={item.id}
                      userData={item}
                      viewerData={userData}
                      context="leaderboard"
                      size="medium"
                    />
                  ) : (
                    // Team Card (simplified for now)
                    <div key={item.id} className="glass radius-xl p-6 elev-1 hover:elev-2 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="type-list-heading text-primary mb-1">{item.name}</h3>
                          <p className="type-detail-body text-secondary">
                            Code: {item.code} • {item.memberCount} members • Avg Level {item.avgLevel}
                          </p>
                        </div>
                        <button className="px-4 py-2 rounded-lg glass-brand text-white font-medium">
                          View Team
                        </button>
                      </div>
                    </div>
                  )
                ))
              ) : (
                // Empty state
                <div className="text-center py-12">
                  <p className="type-list-body text-secondary">
                    {searchTerm ? 'No results found. Try adjusting your search or filters.' : 'No data available'}
                  </p>
                </div>
              )}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="text-center py-4">
                  <span className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full inline-block"></span>
                </div>
              )}

              {/* Infinite scroll target */}
              <div ref={observerTarget} className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}