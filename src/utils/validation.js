// Input Validation and Sanitization Utilities

// Sanitize string input - remove potentially harmful characters
export function sanitizeString(input) {
  if (typeof input !== 'string') return ''
  
  // Remove HTML tags and script injection attempts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Sanitize email input
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return ''
  
  // Remove whitespace and convert to lowercase
  email = email.trim().toLowerCase()
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  return emailRegex.test(email) ? email : ''
}

// Sanitize and validate phone number
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return ''
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if it's a valid US phone number (10 digits)
  if (cleaned.length === 10) {
    return cleaned
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return cleaned.substring(1)
  }
  
  return ''
}

// Validate and sanitize numeric input
export function sanitizeNumber(input, min = null, max = null) {
  const num = parseFloat(input)
  
  if (isNaN(num)) return null
  
  if (min !== null && num < min) return min
  if (max !== null && num > max) return max
  
  return num
}

// Validate and sanitize URL
export function sanitizeURL(url) {
  if (typeof url !== 'string') return ''
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    
    return parsed.href
  } catch {
    return ''
  }
}

// Validate and sanitize date input
export function sanitizeDate(date) {
  if (!date) return null
  
  const parsed = new Date(date)
  
  if (isNaN(parsed.getTime())) return null
  
  return parsed.toISOString()
}

// Validate password strength
export function validatePassword(password) {
  const errors = []
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate username
export function validateUsername(username) {
  if (typeof username !== 'string') return false
  
  // Username must be 3-20 characters, alphanumeric with underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  
  return usernameRegex.test(username)
}

// Escape HTML entities to prevent XSS
export function escapeHTML(str) {
  if (typeof str !== 'string') return ''
  
  const escapeChars = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  
  return str.replace(/[&<>"'/]/g, char => escapeChars[char])
}

// Validate file upload
export function validateFileUpload(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options
  
  const errors = []
  
  if (!file) {
    errors.push('No file selected')
    return { isValid: false, errors }
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type')
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    errors.push('Invalid file extension')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Sanitize object for Firestore
export function sanitizeFirestoreData(data) {
  const sanitized = {}
  
  for (const [key, value] of Object.entries(data)) {
    // Skip undefined values
    if (value === undefined) continue
    
    // Sanitize based on type
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'number') {
      sanitized[key] = value
    } else if (typeof value === 'boolean') {
      sanitized[key] = value
    } else if (value === null) {
      sanitized[key] = null
    } else if (value instanceof Date) {
      sanitized[key] = value
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      )
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeFirestoreData(value)
    }
  }
  
  return sanitized
}

// Rate limiting helper
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.attempts = new Map()
  }
  
  isAllowed(identifier) {
    const now = Date.now()
    const userAttempts = this.attempts.get(identifier) || []
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.windowMs
    )
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false
    }
    
    // Add new attempt
    recentAttempts.push(now)
    this.attempts.set(identifier, recentAttempts)
    
    return true
  }
  
  reset(identifier) {
    this.attempts.delete(identifier)
  }
  
  getRemainingAttempts(identifier) {
    const now = Date.now()
    const userAttempts = this.attempts.get(identifier) || []
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.windowMs
    )
    
    return Math.max(0, this.maxAttempts - recentAttempts.length)
  }
}