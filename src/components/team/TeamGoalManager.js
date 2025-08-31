'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import teamGoalService from '@/src/services/teamGoalService'
import { 
  Target, Plus, Edit2, Users, Calendar, TrendingUp, 
  Settings, Eye, EyeOff, UserCheck, UserX, AlertCircle,
  ChevronDown, ChevronUp, Check, X, Loader2, Info
} from 'lucide-react'

export default function TeamGoalManager({ teamId, teamData }) {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [expandedGoal, setExpandedGoal] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])

  // Check if user is a leader
  const isLeader = teamData?.leaderId === user?.uid || 
                   teamData?.coLeaders?.includes(user?.uid)

  useEffect(() => {
    if (teamId) {
      loadGoals()
      loadTeamMembers()
    }
  }, [teamId])

  const loadGoals = async () => {
    try {
      const goalsData = await teamGoalService.getTeamGoals(teamId, user.uid)
      setGoals(goalsData)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async () => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const { db } = await import('@/src/services/firebase')
      
      const membersQuery = query(
        collection(db, 'users'),
        where('teamId', '==', teamId)
      )
      const snapshot = await getDocs(membersQuery)
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTeamMembers(members)
    } catch (error) {
      console.error('Error loading team members:', error)
    }
  }

  if (!isLeader) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 text-yellow-400">
          <AlertCircle className="w-5 h-5" />
          <p>Only team leaders can manage team goals</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Team Goal Management</h2>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Goal
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          Set team goals, manage member participation, and track progress
        </p>
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No active team goals</p>
          <p className="text-gray-500 text-sm mt-1">Create your first team goal to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              expanded={expandedGoal === goal.id}
              onToggleExpand={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
              onEdit={() => setEditingGoal(goal)}
              teamMembers={teamMembers}
              onUpdate={loadGoals}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingGoal) && (
        <GoalModal
          goal={editingGoal}
          teamId={teamId}
          teamMembers={teamMembers}
          userId={user.uid}
          onClose={() => {
            setShowCreateModal(false)
            setEditingGoal(null)
          }}
          onSave={() => {
            setShowCreateModal(false)
            setEditingGoal(null)
            loadGoals()
          }}
        />
      )}
    </div>
  )
}

// Goal Card Component
function GoalCard({ goal, expanded, onToggleExpand, onEdit, teamMembers, onUpdate }) {
  const [updatingMembers, setUpdatingMembers] = useState(false)
  
  const progressPercentage = goal.progressPercentage || 
    Math.round((goal.currentValue / goal.targetValue) * 100)

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Goal Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{goal.title}</h3>
            <p className="text-gray-400 text-sm">{goal.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Team Progress</span>
            <span className="text-white font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Goal Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Target</p>
            <p className="text-white font-semibold">{goal.targetValue} {goal.type}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Current</p>
            <p className="text-white font-semibold">{goal.currentValue}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Deadline</p>
            <p className="text-white font-semibold">
              {new Date(goal.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-700 p-6 space-y-4">
          {/* Member Participation */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Member Participation</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Included Members</span>
                <span className="text-white font-medium">
                  {goal.includedMembers?.length || 0} / {teamMembers.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Leader Participates</span>
                <span className="text-white font-medium">
                  {goal.leaderParticipates ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Minimum per Member</span>
                <span className="text-white font-medium">{goal.minimumPerMember}</span>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Privacy Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {goal.visibility === 'percentage' ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-400">
                  Members see: {goal.visibility === 'percentage' ? 'Percentages only' : 'Full numbers'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">
                  Individual goals: {goal.allowMemberGoalSetting ? 'Can set above minimum' : 'Fixed at minimum'}
                </span>
              </div>
            </div>
          </div>

          {/* Member List */}
          <MemberInclusionList
            goal={goal}
            teamMembers={teamMembers}
            onUpdate={onUpdate}
            updating={updatingMembers}
            setUpdating={setUpdatingMembers}
          />
        </div>
      )}
    </div>
  )
}

// Member Inclusion List Component
function MemberInclusionList({ goal, teamMembers, onUpdate, updating, setUpdating }) {
  const [includedMembers, setIncludedMembers] = useState(goal.includedMembers || [])

  const handleToggleMember = (memberId) => {
    if (includedMembers.includes(memberId)) {
      setIncludedMembers(includedMembers.filter(id => id !== memberId))
    } else {
      setIncludedMembers([...includedMembers, memberId])
    }
  }

  const handleSaveChanges = async () => {
    setUpdating(true)
    try {
      await teamGoalService.updateTeamGoal(goal.id, {
        includedMembers,
        excludedMembers: teamMembers
          .filter(m => !includedMembers.includes(m.id))
          .map(m => m.id)
      }, goal.createdBy)
      await onUpdate()
    } catch (error) {
      console.error('Error updating members:', error)
      alert('Failed to update member participation')
    } finally {
      setUpdating(false)
    }
  }

  const hasChanges = JSON.stringify(includedMembers.sort()) !== 
                     JSON.stringify((goal.includedMembers || []).sort())

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">Team Members</h4>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={() => setIncludedMembers(goal.includedMembers || [])}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={updating}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {teamMembers.map(member => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleMember(member.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  includedMembers.includes(member.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                {includedMembers.includes(member.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
              <div>
                <p className="text-white font-medium">{member.name}</p>
                <p className="text-gray-400 text-xs">{member.role || 'Member'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {includedMembers.includes(member.id) ? (
                <UserCheck className="w-4 h-4 text-green-400" />
              ) : (
                <UserX className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Goal Create/Edit Modal
function GoalModal({ goal, teamId, teamMembers, userId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    type: goal?.type || 'sales',
    targetValue: goal?.targetValue || 0,
    startDate: goal?.startDate || new Date().toISOString().split('T')[0],
    endDate: goal?.endDate || '',
    includedMembers: goal?.includedMembers || teamMembers.map(m => m.id),
    leaderParticipates: goal?.leaderParticipates ?? true,
    visibility: goal?.visibility || 'percentage',
    allowMemberGoalSetting: goal?.allowMemberGoalSetting ?? true,
    distributionType: goal?.distributionType || 'equal'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (goal) {
        await teamGoalService.updateTeamGoal(goal.id, formData, userId)
      } else {
        await teamGoalService.createTeamGoal(formData, userId, teamId)
      }
      onSave()
    } catch (error) {
      console.error('Error saving goal:', error)
      alert('Failed to save goal: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">
            {goal ? 'Edit Team Goal' : 'Create Team Goal'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type and Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Goal Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sales">Sales</option>
                <option value="policies">Policies</option>
                <option value="calls">Calls</option>
                <option value="meetings">Meetings</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Value *
              </label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Include Members
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-900 rounded-lg p-3">
              {teamMembers.map(member => (
                <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          includedMembers: [...formData.includedMembers, member.id]
                        })
                      } else {
                        setFormData({
                          ...formData,
                          includedMembers: formData.includedMembers.filter(id => id !== member.id)
                        })
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-white text-sm">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Leader Participation */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.leaderParticipates}
                onChange={(e) => setFormData({ ...formData, leaderParticipates: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-300 text-sm">I will participate in this goal</span>
            </label>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Member Visibility
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="percentage">Show percentages only</option>
              <option value="numbers">Show full numbers</option>
              <option value="hidden">Hidden from members</option>
            </select>
          </div>

          {/* Allow Member Goal Setting */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowMemberGoalSetting}
                onChange={(e) => setFormData({ ...formData, allowMemberGoalSetting: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-300 text-sm">
                Allow members to set personal targets above minimum
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : (goal ? 'Update Goal' : 'Create Goal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}