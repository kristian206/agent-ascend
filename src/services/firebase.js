import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Security fix: Using environment variables instead of hardcoded values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Validate configuration
function validateFirebaseConfig(config) {
  const requiredFields = ['apiKey', 'authDomain', 'projectId']
  const missingFields = requiredFields.filter(field => !config[field])
  
  if (missingFields.length > 0) {
    const errorMsg = `Firebase configuration is incomplete. Missing fields: ${missingFields.join(', ')}. Check environment variables.`
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
  
  console.log('Firebase configuration validated successfully')
  return true
}

let app, auth, db, storage

try {
  // Validate before initializing
  validateFirebaseConfig(firebaseConfig)
  
  // Initialize Firebase
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  
  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Firebase initialization failed:', error)
  console.error('Error details:', {
    errorMessage: error.message,
    config: {
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain,
      hasProjectId: !!firebaseConfig.projectId,
      environment: typeof window !== 'undefined' ? 'client' : 'server'
    }
  })
  throw error
}

export { auth, db, storage }
export default app