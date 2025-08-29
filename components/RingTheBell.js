'use client'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { logSale, POLICY_TYPES } from '@/lib/sales'
import SalesCelebration from '@/components/SalesCelebration'
import { useNotification } from '@/components/NotificationProvider'

export default function RingTheBell({ onClose, onSaleLogged }) {
  const { user, userData } = useAuth()
  const { showToast } = useNotification()
  const [selectedType, setSelectedType] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState(null)

  const handleRingBell = async () => {
    if (!selectedType || isSubmitting) return
    
    setIsSubmitting(true)
    
    const result = await logSale(user.uid, userData, {
      type: selectedType,
      customerName
    })
    
    if (result.success) {
      // Determine celebration type
      const celebrationType = result.milestoneHit ? 'milestone' : 'standard'
      
      setCelebrationData({
        type: celebrationType,
        points: result.points,
        milestone: result.milestoneHit
      })
      
      setShowCelebration(true)
      
      // Show toast for milestone
      if (result.milestoneHit) {
        setTimeout(() => {
          showToast({
            icon: '🏆',
            title: `${result.milestoneHit} Sales Milestone!`,
            message: `Incredible achievement! You&apos;ve made ${result.milestoneHit} sales!`,
            duration: 7000
          })
        }, 3000)
      }
      
      // Notify parent
      if (onSaleLogged) {
        onSaleLogged(result)
      }
    } else {
      showToast({
        icon: '❌',
        title: 'Error',
        message: 'Could not log sale. Please try again.'
      })
      setIsSubmitting(false)
    }
  }

  const handleCelebrationComplete = () => {
    setShowCelebration(false)
    onClose()
  }

  if (showCelebration && celebrationData) {
    return (
      <SalesCelebration
        type={celebrationData.type}
        points={celebrationData.points}
        onComplete={handleCelebrationComplete}
      />
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl border border-white/10 max-w-md w-full animate-slideUp">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Ring the Bell! 🔔</h2>
                <p className="text-sm text-gray-400 mt-1">Log your sale in seconds</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Policy Type Selection */}
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-3 block">What did you sell?</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(POLICY_TYPES).map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-yellow-500 bg-yellow-500/20 scale-105'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="text-3xl mb-1">{type.emoji}</div>
                    <div className="text-white font-semibold">{type.label}</div>
                    <div className="text-xs text-gray-400">+{type.points} pts</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Optional Customer Name */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Customer first name (optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John, Sarah, etc."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition"
                maxLength={30}
              />
            </div>
          </div>
          
          {/* Ring Button */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleRingBell}
              disabled={!selectedType || isSubmitting}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all transform ${
                !selectedType || isSubmitting
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/25 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ringing...
                </span>
              ) : (
                'RING IT! 🔔'
              )}
            </button>
            
            {selectedType && (
              <p className="text-center text-xs text-gray-500 mt-2">
                Ready to celebrate your {POLICY_TYPES[selectedType.toUpperCase()].label.toLowerCase()} sale!
              </p>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}