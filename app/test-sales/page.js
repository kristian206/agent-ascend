'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { useRealtimeUser } from '@/src/hooks/useRealtimeUser'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { updateUserStats } from '@/src/utils/denormalization'
import SalesLogger from '@/src/components/sales/SalesLogger'

export default function TestSalesPage() {
  const { user } = useAuth()
  const { userData, isRealtime } = useRealtimeUser()
  const [logs, setLogs] = useState([])
  const [beforePoints, setBeforePoints] = useState(null)
  const [afterPoints, setAfterPoints] = useState(null)

  useEffect(() => {
    if (userData) {
      setAfterPoints({
        todayPoints: userData.todayPoints || 0,
        seasonPoints: userData.seasonPoints || 0,
        lifetimePoints: userData.lifetimePoints || 0,
        xp: userData.xp || 0
      })
    }
  }, [userData])

  const captureBeforeState = () => {
    if (userData) {
      setBeforePoints({
        todayPoints: userData.todayPoints || 0,
        seasonPoints: userData.seasonPoints || 0,
        lifetimePoints: userData.lifetimePoints || 0,
        xp: userData.xp || 0
      })
    }
  }

  const testQuickSale = async (productType, productName, points) => {
    if (!user) return

    captureBeforeState()
    const timestamp = new Date().toLocaleTimeString()
    
    setLogs(prev => [...prev, {
      type: 'info',
      message: `Testing ${productName} sale (+${points} points)...`,
      timestamp
    }])

    try {
      // Create sale document
      const saleData = {
        userId: user.uid,
        userName: userData?.name || 'Test User',
        clientFirstName: 'Test Client',
        products: { [productType]: 1 },
        productsSummary: `1 ${productName}`,
        totalItems: 1,
        totalCommission: 50,
        totalPoints: points,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      }

      const saleDoc = await addDoc(collection(db, 'sales'), saleData)
      
      setLogs(prev => [...prev, {
        type: 'success',
        message: `Sale document created: ${saleDoc.id}`,
        timestamp: new Date().toLocaleTimeString()
      }])

      // Call updateUserStats directly
      await updateUserStats(user.uid, points, 'sale')
      
      setLogs(prev => [...prev, {
        type: 'success',
        message: `Called updateUserStats with ${points} points`,
        timestamp: new Date().toLocaleTimeString()
      }])

      // Wait a moment for real-time update
      setTimeout(() => {
        const pointsChanged = afterPoints && beforePoints && (
          afterPoints.todayPoints !== beforePoints.todayPoints ||
          afterPoints.seasonPoints !== beforePoints.seasonPoints ||
          afterPoints.lifetimePoints !== beforePoints.lifetimePoints ||
          afterPoints.xp !== beforePoints.xp
        )

        if (pointsChanged) {
          setLogs(prev => [...prev, {
            type: 'success',
            message: `✅ Dashboard updated! All points increased by ${points}`,
            timestamp: new Date().toLocaleTimeString()
          }])
        } else {
          setLogs(prev => [...prev, {
            type: 'warning',
            message: '⚠️ Waiting for real-time update...',
            timestamp: new Date().toLocaleTimeString()
          }])
        }
      }, 2000)

    } catch (error) {
      setLogs(prev => [...prev, {
        type: 'error',
        message: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }])
    }
  }

  const checkFirestore = async () => {
    if (!user) return

    try {
      const userDoc = await getDoc(doc(db, 'members', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setLogs(prev => [...prev, {
          type: 'info',
          message: `Firestore data: todayPoints=${data.todayPoints}, seasonPoints=${data.seasonPoints}, lifetimePoints=${data.lifetimePoints}, xp=${data.xp}`,
          timestamp: new Date().toLocaleTimeString()
        }])
      }
    } catch (error) {
      setLogs(prev => [...prev, {
        type: 'error',
        message: `Firestore check failed: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }])
    }
  }

  if (!user) {
    return <div className="p-8">Please login to test sales</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Sales Points Test Page</h1>
        
        {/* Connection Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connection Status</h2>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isRealtime ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-white">{isRealtime ? 'Real-time Connected' : 'Not Connected'}</span>
          </div>
        </div>

        {/* Current Points Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Points (Live)</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-sm text-gray-400">Today Points</div>
              <div className="text-2xl font-bold text-green-400">
                {userData?.todayPoints || 0}
                {beforePoints && userData?.todayPoints > beforePoints.todayPoints && (
                  <span className="text-sm text-green-400 ml-2">
                    (+{userData.todayPoints - beforePoints.todayPoints})
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-sm text-gray-400">Season Points</div>
              <div className="text-2xl font-bold text-blue-400">
                {userData?.seasonPoints || 0}
                {beforePoints && userData?.seasonPoints > beforePoints.seasonPoints && (
                  <span className="text-sm text-blue-400 ml-2">
                    (+{userData.seasonPoints - beforePoints.seasonPoints})
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-sm text-gray-400">Lifetime Points</div>
              <div className="text-2xl font-bold text-purple-400">
                {userData?.lifetimePoints || 0}
                {beforePoints && userData?.lifetimePoints > beforePoints.lifetimePoints && (
                  <span className="text-sm text-purple-400 ml-2">
                    (+{userData.lifetimePoints - beforePoints.lifetimePoints})
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-sm text-gray-400">XP</div>
              <div className="text-2xl font-bold text-yellow-400">
                {userData?.xp || 0}
                {beforePoints && userData?.xp > beforePoints.xp && (
                  <span className="text-sm text-yellow-400 ml-2">
                    (+{userData.xp - beforePoints.xp})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Test Sales</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => testQuickSale('car', 'Auto', 10)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🚗 Auto Sale (+10 pts)
            </button>
            <button
              onClick={() => testQuickSale('home', 'Home', 15)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🏠 Home Sale (+15 pts)
            </button>
            <button
              onClick={() => testQuickSale('life', 'Life', 20)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              ❤️ Life Sale (+20 pts)
            </button>
            <button
              onClick={() => testQuickSale('other', 'Other', 10)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              📋 Other Sale (+10 pts)
            </button>
          </div>
          <div className="flex gap-3">
            <SalesLogger onSaleLogged={(sale) => {
              setLogs(prev => [...prev, {
                type: 'success',
                message: `Sale logged via UI: ${sale.productsSummary} (+${sale.totalPoints} pts)`,
                timestamp: new Date().toLocaleTimeString()
              }])
            }} />
            <button
              onClick={checkFirestore}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Check Firestore
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Test Logs */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-400">No logs yet. Try logging a sale above.</div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded flex justify-between ${
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

        {/* Expected Behavior */}
        <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Expected Behavior:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
            <li>Click a test sale button (e.g., Home +15)</li>
            <li>ALL four point values should increase by that amount</li>
            <li>Changes should appear within 1-2 seconds</li>
            <li>Dashboard should also update in real-time</li>
            <li>Check Firestore to verify database values</li>
          </ol>
        </div>
      </div>
    </div>
  )
}