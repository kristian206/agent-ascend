'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { db } from '@/src/services/firebase'
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import PageLayout from '@/src/components/layout/PageLayout'

export default function AdminPanel() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    activeToday: 0,
    totalXP: 0,
    totalSales: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedTeams, setSelectedTeams] = useState([])

  // Check if user has god role
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    if (userData && userData.role !== 'god') {
      router.push('/dashboard')
      return
    }
  }, [user, userData, router])

  // Fetch all users and teams
  useEffect(() => {
    if (userData?.role === 'god') {
      fetchData()
    }
  }, [userData])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch users
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const usersSnapshot = await getDocs(usersQuery)
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersData)

      // Fetch teams
      const teamsQuery = query(collection(db, 'teams'), orderBy('createdAt', 'desc'))
      const teamsSnapshot = await getDocs(teamsQuery)
      const teamsData = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTeams(teamsData)

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const activeToday = usersData.filter(u => {
        const lastLogin = u.lastLogin?.toDate?.() || u.lastLogin
        return lastLogin && new Date(lastLogin) >= today
      }).length

      const totalXP = usersData.reduce((sum, u) => sum + (u.xp || 0), 0)
      const totalSales = usersData.reduce((sum, u) => sum + (u.totalSales || 0), 0)

      setStats({
        totalUsers: usersData.length,
        totalTeams: teamsData.length,
        activeToday,
        totalXP,
        totalSales
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) return
    
    try {
      await deleteDoc(doc(db, 'users', userId))
      setUsers(users.filter(u => u.id !== userId))
      alert('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!confirm(`Are you sure you want to delete team ${teamId}? This action cannot be undone.`)) return
    
    try {
      await deleteDoc(doc(db, 'teams', teamId))
      setTeams(teams.filter(t => t.id !== teamId))
      alert('Team deleted successfully')
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Failed to delete team')
    }
  }

  const handleBulkDeleteUsers = async () => {
    if (!confirm(`Delete ${selectedUsers.length} users? This cannot be undone.`)) return
    
    try {
      await Promise.all(selectedUsers.map(userId => 
        deleteDoc(doc(db, 'users', userId))
      ))
      setUsers(users.filter(u => !selectedUsers.includes(u.id)))
      setSelectedUsers([])
      alert(`${selectedUsers.length} users deleted`)
    } catch (error) {
      console.error('Error bulk deleting users:', error)
      alert('Failed to delete some users')
    }
  }

  const handleBulkDeleteTeams = async () => {
    if (!confirm(`Delete ${selectedTeams.length} teams? This cannot be undone.`)) return
    
    try {
      await Promise.all(selectedTeams.map(teamId => 
        deleteDoc(doc(db, 'teams', teamId))
      ))
      setTeams(teams.filter(t => !selectedTeams.includes(t.id)))
      setSelectedTeams([])
      alert(`${selectedTeams.length} teams deleted`)
    } catch (error) {
      console.error('Error bulk deleting teams:', error)
      alert('Failed to delete some teams')
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      alert('User role updated')
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const handleResetUserPassword = async (userId, email) => {
    // In production, trigger password reset email
    alert(`Password reset would be sent to ${email}`)
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.userId?.includes(searchTerm)
  )

  const filteredTeams = teams.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.joinCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!userData || userData.role !== 'god') {
    return null
  }

  return (
    <PageLayout user={userData}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src="/images/logo/agent-ascend-logo.svg" alt="Admin" className="w-10 h-10" />
            <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
          </div>
          <p className="text-text-gray-300">God Mode Active - Full System Control</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="glass p-4 rounded-xl">
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <div className="text-sm text-text-gray-300">Total Users</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-2xl font-bold text-primary">{stats.totalTeams}</div>
            <div className="text-sm text-text-gray-300">Total Teams</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-2xl font-bold text-success">{stats.activeToday}</div>
            <div className="text-sm text-text-gray-300">Active Today</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-2xl font-bold text-warning">{stats.totalXP.toLocaleString()}</div>
            <div className="text-sm text-text-gray-300">Total XP</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-2xl font-bold text-primary">${stats.totalSales.toLocaleString()}</div>
            <div className="text-sm text-text-gray-300">Total Sales</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'users' 
                ? 'glass-brand text-white' 
                : 'glass text-text-secondary hover:text-primary'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'teams' 
                ? 'glass-brand text-white' 
                : 'glass text-text-secondary hover:text-primary'
            }`}
          >
            Teams ({teams.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg glass border border-primary-200/20 focus:border-primary-400 outline-none"
          />
        </div>

        {/* Bulk Actions */}
        {((activeTab === 'users' && selectedUsers.length > 0) || 
          (activeTab === 'teams' && selectedTeams.length > 0)) && (
          <div className="mb-4 p-4 glass rounded-lg flex items-center justify-between">
            <span className="text-sm text-text-gray-300">
              {activeTab === 'users' 
                ? `${selectedUsers.length} users selected`
                : `${selectedTeams.length} teams selected`
              }
            </span>
            <button
              onClick={activeTab === 'users' ? handleBulkDeleteUsers : handleBulkDeleteTeams}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-text-gray-300">Loading data...</p>
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <div key={user.id} className="glass p-4 rounded-lg hover:glass-hover transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
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
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">{user.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100/20 text-primary-400">
                              {user.role || 'member'}
                            </span>
                            {user.role === 'god' && (
                              <img src="/images/badges/streaks/gold.svg" alt="God" className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-sm text-text-gray-300">{user.email}</div>
                          <div className="flex gap-4 mt-1 text-xs text-text-gray-400">
                            <span>ID: {user.userId}</span>
                            <span>Level {user.level}</span>
                            <span>{user.xp} XP</span>
                            <span>Streak: {user.streak}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role || 'member'}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="px-2 py-1 rounded glass text-sm"
                          disabled={user.role === 'god'}
                        >
                          <option value="member">Member</option>
                          <option value="leader">Leader</option>
                          <option value="admin">Admin</option>
                          {user.role === 'god' && <option value="god">God</option>}
                        </select>
                        <button
                          onClick={() => handleResetUserPassword(user.id, user.email)}
                          className="px-3 py-1 text-sm glass hover:glass-brand rounded-lg transition-all"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all"
                          disabled={user.role === 'god'}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="space-y-2">
                {filteredTeams.map(team => (
                  <div key={team.id} className="glass p-4 rounded-lg hover:glass-hover transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeams([...selectedTeams, team.id])
                            } else {
                              setSelectedTeams(selectedTeams.filter(id => id !== team.id))
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-primary">{team.name}</div>
                          <div className="text-sm text-text-gray-300">{team.description}</div>
                          <div className="flex gap-4 mt-1 text-xs text-text-gray-400">
                            <span>Code: {team.joinCode}</span>
                            <span>Members: {team.members?.length || 0}</span>
                            <span>Points: {team.totalPoints || 0}</span>
                            <span>Created: {new Date(team.createdAt?.toDate?.() || team.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/team?id=${team.id}`)}
                          className="px-3 py-1 text-sm glass hover:glass-brand rounded-lg transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="px-3 py-1 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}