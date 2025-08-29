'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

export default function TeamCommissionOverview() {
  const { user, userData } = useAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [salesData, setSalesData] = useState({})
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isLoading, setIsLoading] = useState(true)
  const [teamName, setTeamName] = useState('')

  // Generate month options for the last 12 months
  const getMonthOptions = () => {
    const options = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const value = date.toISOString().slice(0, 7)
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    return options
  }

  useEffect(() => {
    if (userData?.isLeader && userData?.teamId) {
      loadTeamData()
    } else {
      setIsLoading(false)
    }
  }, [userData, selectedMonth])

  const loadTeamData = async () => {
    if (!userData?.teamId) return

    setIsLoading(true)
    try {
      // Load team info
      const teamDoc = await getDoc(doc(db, 'teams', userData.teamId))
      if (teamDoc.exists()) {
        setTeamName(teamDoc.data().name)
      }

      // Load team members
      const membersQuery = query(
        collection(db, 'users'),
        where('teamId', '==', userData.teamId)
      )
      const membersSnapshot = await getDocs(membersQuery)
      const members = []
      membersSnapshot.forEach(doc => {
        members.push({ id: doc.id, ...doc.data() })
      })
      setTeamMembers(members)

      // Load sales data for the selected month
      const salesQuery = query(
        collection(db, 'sales'),
        where('teamId', '==', userData.teamId),
        where('month', '==', selectedMonth)
      )
      const salesSnapshot = await getDocs(salesQuery)
      
      // Aggregate sales data by user
      const salesByUser = {}
      salesSnapshot.forEach(doc => {
        const sale = doc.data()
        if (!salesByUser[sale.userId]) {
          salesByUser[sale.userId] = {
            sales: [],
            totalCommission: 0,
            totalRevenue: 0,
            productCounts: {}
          }
        }
        
        salesByUser[sale.userId].sales.push(sale)
        salesByUser[sale.userId].totalCommission += sale.totalCommission || 0
        salesByUser[sale.userId].totalRevenue += sale.totalRevenue || 0
        
        // Count products
        if (sale.products) {
          Object.entries(sale.products).forEach(([product, quantity]) => {
            if (quantity > 0) {
              if (!salesByUser[sale.userId].productCounts[product]) {
                salesByUser[sale.userId].productCounts[product] = 0
              }
              salesByUser[sale.userId].productCounts[product] += quantity
            }
          })
        }
      })
      
      setSalesData(salesByUser)
    } catch (error) {
      console.error('Error loading team data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format products sold for display
  const formatProductsSold = (productCounts) => {
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
  }

  // Calculate team totals
  const calculateTeamTotals = () => {
    let totalCommission = 0
    let totalRevenue = 0
    let totalSales = 0
    
    Object.values(salesData).forEach(data => {
      totalCommission += data.totalCommission
      totalRevenue += data.totalRevenue
      totalSales += data.sales.length
    })
    
    return { totalCommission, totalRevenue, totalSales }
  }

  // Only show for team leaders
  if (!userData?.isLeader) {
    return null
  }

  if (isLoading) {
    return (
      <div className="glass radius-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="type-list-body text-secondary">Loading team data...</p>
      </div>
    )
  }

  const teamTotals = calculateTeamTotals()

  return (
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
        
        {/* Month Selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-lg glass border border-ink-200 type-list-body focus:border-brand-500 focus:outline-none"
        >
          {getMonthOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Team Summary Cards */}
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
            {teamMembers.map((member) => {
              const memberSales = salesData[member.id] || {
                totalCommission: 0,
                totalRevenue: 0,
                productCounts: {},
                sales: []
              }
              const hasActivity = memberSales.sales.length > 0
              
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
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📊</span>
          <p className="type-list-body text-secondary">No team members found</p>
          <p className="type-detail-caption text-tertiary mt-2">
            Team members will appear here once they join your team
          </p>
        </div>
      )}
    </div>
  )
}