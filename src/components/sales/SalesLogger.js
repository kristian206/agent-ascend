'use client'
import { useState } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { db } from '@/src/services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { createNotification } from '@/src/services/notifications'
import { canLogSale } from '@/src/utils/rateLimiter'
import { withRetry, getUserMessage } from '@/src/utils/errorHandler'
import { updateMonthlyTotals, updateUserStats } from '@/src/utils/denormalization'
import ErrorBoundary from '@/src/components/common/ErrorBoundary'

// Product types with commission and point values
const PRODUCTS = {
  home: { name: 'Home', commission: 50, points: 20, icon: '🏠' },
  car: { name: 'Car', commission: 50, points: 10, icon: '🚗' },
  condo: { name: 'Condo', commission: 50, points: 20, icon: '🏢' },
  life: { name: 'Life', commission: 50, points: 10, icon: '❤️' },
  renters: { name: 'Renters', commission: 20, points: 5, icon: '🔑' },
  umbrella: { name: 'Umbrella', commission: 20, points: 5, icon: '☂️' },
  boat: { name: 'Boat', commission: 20, points: 5, icon: '⛵' },
  motorcycle: { name: 'Motorcycle/ORV', commission: 20, points: 5, icon: '🏍️' },
  roadside: { name: 'Roadside', commission: 20, points: 5, icon: '🚨' },
  other: { name: 'Other', commission: 20, points: 5, icon: '📋' }
}

export default function SalesLogger({ onSaleLogged }) {
  const { user, userData } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientFirstName, setClientFirstName] = useState('')
  const [selectedProducts, setSelectedProducts] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Calculate total commission
  const calculateTotalCommission = () => {
    return Object.entries(selectedProducts).reduce((total, [productKey, quantity]) => {
      if (quantity > 0) {
        return total + (PRODUCTS[productKey].commission * quantity)
      }
      return total
    }, 0)
  }

  // Calculate total points
  const calculateTotalPoints = () => {
    return Object.entries(selectedProducts).reduce((total, [productKey, quantity]) => {
      if (quantity > 0) {
        return total + (PRODUCTS[productKey].points * quantity)
      }
      return total
    }, 0)
  }

  // Calculate total items
  const calculateTotalItems = () => {
    return Object.values(selectedProducts).reduce((total, quantity) => total + (quantity || 0), 0)
  }

  // Handle product quantity change
  const handleProductChange = (productKey, quantity) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productKey]: Math.max(0, parseInt(quantity) || 0)
    }))
  }

  // Format products for display
  const formatProductsSold = () => {
    const items = []
    Object.entries(selectedProducts).forEach(([key, quantity]) => {
      if (quantity > 0) {
        const product = PRODUCTS[key]
        items.push(`${quantity} ${product.name}${quantity > 1 ? 's' : ''}`)
      }
    })
    return items.join(', ')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!clientFirstName.trim() || calculateTotalItems() === 0) return

    // Check rate limit
    const rateLimit = canLogSale(user.uid)
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.resetIn / 60000)
      alert(`Rate limit reached. You can log more sales in ${minutes} minutes. (Daily: ${rateLimit.dailyRemaining}/50, Hourly: ${rateLimit.hourlyRemaining}/10)`)
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare sale data with retry logic
      const totalPoints = calculateTotalPoints()
      const saleData = {
        userId: user.uid,
        userName: userData?.name || 'Agent',
        teamId: userData?.teamId || null,
        clientFirstName: clientFirstName.trim(),
        products: selectedProducts,
        productsSummary: formatProductsSold(),
        totalItems: calculateTotalItems(),
        totalCommission: calculateTotalCommission(),
        totalPoints: totalPoints,
        totalRevenue: calculateTotalCommission() * 10, // Assuming 10x multiplier for revenue
        timestamp: serverTimestamp(),
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      }

      // Save to Firebase with retry
      const saleDoc = await withRetry(async () => {
        return await addDoc(collection(db, 'sales'), saleData)
      }, 3, 1000)

      // Update denormalized data for performance
      await Promise.all([
        // Update monthly totals for fast aggregation
        updateMonthlyTotals(saleData),
        // Update user stats (points, level, streak)
        updateUserStats(user.uid, totalPoints, 'sale'),
        // Create notification
        createNotification(
          user.uid,
          `💰 Sale logged! ${formatProductsSold()} - $${calculateTotalCommission()} commission, ${totalPoints} points earned!`,
          'success'
        )
      ])

      // Show success message
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setIsOpen(false)
        resetForm()
      }, 2000)

      // Callback if provided
      if (onSaleLogged) {
        onSaleLogged(saleData)
      }
    } catch (error) {
      console.error('Error logging sale:', error)
      await createNotification(user.uid, 'Error logging sale. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setClientFirstName('')
    setSelectedProducts({})
  }

  return (
    <>
      {/* Trigger Button - Matches Header Style */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          flex items-center gap-2 px-4 py-2 rounded-xl
          bg-gradient-to-r from-blue-500 to-blue-600
          hover:from-blue-600 hover:to-blue-700
          text-white font-semibold text-sm
          shadow-lg shadow-blue-500/25
          transition-all duration-200
          hover:shadow-xl hover:shadow-blue-500/30
          hover:scale-105
        "
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
          />
        </svg>
        <span>Log Sale</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-8500 bg-gray-900" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-gray-800 border border-gray-700 rounded-2xl max-w-3xl w-full shadow-2xl">
            {/* Header */}
            <div className="bg-gray-900 p-4 border-b border-gray-700 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Log New Sale</h2>
                  <p className="text-gray-300 mt-1">Record products sold and track commission</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="p-4 bg-green-500/10 border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-semibold text-green-400">Sale Logged Successfully!</div>
                    <div className="text-sm text-green-300">
                      ${calculateTotalCommission()} commission • {calculateTotalPoints()} points
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Client Name */}
              <div>
                <label className="text-sm font-medium text-gray-200 mb-2 block">
                  Client First Name
                </label>
                <input
                  type="text"
                  value={clientFirstName}
                  onChange={(e) => setClientFirstName(e.target.value)}
                  placeholder="Enter client's first name"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              {/* Product Selection */}
              <div>
                <label className="text-sm font-medium text-gray-200 mb-3 block">
                  Products Sold
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRODUCTS).map(([key, product]) => (
                    <div key={key} className="bg-gray-900 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{product.icon}</span>
                          <div>
                            <div className="font-medium text-white text-sm">{product.name}</div>
                            <div className="text-xs text-gray-400">
                              ${product.commission} • {product.points}pts
                            </div>
                          </div>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={selectedProducts[key] || ''}
                          onChange={(e) => handleProductChange(key, e.target.value)}
                          placeholder="0"
                          className="w-16 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-center text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Preview */}
              {calculateTotalItems() > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">{formatProductsSold()}</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-400">Items</div>
                      <div className="text-lg font-bold text-white">{calculateTotalItems()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Commission</div>
                      <div className="text-lg font-bold text-green-400">${calculateTotalCommission()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Points</div>
                      <div className="text-lg font-bold text-blue-400">{calculateTotalPoints()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-750 text-gray-200 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || calculateTotalItems() === 0 || !clientFirstName.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Logging...' : `Log Sale (${calculateTotalItems()} items)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}