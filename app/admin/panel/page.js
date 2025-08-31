'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/src/services/firebase'
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc, query, orderBy, limit } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import PageLayout from '@/src/components/layout/PageLayout'
import { Users, Trash2, Shield, Edit, UserX, Users as TeamIcon, Activity, TrendingUp, Settings, Database, RefreshCw, Download, Search, Filter } from 'lucide-react'

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Data states
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalSales: 0,
    activeToday: 0
  })
  
  // UI states
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Check admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        
        if (userData?.isAdmin || userData?.godMode || userData?.role === 'super_admin') {
          setIsAdmin(true)
          setCurrentUser(user)
          loadData()
        } else {
          // Not admin, redirect
          router.push('/dashboard')
        }
      } else {
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Load all data
  const loadData = async () => {
    setLoading(true)
    try {
      // Load users
      const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsers(usersData)
      
      // Load teams
      const teamsSnapshot = await getDocs(collection(db, 'teams'))
      const teamsData = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTeams(teamsData)
      
      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const activeToday = usersData.filter(user => {
        const lastLogin = user.lastLogin?.toDate?.() || user.lastLogin
        return lastLogin && new Date(lastLogin) >= today
      }).length
      
      const totalSales = usersData.reduce((sum, user) => sum + (user.totalSales || 0), 0)
      
      setStats({
        totalUsers: usersData.length,
        totalTeams: teamsData.length,
        totalSales,
        activeToday
      })
    } catch (error) {
      // Error loading data
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!userId) return
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId))
      
      // Delete related data
      const collections = ['sales', 'activities', 'notifications', 'dailyIntentions', 'nightlyWraps']
      for (const col of collections) {
        const q = query(collection(db, col))
        const snapshot = await getDocs(q)
        const batch = []
        snapshot.forEach(doc => {
          if (doc.data().userId === userId) {
            batch.push(deleteDoc(doc.ref))
          }
        })
        await Promise.all(batch)
      }
      
      // Update UI
      setUsers(users.filter(u => u.id !== userId))
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    } catch (error) {
      // Error deleting user
    }
  }

  // Delete team
  const handleDeleteTeam = async (teamId) => {
    if (!teamId) return
    
    try {
      // Delete team document
      await deleteDoc(doc(db, 'teams', teamId))
      
      // Update users to remove team reference
      const updates = users
        .filter(u => u.teamId === teamId)
        .map(u => updateDoc(doc(db, 'users', u.id), { teamId: null, teamName: null }))
      
      await Promise.all(updates)
      
      // Update UI
      setTeams(teams.filter(t => t.id !== teamId))
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      loadData() // Reload to update user data
    } catch (error) {
      // Error deleting team
    }
  }

  // Bulk delete users
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return
    
    try {
      const deletions = selectedUsers.map(userId => handleDeleteUser(userId))
      await Promise.all(deletions)
      setSelectedUsers([])
    } catch (error) {
      // Error in bulk delete
    }
  }

  // Export data
  const exportData = () => {
    const data = {
      users: users,
      teams: teams,
      exportDate: new Date().toISOString(),
      stats: stats
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agency-max-plus-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading admin panel...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Access denied. Admin privileges required.</div>
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8" />
                Admin Control Panel
              </h1>
              <p className="text-purple-100 mt-2">God Mode Activated</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="bg-gray-700 hover:bg-gray-650 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="bg-gray-700 hover:bg-gray-650 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Teams</p>
                <p className="text-2xl font-bold text-white">{stats.totalTeams}</p>
              </div>
              <TeamIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-white">{stats.totalSales}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Today</p>
                <p className="text-2xl font-bold text-white">{stats.activeToday}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'teams' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Teams ({teams.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {selectedUsers.length > 0 && (
              <div className="bg-red-600 p-4 flex items-center justify-between">
                <span className="text-white">{selectedUsers.length} users selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">State</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Team</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sales</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Points</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        <div className="flex items-center gap-2">
                          {user.name || 'Unknown'}
                          {user.isAdmin && (
                            <span className="bg-purple-600 text-xs px-2 py-1 rounded">ADMIN</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-200">{user.email}</td>
                      <td className="px-4 py-3 text-gray-200">{user.state || '-'}</td>
                      <td className="px-4 py-3 text-gray-200">{user.teamName || '-'}</td>
                      <td className="px-4 py-3 text-gray-200">{user.totalSales || 0}</td>
                      <td className="px-4 py-3 text-gray-200">{user.points || 0}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setDeleteTarget({ type: 'user', id: user.id, name: user.name })
                            setShowDeleteConfirm(true)
                          }}
                          className="text-red-400 hover:text-red-300"
                          disabled={user.isAdmin}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Teams Table */}
        {activeTab === 'teams' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Team Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Leader</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Members</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Points</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-white font-medium">{team.name}</td>
                      <td className="px-4 py-3 text-gray-200">{team.leaderName || '-'}</td>
                      <td className="px-4 py-3 text-gray-200">{team.memberCount || 0}</td>
                      <td className="px-4 py-3 text-gray-200">{team.totalPoints || 0}</td>
                      <td className="px-4 py-3 text-gray-200">
                        {team.createdAt?.toDate?.()?.toLocaleDateString() || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setDeleteTarget({ type: 'team', id: team.id, name: team.name })
                            setShowDeleteConfirm(true)
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-8500 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-200 mb-6">
                Are you sure you want to delete {deleteTarget?.type} "{deleteTarget?.name}"? 
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (deleteTarget?.type === 'user') {
                      handleDeleteUser(deleteTarget.id)
                    } else if (deleteTarget?.type === 'team') {
                      handleDeleteTeam(deleteTarget.id)
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteTarget(null)
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}