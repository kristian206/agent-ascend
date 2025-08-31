'use client'

import { useState, useEffect } from 'react'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { validatePassword } from '@/src/utils/validation'
import { X, Shield, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react'
import SecurityNotification from '@/src/components/notifications/SecurityNotification'

export default function PasswordMigration({ user, onComplete, onDismiss }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validationErrors, setValidationErrors] = useState([])
  const [showBanner, setShowBanner] = useState(true)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)

  // Check if user needs password migration
  useEffect(() => {
    checkMigrationStatus()
  }, [user])

  const checkMigrationStatus = async () => {
    if (!user) return
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data()
      
      // Check if password has been migrated
      if (userData?.passwordMigrated) {
        setShowBanner(false)
      }
    } catch (error) {
      console.error('Error checking migration status:', error)
    }
  }

  // Calculate password strength
  useEffect(() => {
    if (newPassword) {
      let strength = 0
      
      // Length checks
      if (newPassword.length >= 8) strength++
      if (newPassword.length >= 12) strength++
      if (newPassword.length >= 16) strength++
      
      // Character type checks
      if (/[a-z]/.test(newPassword)) strength++
      if (/[A-Z]/.test(newPassword)) strength++
      if (/[0-9]/.test(newPassword)) strength++
      if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) strength++
      
      // Complexity bonus
      if (newPassword.length >= 12 && 
          /[a-z]/.test(newPassword) && 
          /[A-Z]/.test(newPassword) && 
          /[0-9]/.test(newPassword) && 
          /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        strength = Math.min(5, strength + 1)
      }
      
      setPasswordStrength(Math.min(5, strength))
      
      // Validate password
      const validation = validatePassword(newPassword)
      setValidationErrors(validation.errors)
    } else {
      setPasswordStrength(0)
      setValidationErrors([])
    }
  }, [newPassword])

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 2) return 'bg-orange-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Very Weak'
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Fair'
    if (passwordStrength <= 4) return 'Strong'
    return 'Very Strong'
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    
    // Validate new password strength
    const validation = validatePassword(newPassword)
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Update password
      await updatePassword(user, newPassword)
      
      // Mark as migrated in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        passwordMigrated: true,
        passwordMigratedAt: new Date().toISOString(),
        lastPasswordChange: new Date().toISOString()
      })
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Close modal
      document.getElementById('password-migration-modal').close()
      
      // Show success notification
      setShowSuccessNotification(true)
      
      // Notify completion
      if (onComplete) {
        onComplete()
      }
      
      setShowBanner(false)
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Current password is incorrect')
      } else if (error.code === 'auth/weak-password') {
        setError('New password is too weak')
      } else {
        setError('Failed to update password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!showBanner && !showSuccessNotification) return null

  return (
    <>
      {/* Success Notification */}
      {showSuccessNotification && (
        <SecurityNotification
          type="success"
          message="Your password has been successfully updated with enhanced security requirements."
          onDismiss={() => setShowSuccessNotification(false)}
        />
      )}
      {/* Security Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-medium">
              Security Update Required
            </p>
            <p className="text-sm text-blue-700 mt-1">
              We&apos;ve enhanced our security requirements. Please update your password to meet the new standards.
            </p>
            <button
              onClick={() => document.getElementById('password-migration-modal').showModal()}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
            >
              Update Password Now
            </button>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-3 text-blue-400 hover:text-blue-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Password Update Modal */}
      <dialog id="password-migration-modal" className="modal">
        <div className="modal-box max-w-md">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="font-bold text-lg">Update Your Password</h3>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">New Security Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>At least 12 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include numbers and special characters</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password Strength</span>
                    <span className="text-xs font-medium">{getPasswordStrengthText()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  
                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-xs text-red-600 flex items-start">
                          <X className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Success Checkmarks */}
                  {validationErrors.length === 0 && passwordStrength >= 4 && (
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      Password meets all requirements
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || validationErrors.length > 0 || newPassword !== confirmPassword}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('password-migration-modal').close()
                  if (onDismiss) onDismiss()
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Later
              </button>
            </div>
          </form>
          
          <p className="text-xs text-gray-400 mt-4 text-center">
            You can update your password anytime from your profile settings
          </p>
        </div>
        
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}