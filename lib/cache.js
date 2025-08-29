// Client-side caching utility for performance optimization

class CacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.cacheTimers = new Map()
  }

  // Set cache with TTL (time to live in milliseconds)
  set(key, value, ttl = 60000) { // Default 1 minute
    this.memoryCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })

    // Clear existing timer if any
    if (this.cacheTimers.has(key)) {
      clearTimeout(this.cacheTimers.get(key))
    }

    // Set auto-cleanup timer
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl)
    this.cacheTimers.set(key, timer)

    // Also store in sessionStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`cache_${key}`, JSON.stringify({
          value,
          expires: Date.now() + ttl
        }))
      } catch (e) {
        // SessionStorage might be full or disabled
        console.warn('SessionStorage unavailable:', e)
      }
    }
  }

  // Get from cache
  get(key) {
    // Try memory cache first
    const cached = this.memoryCache.get(key)
    if (cached) {
      const age = Date.now() - cached.timestamp
      if (age < cached.ttl) {
        return cached.value
      }
      this.delete(key)
    }

    // Try sessionStorage as fallback
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`cache_${key}`)
        if (stored) {
          const { value, expires } = JSON.parse(stored)
          if (expires > Date.now()) {
            // Restore to memory cache
            this.set(key, value, expires - Date.now())
            return value
          }
          sessionStorage.removeItem(`cache_${key}`)
        }
      } catch (e) {
        console.warn('Error reading from sessionStorage:', e)
      }
    }

    return null
  }

  // Check if cache exists and is valid
  has(key) {
    return this.get(key) !== null
  }

  // Delete from cache
  delete(key) {
    this.memoryCache.delete(key)
    
    if (this.cacheTimers.has(key)) {
      clearTimeout(this.cacheTimers.get(key))
      this.cacheTimers.delete(key)
    }

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(`cache_${key}`)
      } catch (e) {
        // Ignore
      }
    }
  }

  // Clear all cache
  clear() {
    this.memoryCache.clear()
    
    // Clear all timers
    for (const timer of this.cacheTimers.values()) {
      clearTimeout(timer)
    }
    this.cacheTimers.clear()

    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(sessionStorage)
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (e) {
        // Ignore
      }
    }
  }

  // Get cache size
  size() {
    return this.memoryCache.size
  }
}

// Create singleton instance
const cache = new CacheManager()

// Cache wrapper for async functions
export async function withCache(key, fn, ttl = 60000) {
  // Check cache first
  const cached = cache.get(key)
  if (cached !== null) {
    return cached
  }

  // Execute function and cache result
  try {
    const result = await fn()
    cache.set(key, result, ttl)
    return result
  } catch (error) {
    // Don't cache errors
    throw error
  }
}

// Debounce utility
export function debounce(fn, delay = 300) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

// Throttle utility
export function throttle(fn, limit = 1000) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Batch operations utility
export class BatchProcessor {
  constructor(processFn, maxBatchSize = 10, maxWaitTime = 100) {
    this.processFn = processFn
    this.maxBatchSize = maxBatchSize
    this.maxWaitTime = maxWaitTime
    this.queue = []
    this.timer = null
  }

  add(item) {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject })
      
      if (this.queue.length >= this.maxBatchSize) {
        this.flush()
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.maxWaitTime)
      }
    })
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.maxBatchSize)
    const items = batch.map(b => b.item)

    try {
      const results = await this.processFn(items)
      batch.forEach((b, i) => b.resolve(results[i]))
    } catch (error) {
      batch.forEach(b => b.reject(error))
    }

    // Process remaining items if any
    if (this.queue.length > 0) {
      this.flush()
    }
  }
}

export default cache