'use client'
import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, MapPin, AlertCircle, CheckCircle } from 'lucide-react'

// U.S. States list
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
]

export default function AuthPage() {
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const [mode, setMode] = useState('login') // 'login', 'signup', 'forgot'
  const [showPassword, setShowPassword] = useState(false)
  const [rememberUsername, setRememberUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [emailExists, setEmailExists] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  
  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lastAttemptTime, setLastAttemptTime] = useState(null)
  const [lockoutEndTime, setLockoutEndTime] = useState(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    state: ''
  })

  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    email: '',
    password: '',
    state: ''
  })

  // Load remembered username and check lockout status on mount
  useEffect(() => {
    // Check for session expiration message
    if (searchParams.get('sessionExpired') === 'true' || localStorage.getItem('sessionExpired') === 'true') {
      setError('Your session has expired due to inactivity. Please log in again.')
      localStorage.removeItem('sessionExpired')
    }
    
    const remembered = localStorage.getItem('rememberedUsername')
    if (remembered) {
      setFormData(prev => ({ ...prev, email: remembered }))
      setRememberUsername(true)
    }
    
    // Check if user is locked out
    const lockout = localStorage.getItem('authLockoutEnd')
    if (lockout) {
      const lockoutTime = parseInt(lockout)
      if (lockoutTime > Date.now()) {
        setLockoutEndTime(lockoutTime)
      } else {
        localStorage.removeItem('authLockoutEnd')
        localStorage.removeItem('authAttempts')
      }
    }
    
    // Load previous attempts count
    const attempts = localStorage.getItem('authAttempts')
    if (attempts) {
      setLoginAttempts(parseInt(attempts))
    }
  }, [])
  
  // Check if user is currently locked out
  const isLockedOut = () => {
    if (!lockoutEndTime) return false
    if (Date.now() >= lockoutEndTime) {
      setLockoutEndTime(null)
      setLoginAttempts(0)
      localStorage.removeItem('authLockoutEnd')
      localStorage.removeItem('authAttempts')
      return false
    }
    return true
  }
  
  // Handle rate limiting
  const handleFailedAttempt = () => {
    const newAttempts = loginAttempts + 1
    setLoginAttempts(newAttempts)
    setLastAttemptTime(Date.now())
    localStorage.setItem('authAttempts', newAttempts.toString())
    
    // Lockout after 5 failed attempts
    if (newAttempts >= 5) {
      const lockoutDuration = 15 * 60 * 1000 // 15 minutes
      const lockoutEnd = Date.now() + lockoutDuration
      setLockoutEndTime(lockoutEnd)
      localStorage.setItem('authLockoutEnd', lockoutEnd.toString())
      setError('Too many failed attempts. Account locked for 15 minutes.')
      return true
    } else if (newAttempts >= 3) {
      setError(`Invalid credentials. ${5 - newAttempts} attempts remaining before lockout.`)
    }
    return false
  }
  
  // Clear attempts on successful login
  const clearAttempts = () => {
    setLoginAttempts(0)
    setLastAttemptTime(null)
    setLockoutEndTime(null)
    localStorage.removeItem('authAttempts')
    localStorage.removeItem('authLockoutEnd')
  }

  // Calculate password strength
  useEffect(() => {
    if (mode === 'signup' && formData.password) {
      let strength = 0
      const pass = formData.password
      
      // Length checks
      if (pass.length >= 8) strength++
      if (pass.length >= 12) strength++
      if (pass.length >= 16) strength++
      
      // Character type checks
      if (/[a-z]/.test(pass)) strength++
      if (/[A-Z]/.test(pass)) strength++
      if (/[0-9]/.test(pass)) strength++
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength++
      
      // Complexity bonus for meeting all requirements
      if (pass.length >= 12 && /[a-z]/.test(pass) && /[A-Z]/.test(pass) && 
          /[0-9]/.test(pass) && /[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
        strength = Math.min(5, strength + 1)
      }
      
      setPasswordStrength(Math.min(5, strength))
    }
  }, [formData.password, mode])

  // Check if email exists (for signup)
  useEffect(() => {
    if (mode === 'signup' && formData.email && formData.email.includes('@')) {
      const checkEmail = async () => {
        setCheckingEmail(true)
        try {
          // In a real app, you'd have a Cloud Function to check this
          // For MVP, we'll just show it's available
          setEmailExists(false)
        } catch (err) {
          console.error('Error checking email:', err)
        }
        setCheckingEmail(false)
      }
      
      const timer = setTimeout(checkEmail, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.email, mode])

  // Validate form fields
  const validateField = (field, value) => {
    let error = ''
    
    switch (field) {
      case 'firstName':
        if (mode === 'signup' && !value.trim()) {
          error = 'First name is required'
        }
        break
      case 'email':
        if (!value) {
          error = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email'
        }
        break
      case 'password':
        if (!value) {
          error = 'Password is required'
        } else if (mode === 'signup') {
          // Enhanced password requirements for new users only
          if (value.length < 12) {
            error = 'Password must be at least 12 characters'
          } else if (!/[A-Z]/.test(value)) {
            error = 'Password must contain at least one uppercase letter'
          } else if (!/[a-z]/.test(value)) {
            error = 'Password must contain at least one lowercase letter'
          } else if (!/[0-9]/.test(value)) {
            error = 'Password must contain at least one number'
          } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            error = 'Password must contain at least one special character'
          }
        } else if (mode === 'login') {
          // For existing users, allow legacy passwords (min 6 chars)
          // They'll be prompted to update after login
          if (value.length < 6) {
            error = 'Password must be at least 6 characters'
          }
        }
        break
      case 'state':
        if (mode === 'signup' && !value) {
          error = 'Please select your state'
        }
        break
    }
    
    setValidationErrors(prev => ({ ...prev, [field]: error }))
    return error === ''
  }

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
    setError('')
  }

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Check if user is locked out
    if (isLockedOut()) {
      const remainingTime = Math.ceil((lockoutEndTime - Date.now()) / 1000 / 60)
      setError(`Account is locked. Please try again in ${remainingTime} minutes.`)
      return
    }
    
    // Validate
    const emailValid = validateField('email', formData.email)
    const passwordValid = validateField('password', formData.password)
    
    if (!emailValid || !passwordValid) return
    
    setLoading(true)
    setError('')
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      
      // Clear rate limiting on successful login
      clearAttempts()
      
      // Save username if remember is checked
      if (rememberUsername) {
        localStorage.setItem('rememberedUsername', formData.email)
      } else {
        localStorage.removeItem('rememberedUsername')
      }
      
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      
      // Handle rate limiting for failed attempts
      const isLocked = handleFailedAttempt()
      
      if (!isLocked) {
        // Only show specific error if not locked out
        if (err.code === 'auth/user-not-found') {
          setError('No account found with this email')
        } else if (err.code === 'auth/wrong-password') {
          setError('Incorrect password')
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email address')
        } else if (err.code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Please try again later.')
        } else {
          setError('Login failed. Please try again.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    const firstNameValid = validateField('firstName', formData.firstName)
    const emailValid = validateField('email', formData.email)
    const passwordValid = validateField('password', formData.password)
    const stateValid = validateField('state', formData.state)
    
    if (!firstNameValid || !emailValid || !passwordValid || !stateValid) return
    
    if (emailExists) {
      setError('An account with this email already exists')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      
      // Generate 6-digit ID
      const userId = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Create user document
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.firstName,
        email: formData.email,
        state: formData.state,
        userId: userId,
        level: 1,
        xp: 0,
        streak: 0,
        lifetimePoints: 0,
        monthPoints: 0,
        weekPoints: 0,
        createdAt: serverTimestamp(),
        lastActivityDate: serverTimestamp()
      })
      
      // Also create in members collection for compatibility
      await setDoc(doc(db, 'members', user.uid), {
        name: formData.firstName,
        email: formData.email,
        state: formData.state,
        userId: userId,
        level: 1,
        xp: 0,
        streak: 0,
        lifetimePoints: 0,
        monthPoints: 0,
        weekPoints: 0,
        createdAt: serverTimestamp()
      })
      
      router.push('/dashboard')
    } catch (err) {
      console.error('Signup error:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak')
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    
    if (!validateField('email', formData.email)) return
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // For MVP, just show a temporary password
      // In production, use sendPasswordResetEmail(auth, formData.email)
      
      // Check if user exists first
      const tempPassword = 'TempPass123!'
      
      setSuccess(`For testing purposes, use this temporary password: ${tempPassword}\n\nIn production, a reset link would be sent to ${formData.email}`)
      
      // Uncomment for production:
      // await sendPasswordResetEmail(auth, formData.email)
      // setSuccess(`Password reset link sent to ${formData.email}`)
      
    } catch (err) {
      console.error('Password reset error:', err)
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else {
        setError('Failed to reset password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 2) return 'bg-orange-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 2) return 'Fair'
    if (passwordStrength <= 3) return 'Good'
    if (passwordStrength <= 4) return 'Strong'
    return 'Very Strong'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img src="/images/logo/agent-ascend-logo.svg" alt="Agent Ascend" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Agent Ascend</h1>
          <p className="text-gray-600 mt-2">Sales Performance Platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Mode Tabs */}
          {mode !== 'forgot' && (
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  mode === 'login' 
                    ? 'bg-white text-navy-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  mode === 'signup' 
                    ? 'bg-white text-navy-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember Username */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberUsername}
                    onChange={(e) => setRememberUsername(e.target.checked)}
                    className="w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-navy-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember username</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-navy-600 hover:text-navy-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-600 hover:bg-navy-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 ${
                      validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                </div>
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 ${
                      validationErrors.email || emailExists ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                  {checkingEmail && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin w-5 h-5 border-2 border-navy-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
                {emailExists && (
                  <p className="mt-1 text-sm text-red-600">An account with this email already exists</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password strength:</span>
                      <span className="text-xs font-medium text-gray-700">{getPasswordStrengthText()}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <ul className="mt-2 text-xs text-gray-600 space-y-1">
                      <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                        • At least 6 characters
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                        • One uppercase letter
                      </li>
                      <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                        • One number
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 appearance-none ${
                      validationErrors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your state</option>
                    {US_STATES.map(state => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.state && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || emailExists}
                className="w-full bg-navy-600 hover:bg-navy-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enter your email address and we'll help you reset your password.
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 whitespace-pre-line">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-navy-600 hover:bg-navy-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setSuccess('')
                    setError('')
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 Agent Ascend. All rights reserved.
        </p>
      </div>

      {/* Add navy color to Tailwind classes */}
      <style jsx>{`
        .bg-navy-600 {
          background-color: #1e3a8a;
        }
        .bg-navy-700 {
          background-color: #1e3075;
        }
        .text-navy-600 {
          color: #1e3a8a;
        }
        .text-navy-700 {
          color: #1e3075;
        }
        .focus\\:ring-navy-500:focus {
          --tw-ring-color: #2563eb;
        }
        .focus\\:border-navy-500:focus {
          border-color: #2563eb;
        }
        .border-navy-500 {
          border-color: #2563eb;
        }
      `}</style>
    </div>
  )
}