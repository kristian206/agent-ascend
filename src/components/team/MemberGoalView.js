'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import teamGoalService from '@/src/services/teamGoalService'
import { 
  Target, TrendingUp, Calendar, Award, ChevronRight,
  Edit2, Save, X, Info, Users, Lock
} from 'lucide-react'

export default function MemberGoalView() {
  const { user } = useAuth()
  const [memberGoals, setMemberGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTarget, setEditingTarget] = useState(null)
  const [newTarget, setNewTarget] = useState('')

  useEffect(() => {
    if (user?.uid) {
      loadMemberGoals()
    }
  }, [user, loadMemberGoals])

  const loadMemberGoals = useCallback(async () => {
    try {
      const goals = await teamGoalService.getMemberGoals(user.uid)
      setMemberGoals(goals)
    } catch (error) {
      console.error('Error loading member goals:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleUpdateTarget = async (goalId) => {
    const goal = memberGoals.find(g => g.id === goalId)
    const target = parseInt(newTarget)
    
    if (target < goal.minimumTarget) {
      alert(`Target must be at least ${goal.minimumTarget}`)
      return
    }

    try {
      await teamGoalService.updatePersonalTarget(goalId, target, user.uid)
      await loadMemberGoals()
      setEditingTarget(null)
      setNewTarget('')
    } catch (error) {
      console.error('Error updating target:', error)
      alert('Failed to update personal target')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">My Team Goals</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Track your progress and set personal targets for team goals
        </p>
      </div>

      {/* Goals List */}
      {memberGoals.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No active goals assigned</p>
          <p className="text-gray-500 text-sm mt-1">
            Your team leader will assign goals to you
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {memberGoals.map(goal => (
            <MemberGoalCard
              key={goal.id}
              goal={goal}
              isEditing={editingTarget === goal.id}
              onEdit={() => {
                setEditingTarget(goal.id)
                setNewTarget(goal.personalTarget.toString())
              }}
              onCancelEdit={() => {
                setEditingTarget(null)
                setNewTarget('')
              }}
              onSaveEdit={() => handleUpdateTarget(goal.id)}
              newTarget={newTarget}
              setNewTarget={setNewTarget}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MemberGoalCard({ 
  goal, 
  isEditing, 
  onEdit, 
  onCancelEdit, 
  onSaveEdit, 
  newTarget, 
  setNewTarget 
}) {
  const progressPercentage = goal.progressPercentage || 0
  const isCompleted = goal.status === 'completed'
  const daysLeft = goal.teamGoal?.endDate ? 
    Math.max(0, Math.ceil((new Date(goal.teamGoal.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 
    null

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6">
        {/* Goal Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {goal.teamGoal?.title || 'Team Goal'}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                Type: <span className="text-gray-300">{goal.teamGoal?.type}</span>
              </span>
              {daysLeft !== null && (
                <span className="text-gray-400">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {daysLeft} days left
                </span>
              )}
            </div>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/50 border border-green-700 rounded-lg">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Completed</span>
            </div>
          )}
        </div>

        {/* Personal Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">My Progress</span>
            <span className="text-white font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-500 to-green-400' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-400'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{goal.currentValue} / {goal.personalTarget}</span>
            <span>Min: {goal.minimumTarget}</span>
          </div>
        </div>

        {/* Personal Target Setting */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">Personal Target</h4>
            {!isEditing && !isCompleted && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                min={goal.minimumTarget}
                className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Min: ${goal.minimumTarget}`}
              />
              <button
                onClick={onSaveEdit}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Your Target</span>
                <span className="text-white font-semibold">{goal.personalTarget}</span>
              </div>
              {goal.personalTarget > goal.minimumTarget && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {Math.round(((goal.personalTarget - goal.minimumTarget) / goal.minimumTarget) * 100)}% 
                    above minimum
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Progress (Privacy Controlled) */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Team Progress</span>
            </div>
            <div className="flex items-center gap-2">
              {goal.teamGoal?.progressPercentage !== undefined ? (
                <>
                  <span className="text-sm font-medium text-white">
                    {goal.teamGoal.progressPercentage}%
                  </span>
                  <Lock className="w-3 h-3 text-gray-500" title="Actual numbers hidden" />
                </>
              ) : (
                <span className="text-sm text-gray-500">Hidden</span>
              )}
            </div>
          </div>
        </div>

        {/* Performance Rating */}
        {goal.performanceRating && (
          <div className="mt-3">
            <PerformanceIndicator rating={goal.performanceRating} />
          </div>
        )}
      </div>
    </div>
  )
}

function PerformanceIndicator({ rating }) {
  const config = {
    exceeding: {
      color: 'text-green-400',
      bg: 'bg-green-900/50',
      border: 'border-green-700',
      label: 'Exceeding Target',
      icon: TrendingUp
    },
    ontrack: {
      color: 'text-blue-400',
      bg: 'bg-blue-900/50',
      border: 'border-blue-700',
      label: 'On Track',
      icon: ChevronRight
    },
    behind: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/50',
      border: 'border-yellow-700',
      label: 'Behind Schedule',
      icon: Info
    },
    atrisk: {
      color: 'text-red-400',
      bg: 'bg-red-900/50',
      border: 'border-red-700',
      label: 'At Risk',
      icon: Info
    }
  }

  const style = config[rating] || config.ontrack
  const Icon = style.icon

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${style.bg} border ${style.border}`}>
      <Icon className={`w-4 h-4 ${style.color}`} />
      <span className={`text-sm font-medium ${style.color}`}>{style.label}</span>
    </div>
  )
}