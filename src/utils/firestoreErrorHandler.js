// Firestore Permission Error Handler
// Provides user-friendly messages for permission denied errors

/**
 * Maps Firestore permission errors to user-friendly messages
 */
const PERMISSION_ERROR_MESSAGES = {
  // User profile errors
  'users': {
    read: 'Unable to load user profile. Please ensure you are logged in.',
    write: 'Unable to update profile. You can only edit your own profile.',
    create: 'Unable to create profile. Please try logging in again.',
    delete: 'Profile deletion is restricted. Please contact support.'
  },
  
  // Team errors
  'teams': {
    read: 'Unable to load team data. Please ensure you are logged in.',
    write: 'Only team leaders can modify team settings.',
    create: 'Unable to create team. Please ensure you are logged in.',
    delete: 'Only team leaders can delete teams.'
  },
  
  // Sales errors
  'sales': {
    read: 'Unable to load sales data. Please ensure you are logged in.',
    write: 'You can only edit your own sales or those of your team members if you are a leader.',
    create: 'Unable to log sale. Please ensure you are logged in.',
    delete: 'Sales records cannot be deleted. Please contact support.'
  },
  
  // Season errors
  'seasons': {
    read: 'Unable to load season data. Please ensure you are logged in.',
    write: 'Season management is restricted to administrators.',
    create: 'Season creation is restricted to administrators.',
    delete: 'Season deletion is restricted to administrators.'
  },
  
  'userSeasons': {
    read: 'Unable to load your season progress. Please ensure you are logged in.',
    write: 'Unable to update season progress. You can only modify your own data.',
    create: 'Unable to create season entry. Please ensure you are logged in.',
    delete: 'Season data cannot be deleted. Please contact support.'
  },
  
  'lifetimeProgression': {
    read: 'Unable to load lifetime stats. Please ensure you are logged in.',
    write: 'Unable to update lifetime stats. You can only modify your own data.',
    create: 'Unable to create lifetime stats. Please ensure you are logged in.',
    delete: 'Lifetime stats cannot be deleted. Please contact support.'
  },
  
  // Team goals errors
  'teamGoals': {
    read: 'Unable to load team goals. Please ensure you are logged in.',
    write: 'Only team leaders and co-leaders can modify team goals.',
    create: 'Unable to create team goal. Please ensure you are logged in.',
    delete: 'Goal deletion is restricted. Please contact support.'
  },
  
  'memberGoals': {
    read: 'Unable to load member goals. Please ensure you are logged in.',
    write: 'You can only modify your own goals or team goals if you are a leader.',
    create: 'Unable to create member goal. Please ensure you are logged in.',
    delete: 'Goal deletion is restricted. Please contact support.'
  },
  
  'goalProgress': {
    read: 'Unable to load goal progress. Please ensure you are logged in.',
    write: 'You can only update your own goal progress.',
    create: 'Unable to track goal progress. Please ensure you are logged in.',
    delete: 'Progress records cannot be deleted. Please contact support.'
  },
  
  // Activity errors
  'dailyActivities': {
    read: 'Unable to load daily activities. Please ensure you are logged in.',
    write: 'You can only update your own daily activities.',
    create: 'Unable to create daily activity. Please ensure you are logged in.',
    delete: 'Activity records cannot be deleted. Please contact support.'
  },
  
  'dailyIntentions': {
    read: 'Unable to load daily intentions. Please ensure you are logged in.',
    write: 'You can only modify your own daily intentions.',
    create: 'Unable to create daily intention. Please ensure you are logged in.',
    delete: 'Intention records cannot be deleted. Please contact support.'
  },
  
  'nightlyWraps': {
    read: 'Unable to load nightly wrap. Please ensure you are logged in.',
    write: 'You can only modify your own nightly wraps.',
    create: 'Unable to create nightly wrap. Please ensure you are logged in.',
    delete: 'Wrap records cannot be deleted. Please contact support.'
  },
  
  // Default fallback
  default: {
    read: 'Unable to load data. Please ensure you are logged in and have the necessary permissions.',
    write: 'Unable to save changes. Please ensure you have the necessary permissions.',
    create: 'Unable to create record. Please ensure you are logged in.',
    delete: 'Unable to delete record. This action may be restricted.'
  }
}

/**
 * Extracts collection name from Firestore error message
 */
