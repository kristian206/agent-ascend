import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

/**
 * Firebase configuration object constructed from environment variables.
 * This ensures sensitive configuration is not hardcoded in the source code.
 * 
 * @type {Object}
 * @property {string} apiKey - Firebase Web API key (public)
 * @property {string} authDomain - Firebase Auth domain for authentication
 * @property {string} projectId - Firebase project identifier
 * @property {string} storageBucket - Cloud Storage bucket for file uploads
 * @property {string} messagingSenderId - FCM sender ID for notifications
 * @property {string} appId - Firebase app identifier
 * @property {string} measurementId - Google Analytics measurement ID (optional)
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

/**
 * Validates Firebase configuration to ensure all required fields are present.
 * Throws an error if critical configuration is missing.
 * 
 * @param {Object} config - Firebase configuration object to validate
 * @param {string} config.apiKey - Firebase Web API key
 * @param {string} config.authDomain - Firebase Auth domain
 * @param {string} config.projectId - Firebase project ID
 * 
 * @returns {boolean} True if configuration is valid
 * @throws {Error} When required configuration fields are missing
 * 
 * @example
 * try {
 *   validateFirebaseConfig(firebaseConfig)
 *   console.log('Configuration is valid')
 * } catch (error) {
 *   console.error('Invalid configuration:', error.message)
 * }
 */
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

/**
 * Firebase Authentication service instance.
 * Provides user authentication, session management, and auth state monitoring.
 * 
 * @type {Auth}
 * @example
 * import { auth } from '@/src/services/firebase'
 * import { signInWithEmailAndPassword } from 'firebase/auth'
 * 
 * const user = await signInWithEmailAndPassword(auth, email, password)
 */
export { auth }

/**
 * Firestore Database service instance.
 * Provides NoSQL document database functionality with real-time updates.
 * 
 * @type {Firestore}
 * @example
 * import { db } from '@/src/services/firebase'
 * import { collection, getDocs } from 'firebase/firestore'
 * 
 * const snapshot = await getDocs(collection(db, 'users'))
 */
export { db }

/**
 * Firebase Cloud Storage service instance.
 * Provides file upload, download, and management capabilities.
 * 
 * @type {FirebaseStorage}
 * @example
 * import { storage } from '@/src/services/firebase'
 * import { ref, uploadBytes } from 'firebase/storage'
 * 
 * const storageRef = ref(storage, 'avatars/user123.jpg')
 * await uploadBytes(storageRef, file)
 */
export { storage }

/**
 * Firebase App instance.
 * The main Firebase application object that connects all services.
 * 
 * @type {FirebaseApp}
 * @default
 * @example
 * import app from '@/src/services/firebase'
 * import { getAnalytics } from 'firebase/analytics'
 * 
 * const analytics = getAnalytics(app)
 */
export default app