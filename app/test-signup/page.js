'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'
import { auth, db } from '@/src/services/firebase'

export default function TestSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [logs, setLogs] = useState([])
  const [createdUserId, setCreatedUserId] = useState(null)

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  const testSignup = async () => {
    setStatus('testing')
    setLogs([])
    setCreatedUserId(null)
    
    if (!email || !password || !name) {
      addLog('Please fill in all fields', 'error')
      setStatus('')
      return
    }

    try {
      addLog('Starting signup test...')
      
      // Step 1: Create Firebase Auth user
      addLog('Creating Firebase Auth user...')
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      addLog(`✅ Auth user created: ${user.uid}`, 'success')
      setCreatedUserId(user.uid)
      
      // Step 2: Generate unique ID
      const userId = Math.floor(100000 + Math.random() * 900000).toString()
      addLog(`Generated user ID: ${userId}`)
      
      // Step 3: Create member document
      addLog('Creating member document in Firestore...')
      const memberData = {
        userId: userId,
        email: email,
        name: name,
        role: 'member',
        xp: 0,
        level: 1,
        streak: 0,
        fullStreak: 0,
        participationStreak: 0,
        lifetimePoints: 0,
        seasonPoints: 0,
        todayPoints: 0,
        achievements: [],
        achievedMilestones: {},
        state: 'CA', // Default for testing
        profileComplete: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }
      
      await setDoc(doc(db, 'members', user.uid), memberData)
      addLog('✅ Member document created successfully', 'success')
      
      // Step 4: Sign out to test login
      await auth.signOut()
      addLog('Signed out. User can now log in.', 'success')
      
      setStatus('success')
      addLog('🎉 SIGNUP TEST COMPLETED SUCCESSFULLY!', 'success')
      
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error')
      addLog(`Error code: ${error.code}`, 'error')
      addLog(`Full error: ${JSON.stringify(error)}`, 'error')
      setStatus('error')
      
      // Log specific error types
      if (error.code === 'auth/email-already-in-use') {
        addLog('This email is already registered', 'warning')
      } else if (error.code === 'auth/weak-password') {
        addLog('Password is too weak (min 6 characters)', 'warning')
      } else if (error.code === 'permission-denied') {
        addLog('Firestore permission denied - check security rules', 'error')
      }
    }
  }

  const cleanupTestUser = async () => {
    if (!createdUserId) {
      addLog('No test user to clean up', 'warning')
      return
    }
    
    try {
      addLog('Cleaning up test user...')
      
      // Delete Firestore document
      await deleteDoc(doc(db, 'members', createdUserId))
      addLog('Deleted member document', 'success')
      
      // Note: Cannot delete Auth user from client side after signing out
      addLog('Note: Auth user must be deleted from Firebase Console', 'warning')
      
      setCreatedUserId(null)
    } catch (error) {
      addLog(`Cleanup error: ${error.message}`, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Signup Test Page</h1>
        
        {/* Test Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test New Account Creation</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Test User"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="test@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Min 12 characters"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must include uppercase, lowercase, number, and special character
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={testSignup}
                disabled={status === 'testing'}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {status === 'testing' ? 'Testing...' : 'Test Signup'}
              </button>
              
              {createdUserId && (
                <button
                  onClick={cleanupTestUser}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clean Up Test User
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Status */}
        {status && (
          <div className={`mb-6 p-4 rounded-lg ${
            status === 'success' ? 'bg-green-900/50 border border-green-600' :
            status === 'error' ? 'bg-red-900/50 border border-red-600' :
            'bg-blue-900/50 border border-blue-600'
          }`}>
            <div className="text-white font-semibold">
              {status === 'success' ? '✅ Signup Successful!' :
               status === 'error' ? '❌ Signup Failed' :
               '⏳ Testing...'}
            </div>
          </div>
        )}
        
        {/* Logs */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-400">No logs yet. Run a test to see results.</div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`flex justify-between p-2 rounded ${
                    log.type === 'error' ? 'bg-red-900/30 text-red-300' :
                    log.type === 'success' ? 'bg-green-900/30 text-green-300' :
                    log.type === 'warning' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-gray-700 text-gray-300'
                  }`}
                >
                  <span>{log.message}</span>
                  <span className="text-xs opacity-50">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
            <li>Enter a test name, email, and password</li>
            <li>Click "Test Signup" to create a new account</li>
            <li>Watch the logs for any errors</li>
            <li>If successful, try logging in with the new account</li>
            <li>Use "Clean Up" to remove test data when done</li>
          </ol>
        </div>
      </div>
    </div>
  )
}