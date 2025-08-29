// Rate limiting utility to prevent abuse and ensure scalability

class RateLimiter {
  constructor() {
    this.limits = new Map()
    this.resetTimers = new Map()
  }

  // Check if action is allowed
  isAllowed(key, maxAttempts, windowMs) {
    const now = Date.now()
    const limit = this.limits.get(key)

    if (!limit) {
      // First attempt
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      // Set auto-reset timer
      const timer = setTimeout(() => {
        this.limits.delete(key)
        this.resetTimers.delete(key)
      }, windowMs)
      this.resetTimers.set(key, timer)
      
      return true
    }

    if (now > limit.resetTime) {
      // Window expired, reset
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      // Clear old timer and set new one
      if (this.resetTimers.has(key)) {
        clearTimeout(this.resetTimers.get(key))
      }
      const timer = setTimeout(() => {
        this.limits.delete(key)
        this.resetTimers.delete(key)
      }, windowMs)
      this.resetTimers.set(key, timer)
      
      return true
    }

    if (limit.count >= maxAttempts) {
      // Rate limit exceeded
      return false
    }

    // Increment counter
    limit.count++
    return true
  }

  // Get remaining attempts
  getRemainingAttempts(key, maxAttempts) {
    const limit = this.limits.get(key)
    if (!limit) return maxAttempts
    return Math.max(0, maxAttempts - limit.count)
  }

  // Get time until reset (in ms)
  getResetTime(key) {
    const limit = this.limits.get(key)
    if (!limit) return 0
    return Math.max(0, limit.resetTime - Date.now())
  }

  // Clear specific limit
  clear(key) {
    this.limits.delete(key)
    if (this.resetTimers.has(key)) {
      clearTimeout(this.resetTimers.get(key))
      this.resetTimers.delete(key)
    }
  }

  // Clear all limits
  clearAll() {
    this.limits.clear()
    for (const timer of this.resetTimers.values()) {
      clearTimeout(timer)
    }
    this.resetTimers.clear()
  }
}

// Create singleton instances for different rate limit types
const rateLimiters = {
  sales: new RateLimiter(),
  api: new RateLimiter(),
  dashboard: new RateLimiter()
}

// Rate limit configurations
const RATE_LIMITS = {
  SALES_PER_DAY: {
    max: 50,
    window: 24 * 60 * 60 * 1000 // 24 hours
  },
  SALES_PER_HOUR: {
    max: 10,
    window: 60 * 60 * 1000 // 1 hour
  },
  DASHBOARD_REFRESH: {
    max: 6,
    window: 60 * 1000 // 1 per 10 seconds (6 per minute)
  },
  API_CALLS: {
    max: 100,
    window: 60 * 1000 // 100 per minute
  },
  AUTH_ATTEMPTS: {
    max: 5,
    window: 15 * 60 * 1000 // 5 attempts per 15 minutes
  }
}

// Check if sales logging is allowed
export function canLogSale(userId) {
  const dailyKey = `sales_daily_${userId}`
  const hourlyKey = `sales_hourly_${userId}`
  
  const dailyAllowed = rateLimiters.sales.isAllowed(
    dailyKey,
    RATE_LIMITS.SALES_PER_DAY.max,
    RATE_LIMITS.SALES_PER_DAY.window
  )
  
  const hourlyAllowed = rateLimiters.sales.isAllowed(
    hourlyKey,
    RATE_LIMITS.SALES_PER_HOUR.max,
    RATE_LIMITS.SALES_PER_HOUR.window
  )
  
  return {
    allowed: dailyAllowed && hourlyAllowed,
    dailyRemaining: rateLimiters.sales.getRemainingAttempts(dailyKey, RATE_LIMITS.SALES_PER_DAY.max),
    hourlyRemaining: rateLimiters.sales.getRemainingAttempts(hourlyKey, RATE_LIMITS.SALES_PER_HOUR.max),
    resetIn: !dailyAllowed 
      ? rateLimiters.sales.getResetTime(dailyKey)
      : rateLimiters.sales.getResetTime(hourlyKey)
  }
}

// Check if dashboard refresh is allowed
export function canRefreshDashboard(userId) {
  const key = `dashboard_${userId}`
  const allowed = rateLimiters.dashboard.isAllowed(
    key,
    RATE_LIMITS.DASHBOARD_REFRESH.max,
    RATE_LIMITS.DASHBOARD_REFRESH.window
  )
  
  return {
    allowed,
    remaining: rateLimiters.dashboard.getRemainingAttempts(key, RATE_LIMITS.DASHBOARD_REFRESH.max),
    resetIn: rateLimiters.dashboard.getResetTime(key)
  }
}

// Check if API call is allowed
export function canMakeAPICall(endpoint) {
  const key = `api_${endpoint}`
  const allowed = rateLimiters.api.isAllowed(
    key,
    RATE_LIMITS.API_CALLS.max,
    RATE_LIMITS.API_CALLS.window
  )
  
  return {
    allowed,
    remaining: rateLimiters.api.getRemainingAttempts(key, RATE_LIMITS.API_CALLS.max),
    resetIn: rateLimiters.api.getResetTime(key)
  }
}

// Rate limit decorator for functions
export function withRateLimit(limitKey, maxAttempts, windowMs) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      const limiter = rateLimiters.api
      const key = `${limitKey}_${this.constructor.name}_${propertyKey}`
      
      if (!limiter.isAllowed(key, maxAttempts, windowMs)) {
        const resetIn = limiter.getResetTime(key)
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(resetIn / 1000)} seconds.`)
      }
      
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// Storage-based rate limiter for persistence across sessions
export class PersistentRateLimiter {
  constructor(storageKey) {
    this.storageKey = storageKey
  }

  isAllowed(userId, action, maxAttempts, windowMs) {
    if (typeof window === 'undefined') return true
    
    const key = `${this.storageKey}_${userId}_${action}`
    const now = Date.now()
    
    try {
      const stored = localStorage.getItem(key)
      if (!stored) {
        // First attempt
        localStorage.setItem(key, JSON.stringify({
          count: 1,
          resetTime: now + windowMs
        }))
        return true
      }
      
      const data = JSON.parse(stored)
      
      if (now > data.resetTime) {
        // Window expired
        localStorage.setItem(key, JSON.stringify({
          count: 1,
          resetTime: now + windowMs
        }))
        return true
      }
      
      if (data.count >= maxAttempts) {
        return false
      }
      
      // Increment
      data.count++
      localStorage.setItem(key, JSON.stringify(data))
      return true
      
    } catch (e) {
      console.warn('LocalStorage rate limiter error:', e)
      return true // Allow on error
    }
  }
}

export default rateLimiters