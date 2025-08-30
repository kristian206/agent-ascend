// CSRF Token Management
// Generates and validates CSRF tokens for state-changing operations

// Generate a random CSRF token
export function generateCSRFToken() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Store CSRF token in session storage
export function setCSRFToken(token) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrfToken', token)
  }
}

// Get CSRF token from session storage
export function getCSRFToken() {
  if (typeof window !== 'undefined') {
    let token = sessionStorage.getItem('csrfToken')
    if (!token) {
      token = generateCSRFToken()
      setCSRFToken(token)
    }
    return token
  }
  return null
}

// Validate CSRF token
export function validateCSRFToken(token) {
  if (typeof window !== 'undefined') {
    const storedToken = sessionStorage.getItem('csrfToken')
    return storedToken && storedToken === token
  }
  return false
}

// Clear CSRF token (on logout)
export function clearCSRFToken() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('csrfToken')
  }
}

// Add CSRF token to request headers
export function addCSRFHeader(headers = {}) {
  const token = getCSRFToken()
  if (token) {
    headers['X-CSRF-Token'] = token
  }
  return headers
}

// Hook for React components
export function useCSRFToken() {
  if (typeof window !== 'undefined') {
    return getCSRFToken()
  }
  return null
}