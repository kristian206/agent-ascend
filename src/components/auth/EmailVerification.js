'use client'
import { useState, useEffect } from 'react'
import { auth } from '@/src/services/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle, RefreshCw, Clock } from 'lucide-react'

export default function EmailVerification({ user, onVerified }) {
  const router = useRouter()
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [checkingVerification, setCheckingVerification] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Check verification status periodically
  useEffect(() => {
    if (!user) return

    const checkVerification = async () => {
      setCheckingVerification(true)
      try {
        await user.reload()
        if (user.emailVerified) {
          onVerified()
        }
      } catch (err) {
        console.error('Error checking verification:', err)
      }
      setCheckingVerification(false)
    }

    // Check immediately
    checkVerification()

    // Then check every 3 seconds
    const interval = setInterval(checkVerification, 3000)

    return () => clearInterval(interval)
  }, [user, onVerified])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResendEmail = async () => {
    if (!user || cooldown > 0) return

    setResending(true)
    setError('')
    setMessage('')

    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false
      })
      setMessage('Verification email sent! Check your inbox.')
      setCooldown(60) // 60 second cooldown
    } catch (err) {
      console.error('Error resending email:', err)
      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes.')
        setCooldown(300) // 5 minute cooldown
      } else {
        setError('Failed to send email. Please try again.')
      }
    } finally {
      setResending(false)
    }
  }

  const handleCheckManually = async () => {
    setCheckingVerification(true)
    try {
      await user.reload()
      if (user.emailVerified) {
        onVerified()
      } else {
        setMessage('Email not verified yet. Please check your inbox.')
      }
    } catch (err) {
      console.error('Error checking verification status:', err)
      setError('Error checking verification status.')
    }
    setCheckingVerification(false)
  }

  const handleChangeEmail = () => {
    // Sign out and go back to signup
    auth.signOut()
    router.push('/?mode=signup')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-gray-400">We&apos;ve sent a verification link to</p>
          <p className="text-blue-400 font-medium">{user?.email}</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-gray-200 font-medium">Check your email</p>
                <p className="text-gray-400 text-sm">Look for an email from Agency Max+</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="text-gray-200 font-medium">Click the verification link</p>
                <p className="text-gray-400 text-sm">This will verify your email address</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="text-gray-200 font-medium">Come back here</p>
                <p className="text-gray-400 text-sm">We&apos;ll automatically detect when you&apos;re verified</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {checkingVerification ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                    <span className="text-gray-300">Checking verification status...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">Waiting for verification</span>
                  </>
                )}
              </div>
              <button
                onClick={handleCheckManually}
                disabled={checkingVerification}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50"
              >
                Check now
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-300 text-sm">{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resending || cooldown > 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                cooldown > 0
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Resend Verification Email
                </>
              )}
            </button>

            <button
              onClick={handleChangeEmail}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
            >
              Use Different Email
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              Can&apos;t find the email? Check your spam folder or{' '}
              <button
                onClick={handleResendEmail}
                disabled={cooldown > 0}
                className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50"
              >
                resend it
              </button>
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Join <span className="text-white font-bold">500+</span> sales professionals
          </p>
          <p className="text-gray-500 text-xs mt-1">
            already crushing their goals with Agency Max+
          </p>
        </div>
      </div>
    </div>
  )
}