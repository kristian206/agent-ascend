'use client'
import { useState } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import PageLayout from '@/src/components/layout/PageLayout'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { useRouter } from 'next/navigation'

export default function LogSale() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    customerName: '',
    productType: '',
    premium: '',
    commission: '',
    notes: ''
  })

  const productTypes = [
    'Auto Insurance',
    'Home Insurance',
    'Life Insurance',
    'Renters Insurance',
    'Business Insurance',
    'Umbrella Policy',
    'Other'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Add sale to Firestore
      await addDoc(collection(db, 'sales'), {
        userId: user.uid,
        userName: userData?.name || user.email,
        customerName: formData.customerName,
        productType: formData.productType,
        premium: parseFloat(formData.premium) || 0,
        commission: parseFloat(formData.commission) || 0,
        notes: formData.notes,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      })
      
      setSuccess(true)
      
      // Reset form
      setFormData({
        customerName: '',
        productType: '',
        premium: '',
        commission: '',
        notes: ''
      })
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Error logging sale:', error)
      alert('Failed to log sale. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <PageLayout user={userData}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Log a Sale</h1>
          <p className="text-gray-300">Record your latest sale and earn points!</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="font-medium">Sale logged successfully! Redirecting...</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-900/50 bg-gray-900 rounded-2xl border border-gray-700 p-6 space-y-5">
            
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-8500 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="John Smith"
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Product Type
              </label>
              <select
                required
                value={formData.productType}
                onChange={(e) => setFormData({...formData, productType: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-8500 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="" className="bg-black">Select a product</option>
                {productTypes.map((type) => (
                  <option key={type} value={type} className="bg-black">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Premium & Commission */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Premium Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.premium}
                  onChange={(e) => setFormData({...formData, premium: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-8500 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="1500.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Commission ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.commission}
                  onChange={(e) => setFormData({...formData, commission: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-8500 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="150.00"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-8500 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                placeholder="Any additional details..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 px-6 py-3 rounded-xl
                bg-gradient-to-r from-blue-500 to-blue-600
                hover:from-blue-600 hover:to-blue-700
                text-white font-semibold
                shadow-lg shadow-blue-500/25
                hover:shadow-xl hover:shadow-blue-500/30
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-105
              "
            >
              {loading ? 'Logging Sale...' : 'Log Sale'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="
                px-6 py-3 rounded-xl
                bg-gray-800 border border-gray-700
                hover:bg-gray-750
                text-gray-200 font-medium
                transition-all duration-200
              "
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Points Info */}
        <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="text-sm text-gray-200">
              <p className="font-medium text-blue-400 mb-1">Earn Points!</p>
              <p>Each sale logged earns you XP and moves you closer to the next level. Premium sales over $2000 earn bonus points!</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}