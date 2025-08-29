'use client'
import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { createNotification } from '@/lib/notifications'

// Product types with commission values
const PRODUCTS = {
  home: { name: 'Home', commission: 50, icon: '🏠' },
  car: { name: 'Car', commission: 50, icon: '🚗' },
  condo: { name: 'Condo', commission: 50, icon: '🏢' },
  life: { name: 'Life', commission: 50, icon: '❤️' },
  renters: { name: 'Renters', commission: 20, icon: '🔑' },
  umbrella: { name: 'Umbrella', commission: 20, icon: '☂️' },
  boat: { name: 'Boat', commission: 20, icon: '⛵' },
  motorcycle: { name: 'Motorcycle', commission: 20, icon: '🏍️' },
  other: { name: 'Other', commission: 20, icon: '📋' }
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

    setIsSubmitting(true)
    try {
      // Prepare sale data
      const saleData = {
        userId: user.uid,
        userName: userData?.name || 'Agent',
        teamId: userData?.teamId || null,
        clientFirstName: clientFirstName.trim(),
        products: selectedProducts,
        productsSummary: formatProductsSold(),
        totalItems: calculateTotalItems(),
        totalCommission: calculateTotalCommission(),
        totalRevenue: calculateTotalCommission() * 10, // Assuming 10x multiplier for revenue
        timestamp: serverTimestamp(),
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      }

      // Save to Firebase
      await addDoc(collection(db, 'sales'), saleData)

      // Create notification
      await createNotification(
        user.uid,
        `💰 Sale logged! ${formatProductsSold()} - $${calculateTotalCommission()} commission earned!`,
        'success'
      )

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
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="glass-brand radius-lg px-6 py-3 flex items-center gap-3 hover:scale-105 transition-all group"
      >
        <span className="text-2xl">💰</span>
        <div className="text-left">
          <div className="type-list-heading text-white">Log Sale</div>
          <div className="type-detail-caption text-white/80">Track commission</div>
        </div>
        <svg className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative glass-xl radius-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto elev-3">
            {/* Header */}
            <div className="sticky top-0 glass-strong p-6 border-b border-ink-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="type-dashboard-title text-primary">Log New Sale</h2>
                  <p className="type-detail-body text-secondary mt-1">Record products sold and track commission</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="p-4 bg-success/10 border-l-4 border-success">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="type-list-heading text-success">Sale Logged Successfully!</div>
                    <div className="type-detail-body text-success-dark">
                      Commission earned: ${calculateTotalCommission()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Client Name */}
              <div>
                <label className="type-list-label text-secondary mb-2 block">
                  Client First Name
                </label>
                <input
                  type="text"
                  value={clientFirstName}
                  onChange={(e) => setClientFirstName(e.target.value)}
                  placeholder="Enter client's first name"
                  className="w-full px-4 py-3 rounded-lg glass border border-ink-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 type-list-body"
                  required
                />
              </div>

              {/* Product Selection */}
              <div>
                <label className="type-list-label text-secondary mb-3 block">
                  Products Sold
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(PRODUCTS).map(([key, product]) => (
                    <div key={key} className="glass radius-lg p-4 border border-ink-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.icon}</span>
                          <div>
                            <div className="type-list-heading text-primary">{product.name}</div>
                            <div className="type-detail-caption text-success">${product.commission} commission</div>
                          </div>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={selectedProducts[key] || ''}
                          onChange={(e) => handleProductChange(key, e.target.value)}
                          placeholder="0"
                          className="w-20 px-3 py-2 rounded-lg glass border border-ink-200 text-center type-list-body focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission Preview */}
              {calculateTotalItems() > 0 && (
                <div className="glass-brand radius-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="type-list-label text-white/80">Products Summary</span>
                    <span className="type-list-body text-white">{formatProductsSold()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="type-list-heading text-white">Total Commission</span>
                    <span className="type-dashboard-metric text-white">${calculateTotalCommission()}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 rounded-lg glass hover:bg-surface-100 type-list-body text-ink-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || calculateTotalItems() === 0 || !clientFirstName.trim()}
                  className="px-6 py-3 rounded-lg glass-brand type-list-body text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
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