function extractCollectionFromError(error) {
  // Try to extract collection name from error message
  const match = error.message?.match(/(?:collection|document)\s+['"]?([^'"\/\s]+)/i)
  return match ? match[1] : null
}

/**
 * Determines the operation type from the error context
 */
function determineOperation(error) {
  const message = error.message?.toLowerCase() || ''
  if (message.includes('create') || message.includes('add')) return 'create'
  if (message.includes('update') || message.includes('set')) return 'write'
  if (message.includes('delete') || message.includes('remove')) return 'delete'
  if (message.includes('get') || message.includes('read') || message.includes('list')) return 'read'
  return 'read' // Default to read operation
}

/**
 * Main error handler for Firestore permission errors
 */
export function handleFirestoreError(error, context = {}) {
  // Check if it's a permission error
  if (error.code !== 'permission-denied' && !error.message?.includes('permission')) {
    // Not a permission error, return original error
    return {
      message: error.message || 'An unexpected error occurred',
      code: error.code,
      isPermissionError: false,
      originalError: error
    }
  }
  
  // Extract collection and operation
  const collection = context.collection || extractCollectionFromError(error)
  const operation = context.operation || determineOperation(error)
  
  // Get user-friendly message
  const messages = PERMISSION_ERROR_MESSAGES[collection] || PERMISSION_ERROR_MESSAGES.default
  const message = messages[operation] || messages.read
  
  // Log for debugging (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.error('Firestore Permission Error:', {
      collection,
      operation,
      originalError: error,
      context
    })
  }
  
  return {
    message,
    code: 'permission-denied',
    isPermissionError: true,
    collection,
    operation,
    originalError: error,
    suggestion: getSuggestion(collection, operation)
  }
}

/**
 * Provides actionable suggestions for common permission errors
 */
function getSuggestion(collection, operation) {
  const suggestions = {
    'teams-write': 'If you need to modify team settings, ask your team leader for assistance.',
    'teams-create': 'Make sure you are logged in before creating a team.',
    'sales-write': 'You can only edit sales you created. Contact support if you believe this is an error.',
    'seasons-write': 'Season management is handled automatically. Contact support if you need assistance.',
    'userSeasons-create': 'Your season progress will be created automatically when you perform activities.',
    'teamGoals-write': 'Ask your team leader or co-leader to modify team goals.',
    'memberGoals-write': 'You can set your own targets. Ask your team leader to adjust team-wide settings.',
    'default': 'Please try logging out and back in. If the issue persists, contact support.'
  }
  
  const key = `${collection}-${operation}`
  return suggestions[key] || suggestions.default
}

/**
 * Wraps a Firestore operation with error handling
 */
export async function withFirestoreErrorHandling(operation, context = {}) {
  try {
    return await operation()
  } catch (error) {
    const handledError = handleFirestoreError(error, context)
    
    // If it's a permission error, show user-friendly notification
    if (handledError.isPermissionError && typeof window !== 'undefined') {
      // Import notification service dynamically to avoid circular dependencies
      const { createNotification } = await import('@/src/services/notifications')
      await createNotification(
        null, // System notification
        handledError.message,
        'error',
        {
          duration: 5000,
          action: handledError.suggestion ? {
            label: 'Learn More',
            onClick: () => alert(handledError.suggestion)
          } : null
        }
      )
    }
    
    throw handledError
  }
}

/**
 * React hook for handling Firestore errors in components
 */
export function useFirestoreError() {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const executeWithErrorHandling = useCallback(async (operation, context = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await withFirestoreErrorHandling(operation, context)
      return result
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  return {
    error,
    isLoading,
    executeWithErrorHandling,
    clearError,
    handleError: (error, context) => {
      const handledError = handleFirestoreError(error, context)
      setError(handledError)
      return handledError
    }
  }
}

// Export helper to check if user needs to re-authenticate
export function shouldReauthenticate(error) {
  return error.isPermissionError && 
         (error.message.includes('logged in') || 
          error.message.includes('sign in') ||
          error.code === 'unauthenticated')
}

// Export helper to check if user lacks required role
export function isRoleError(error) {
  return error.isPermissionError && 
         (error.message.includes('leader') || 
          error.message.includes('administrator') ||
          error.message.includes('own'))
}

export default handleFirestoreError