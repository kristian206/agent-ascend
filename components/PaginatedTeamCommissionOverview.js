'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, getDoc, limit, startAfter, orderBy } from 'firebase/firestore'
import { withCache, debounce } from '@/lib/cache'
import { withRetry, getUserMessage } from '@/lib/errorHandler'
import { SkeletonTableRow } from '@/components/ui/Skeleton'
import ErrorBoundary from '@/components/ErrorBoundary'

const PAGE_SIZE = 10
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export default function PaginatedTeamCommissionOverview() {
  const { user, userData } = useAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [salesData, setSalesData] = useState({})
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState(null)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  // Generate month options for the last 12 months
  const getMonthOptions = useMemo(() => {
    const options = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const value = date.toISOString().slice(0, 7)
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    return options
  }, [])

  // Load initial data
  useEffect(() => {
    if (userData?.isLeader && userData?.teamId) {
      loadTeamData()
    } else {
      setIsLoading(false)
    }
  }, [userData, selectedMonth])

  // Load team data with caching and retry
  const loadTeamData = useCallback(async () => {
    if (!userData?.teamId) return

    setIsLoading(true)
    setError(null)
    
    try {
      const cacheKey = `team_${userData.teamId}_${selectedMonth}_page1`
      
      const data = await withCache(
        cacheKey,
        async () => {
          return await withRetry(
            async () => {
              // Load team info
              const teamDoc = await getDoc(doc(db, 'teams', userData.teamId))
              const teamData = teamDoc.exists() ? teamDoc.data() : {}

              // Load first page of team members with pagination
              const membersQuery = query(
                collection(db, 'users'),
                where('teamId', '==', userData.teamId),
                orderBy('name'),
                limit(PAGE_SIZE)
              )
              const membersSnapshot = await getDocs(membersQuery)
              const members = []
              membersSnapshot.forEach(doc => {
                members.push({ id: doc.id, ...doc.data() })
              })

              // Check if using denormalized monthly totals first
              const monthlyTotals = await loadMonthlyTotals(userData.teamId, selectedMonth, members)
              
              let salesByUser = {}
              if (monthlyTotals && Object.keys(monthlyTotals).length > 0) {
                salesByUser = monthlyTotals
              } else {
                // Fallback to aggregating sales data
                salesByUser = await loadSalesData(userData.teamId, selectedMonth, members)
              }

              return {
                teamName: teamData.name || '',
                members,
                salesData: salesByUser,
                lastDoc: membersSnapshot.docs[membersSnapshot.docs.length - 1],
                hasMore: membersSnapshot.docs.length === PAGE_SIZE
              }
            },
            3,
            1000,
            (attempt) => setRetryCount(attempt)
          )
        },
        CACHE_TTL
      )

      setTeamName(data.teamName)
      setTeamMembers(data.members)
      setSalesData(data.salesData)
      setLastDoc(data.lastDoc)
      setHasMore(data.hasMore)
      
    } catch (err) {
      console.error('Error loading team data:', err)
      setError(getUserMessage(err))
      // Set empty state on error
      setSalesData({})
      setTeamMembers([])
    } finally {
      setIsLoading(false)
      setRetryCount(0)
    }
  }, [userData, selectedMonth])

  // Load more team members
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc || !userData?.teamId) return
    
    setLoadingMore(true)
    setError(null)
    
    try {
      const membersQuery = query(
        collection(db, 'users'),
        where('teamId', '==', userData.teamId),
        orderBy('name'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      )
      
      const membersSnapshot = await getDocs(membersQuery)
      const newMembers = []
      membersSnapshot.forEach(doc => {
        newMembers.push({ id: doc.id, ...doc.data() })
      })

      // Load sales data for new members
      const monthlyTotals = await loadMonthlyTotals(userData.teamId, selectedMonth, newMembers)
      let newSalesData = {}
      
      if (monthlyTotals && Object.keys(monthlyTotals).length > 0) {
        newSalesData = monthlyTotals
      } else {
        newSalesData = await loadSalesData(userData.teamId, selectedMonth, newMembers)
      }

      setTeamMembers(prev => [...prev, ...newMembers])
      setSalesData(prev => ({ ...prev, ...newSalesData }))
      setLastDoc(membersSnapshot.docs[membersSnapshot.docs.length - 1])
      setHasMore(membersSnapshot.docs.length === PAGE_SIZE)
      
    } catch (err) {
      console.error('Error loading more:', err)
      setError(getUserMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loadingMore, lastDoc, userData, selectedMonth])

  // Load denormalized monthly totals (faster)
  const loadMonthlyTotals = async (teamId, month, members) => {
    try {
      const totalsQuery = query(
        collection(db, 'monthlyTotals'),
        where('teamId', '==', teamId),
        where('month', '==', month),
        where('userId', 'in', members.map(m => m.id))
      )
      
      const totalsSnapshot = await getDocs(totalsQuery)
      const totals = {}
      
      totalsSnapshot.forEach(doc => {
        const data = doc.data()
        totals[data.userId] = {
          totalCommission: data.totalCommission || 0,
          totalRevenue: data.totalRevenue || 0,
          productCounts: data.productCounts || {},
          sales: [], // Empty array since we're using aggregated data
          salesCount: data.salesCount || 0
        }
      })
      
      return totals
    } catch (err) {
      console.warn('Monthly totals not available, falling back to sales aggregation:', err)
      return null
    }
  }

  // Load and aggregate sales data (slower fallback)
  const loadSalesData = async (teamId, month, members) => {
    const salesByUser = {}
    
    // Batch load sales for all members
    for (const member of members) {
      try {
        const salesQuery = query(
          collection(db, 'sales'),
          where('userId', '==', member.id),
          where('month', '==', month)
        )
        
        const salesSnapshot = await getDocs(salesQuery)
        
        if (!salesByUser[member.id]) {
          salesByUser[member.id] = {
            sales: [],
            totalCommission: 0,
            totalRevenue: 0,
            productCounts: {},
            salesCount: 0
          }
        }
        
        salesSnapshot.forEach(doc => {
          const sale = doc.data()
          salesByUser[member.id].sales.push(sale)
          salesByUser[member.id].totalCommission += sale.totalCommission || 0
          salesByUser[member.id].totalRevenue += sale.totalRevenue || 0
          salesByUser[member.id].salesCount++
          
          // Count products
          if (sale.products) {
            Object.entries(sale.products).forEach(([product, quantity]) => {
              if (quantity > 0) {
                if (!salesByUser[member.id].productCounts[product]) {
                  salesByUser[member.id].productCounts[product] = 0
                }
                salesByUser[member.id].productCounts[product] += quantity
              }
            })
          }
        })
      } catch (err) {
        console.warn(`Error loading sales for member ${member.id}:`, err)
      }
    }
    
    return salesByUser
  }

  // Debounced search
  const handleSearch = useMemo(
    () => debounce((term) => {
      setSearchTerm(term.toLowerCase())
    }, 300),
    []
  )

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return teamMembers
    
    return teamMembers.filter(member => 
      member.name?.toLowerCase().includes(searchTerm) ||
      member.id.toLowerCase().includes(searchTerm)
    )
  }, [teamMembers, searchTerm])

  // Format products sold for display
  const formatProductsSold = useCallback((productCounts) => {
    if (!productCounts || Object.keys(productCounts).length === 0) {
      return 'No sales'
    }
    
    const PRODUCT_NAMES = {
      home: 'Home',
      car: 'Car',
      condo: 'Condo',
      life: 'Life',
      renters: 'Renters',
      umbrella: 'Umbrella',
      boat: 'Boat',
      motorcycle: 'Motorcycle',
      other: 'Other'
    }
    
    const items = []
    Object.entries(productCounts).forEach(([product, count]) => {
      if (count > 0) {
        const name = PRODUCT_NAMES[product] || product
        items.push(`${count} ${name}${count > 1 ? 's' : ''}`)
      }
    })
    
    return items.join(', ')
  }, [])

  // Calculate team totals
  const teamTotals = useMemo(() => {
    let totalCommission = 0
    let totalRevenue = 0
    let totalSales = 0
    
    Object.values(salesData).forEach(data => {
      totalCommission += data.totalCommission || 0
      totalRevenue += data.totalRevenue || 0
      totalSales += data.salesCount || data.sales?.length || 0
    })
    
    return { totalCommission, totalRevenue, totalSales }
  }, [salesData])

  // Retry handler
  const handleRetry = () => {
    setError(null)
    loadTeamData()
  }

  // Only show for team leaders
  if (!userData?.isLeader) {
    return null
  }

  return (
    <ErrorBoundary area="component">
      <div className="glass radius-xl p-6 elev-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="type-dashboard-title text-primary flex items-center gap-2">
              <span className="text-2xl">👥</span>
              Team Commission Overview
            </h2>
            <p className="type-detail-body text-secondary mt-1">
              {teamName ? `${teamName} Performance` : 'Team Performance'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search members..."
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
            />
            
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
            >
              {getMonthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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

        {/* Team Summary Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass radius-lg p-4 border border-ink-100">
              <div className="type-list-label text-secondary mb-1">Total Commission</div>
              <div className="type-dashboard-metric text-success">${teamTotals.totalCommission}</div>
            </div>
            <div className="glass radius-lg p-4 border border-ink-100">
              <div className="type-list-label text-secondary mb-1">Total Revenue</div>
              <div className="type-dashboard-metric text-brand-600">${teamTotals.totalRevenue}</div>
            </div>
            <div className="glass radius-lg p-4 border border-ink-100">
              <div className="type-list-label text-secondary mb-1">Total Sales</div>
              <div className="type-dashboard-metric text-primary">{teamTotals.totalSales}</div>
            </div>
          </div>
        )}

        {/* Team Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-ink-200">
              <tr>
                <th className="text-left py-3 px-4 type-list-label text-secondary">Team Member</th>
                <th className="text-left py-3 px-4 type-list-label text-secondary">Products Sold</th>
                <th className="text-right py-3 px-4 type-list-label text-secondary">Commission</th>
                <th className="text-right py-3 px-4 type-list-label text-secondary">Revenue</th>
                <th className="text-center py-3 px-4 type-list-label text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={5} />
                ))
              ) : (
                filteredMembers.map((member) => {
                  const memberSales = salesData[member.id] || {
                    totalCommission: 0,
                    totalRevenue: 0,
                    productCounts: {},
                    sales: [],
                    salesCount: 0
                  }
                  const hasActivity = memberSales.salesCount > 0 || memberSales.sales?.length > 0
                  
                  return (
                    <tr key={member.id} className="border-b border-ink-100 hover:bg-surface-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                            <span className="text-white font-bold">
                              {member.name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                          </div>
                          <div>
                            <div className="type-list-heading text-primary">{member.name || 'Agent'}</div>
                            <div className="type-detail-caption text-secondary">Level {member.level || 1}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="type-list-body text-primary">
                          {formatProductsSold(memberSales.productCounts)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="type-list-heading text-success">
                          ${memberSales.totalCommission}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="type-list-body text-primary">
                          ${memberSales.totalRevenue}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {hasActivity ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 type-detail-caption text-success">
                            <span className="w-2 h-2 rounded-full bg-success"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ink-100 type-detail-caption text-ink-400">
                            <span className="w-2 h-2 rounded-full bg-ink-400"></span>
                            No Sales
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {!isLoading && hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2 bg-brand-500/20 text-brand-600 font-bold rounded-lg hover:bg-brand-500/30 transition disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full"></span>
                  Loading...
                </span>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}

        {/* No more data */}
        {!isLoading && !hasMore && filteredMembers.length > 0 && (
          <p className="text-center text-ink-400 mt-6">
            Showing {filteredMembers.length} team members
          </p>
        )}

        {/* Empty State */}
        {!isLoading && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📊</span>
            <p className="type-list-body text-secondary">
              {searchTerm ? 'No members found matching your search' : 'No team members found'}
            </p>
            <p className="type-detail-caption text-tertiary mt-2">
              {searchTerm ? 'Try adjusting your search' : 'Team members will appear here once they join your team'}
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}