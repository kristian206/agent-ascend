// Centralized error handling utilities

export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message)
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  FIREBASE_ERROR: 'FIREBASE_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED'
}

// User-friendly error messages
const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Connection issue. Please check your internet and try again.',
  [ERROR_CODES.FIREBASE_ERROR]: 'Unable to load data. Please try again.',
  [ERROR_CODES.AUTH_ERROR]: 'Authentication failed. Please sign in again.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment.',
  [ERROR_CODES.PERMISSION_ERROR]: 'You don\'t have permission to perform this action.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'Daily limit reached. Please try again tomorrow.'
}

// Get user-friendly error message
export function getUserMessage(error) {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code] || error.message
  }
  
  // Firebase specific errors
  if (error?.code) {
    switch (error.code) {
      case 'permission-denied':
        return ERROR_MESSAGES[ERROR_CODES.PERMISSION_ERROR]
      case 'unavailable':
        return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]
      case 'failed-precondition':
        return 'Database is being updated. Please try again in a moment.'
      default:
        return ERROR_MESSAGES[ERROR_CODES.FIREBASE_ERROR]
    }
  }
  
  return 'Something went wrong. Please try again.'
}

// Retry logic with exponential backoff
export async function withRetry(
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  onRetry = null
) {
  let lastError
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain errors
      if (
        error.code === ERROR_CODES.VALIDATION_ERROR ||
        error.code === ERROR_CODES.PERMISSION_ERROR ||
        error.code === ERROR_CODES.QUOTA_EXCEEDED
      ) {
        throw error
      }
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        if (onRetry) {
          onRetry(attempt + 1, delay)
        }
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// Safe async wrapper
export function safeAsync(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error('Async error:', error)
      throw error
    }
  }
}

// Error logger (can be extended to send to monitoring service)
export function logError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }
  
  console.error('Error logged:', errorInfo)
  
  // In production, send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
}