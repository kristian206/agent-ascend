'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/src/services/firebase'
import { doc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import AvatarSelectorV2 from '@/src/components/common/AvatarSelectorV2'
import { 
  ChevronRight, ChevronLeft, User, Users, Target, Settings, 
  Sparkles, Trophy, TrendingUp, Bell, Shield, Check, Plus,
  ArrowRight, Play, RefreshCw
} from 'lucide-react'

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'profile', title: 'Profile Setup', icon: User },
  { id: 'team', title: 'Join Team', icon: Users },
  { id: 'goals', title: 'Set Goals', icon: Target },
  { id: 'tour', title: 'Platform Tour', icon: Play },
  { id: 'action', title: 'First Action', icon: Trophy },
  { id: 'preferences', title: 'Preferences', icon: Settings }
]

const IMPROVEMENT_OPTIONS = [
  { id: 'closing', label: 'Closing more deals', icon: '🎯' },
  { id: 'leads', label: 'Generating quality leads', icon: '🔍' },
  { id: 'followup', label: 'Better follow-up process', icon: '📞' },
  { id: 'time', label: 'Time management', icon: '⏰' },
  { id: 'product', label: 'Product knowledge', icon: '📚' },
  { id: 'relationships', label: 'Building relationships', icon: '🤝' }
]

const TOUR_STEPS = [
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Track your daily progress, sales, and achievements',
    selector: '.dashboard-main'
  },
  {
    id: 'sales',
    title: 'Log Sales',
    description: 'Quick and easy sales logging with automatic point calculation',
    selector: '.sales-logger'
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    description: 'See how you rank against your team and company',
    selector: '.leaderboard-widget'
  },
  {
    id: 'achievements',
    title: 'Achievements',
    description: 'Unlock badges and rewards as you hit milestones',
    selector: '.achievements-panel'
  }
]

export default function OnboardingWizard({ user }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState([])
  const [tourStep, setTourStep] = useState(0)
  const [tourActive, setTourActive] = useState(false)
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Profile
    displayName: '',
    bio: '',
    location: '',
    avatarUrl: null,
    avatarData: null,
    avatarType: 'generated', // 'generated' or 'custom'
    
    // Team
    teamId: null,
    teamAction: 'join', // 'join', 'create', 'skip'
    newTeamName: '',
    newTeamDescription: '',
    
    // Goals
    monthlySalesTarget: '',
    improvementAreas: [],
    personalGoal: '',
    
    // Preferences
    emailNotifications: true,
    inAppNotifications: true,
    notificationFrequency: 'realtime', // 'realtime', 'daily', 'weekly'
    profileVisibility: 'team', // 'public', 'team', 'private'
    dataSharing: false,
    marketingEmails: true
  })

  // Load available teams
  useEffect(() => {
    loadAvailableTeams()
  }, [])

  const loadAvailableTeams = async () => {
    try {
      const teamsRef = collection(db, 'teams')
      // Simplified query that matches our composite index
      const q = query(
        teamsRef, 
        where('isActive', '==', true),
        where('memberCount', '<', 50)
      )
      const snapshot = await getDocs(q)
      
      const availableTeams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).slice(0, 5) // Show top 5 teams
      
      console.log('Loaded teams:', availableTeams.length)
      setTeams(availableTeams)
      
      // If no teams exist, keep the teams array empty
      if (availableTeams.length === 0) {
        console.log('No teams found')
        setTeams([])
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      // Keep teams empty on error
      setTeams([])
    }
  }

  const handleNext = async () => {
    const step = ONBOARDING_STEPS[currentStep]
    
    // Validate current step
    if (!validateStep(step.id)) return
    
    // Save progress on certain steps
    if (step.id === 'profile' || step.id === 'goals' || step.id === 'preferences') {
      await saveProgress()
    }
    
    // Handle team creation if selected
    if (step.id === 'team' && formData.teamAction === 'create') {
      await createNewTeam()
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateStep = (stepId) => {
    switch (stepId) {
      case 'profile':
        if (!formData.displayName.trim()) {
          alert('Please enter your name')
          return false
        }
        if (!formData.avatarUrl) {
          alert('Please select an avatar')
          return false
        }
        break
      case 'goals':
        if (!formData.monthlySalesTarget) {
          alert('Please set your monthly sales target')
          return false
        }
        if (formData.improvementAreas.length === 0) {
          alert('Please select at least one area to improve')
          return false
        }
        break
    }
    return true
  }

  const saveProgress = async () => {
    if (!user) return
    
    try {
      const updates = {
        ...formData,
        onboardingStep: currentStep,
        lastUpdated: serverTimestamp()
      }
      
      // Update both collections for compatibility
      await updateDoc(doc(db, 'users', user.uid), updates)
      await updateDoc(doc(db, 'members', user.uid), updates)
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const createNewTeam = async () => {
    if (!formData.newTeamName.trim()) return
    
    try {
      const teamData = {
        name: formData.newTeamName,
        description: formData.newTeamDescription,
        leaderId: user.uid,
        members: [user.uid],
        memberCount: 1,
        isActive: true,
        createdAt: serverTimestamp(),
        stats: {
          totalSales: 0,
          monthlyGoal: 0,
          achievements: []
        }
      }
      
      const teamRef = await addDoc(collection(db, 'teams'), teamData)
      formData.teamId = teamRef.id
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const completeOnboarding = async () => {
    setLoading(true)
    try {
      const updateData = {
        ...formData,
        onboardingCompleted: true,
        profileComplete: true, // This is what AuthProvider checks
        role: formData.teamAction === 'create' ? 'leader' : 'member',
        completedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      }
      
      // Update BOTH collections for compatibility
      // AuthProvider reads from 'members', but we also maintain 'users'
      await updateDoc(doc(db, 'users', user.uid), updateData)
      await updateDoc(doc(db, 'members', user.uid), updateData)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const startTour = () => {
    setTourActive(true)
    setTourStep(0)
  }

  const skipTour = () => {
    setTourActive(false)
    handleNext()
  }

  const renderStepContent = () => {
    const step = ONBOARDING_STEPS[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return <WelcomeStep user={user} onNext={handleNext} />
      
      case 'profile':
        return (
          <ProfileStep 
            formData={formData} 
            setFormData={setFormData}
            onNext={handleNext}
          />
        )
      
      case 'team':
        return (
          <TeamStep
            formData={formData}
            setFormData={setFormData}
            teams={teams}
            onNext={handleNext}
          />
        )
      
      case 'goals':
        return (
          <GoalsStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        )
      
      case 'tour':
        return (
          <TourStep
            tourActive={tourActive}
            tourStep={tourStep}
            setTourStep={setTourStep}
            onStart={startTour}
            onSkip={skipTour}
            onNext={handleNext}
          />
        )
      
      case 'action':
        return <FirstActionStep onNext={handleNext} />
      
      case 'preferences':
        return (
          <PreferencesStep
            formData={formData}
            setFormData={setFormData}
            onComplete={completeOnboarding}
            loading={loading}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">Getting Started</h2>
            <span className="text-gray-400">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>
          
          {/* Current Step Title */}
          <div className="flex items-center gap-2 mb-6">
            {ONBOARDING_STEPS[currentStep] && (() => {
              const Icon = ONBOARDING_STEPS[currentStep].icon
              return (
                <>
                  <Icon className="w-5 h-5 text-blue-400" />
                  <span className="text-lg text-gray-300">{ONBOARDING_STEPS[currentStep].title}</span>
                </>
              )
            })()}
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((step, index) => {
              return (
                <div
                  key={step.id}
                  className={`flex-1 relative ${index <= currentStep ? '' : 'opacity-50'}`}
                >
                  <div className={`h-2 rounded-full transition-all ${
                    index < currentStep ? 'bg-green-500' :
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-700'
                  }`} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
          {renderStepContent()}
        </div>

        {/* Navigation (for some steps) */}
        {currentStep > 0 && currentStep < ONBOARDING_STEPS.length - 1 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            {currentStep === 4 && !tourActive && (
              <button
                onClick={skipTour}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Skip Tour
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Step Components
function WelcomeStep({ user, onNext }) {
  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-4">
        Welcome to Agency Max+, {user?.email?.split('@')[0]}!
      </h1>
      
      <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
        You&apos;re about to join a community of high-performing sales professionals 
        who are crushing their goals and earning rewards every day.
      </p>
      
      <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-white font-medium mb-1">Earn Rewards</h3>
          <p className="text-gray-400 text-sm">Unlock achievements and climb the leaderboard</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-white font-medium mb-1">Track Progress</h3>
          <p className="text-gray-400 text-sm">Monitor your sales and hit your goals</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-white font-medium mb-1">Team Competition</h3>
          <p className="text-gray-400 text-sm">Compete and collaborate with your team</p>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
      >
        Let&apos;s Get Started
        <ArrowRight className="w-5 h-5" />
      </button>
      
      <p className="text-gray-500 text-sm mt-6">
        This will only take 5 minutes
      </p>
    </div>
  )
}

function ProfileStep({ formData, setFormData, onNext }) {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-900 rounded-lg">
          <User className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Set Up Your Profile</h2>
          <p className="text-gray-400">Let&apos;s personalize your experience</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            placeholder="John Smith"
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="New York, NY"
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          placeholder="Tell us about yourself and your sales experience..."
          rows={3}
          className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Choose Your Avatar *
        </label>
        
        {/* New AvatarSelectorV2 with built-in tabs and upload */}
        <AvatarSelectorV2
          userName={formData.displayName || 'User'}
          currentAvatar={formData.avatarUrl}
          showUpload={true}
          showStatus={true}
          onSelect={(avatarInfo) => {
            setFormData({
              ...formData,
              avatarUrl: avatarInfo.url,
              avatarData: avatarInfo.data,
              avatarType: avatarInfo.type === 'custom' ? 'uploaded' : 'generated'
            })
          }}
        />
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function TeamStep({ formData, setFormData, teams, onNext }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-900 rounded-lg">
          <Users className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Join or Create a Team</h2>
          <p className="text-gray-400">Teams compete together and support each other</p>
        </div>
      </div>
      
      {/* Team Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Available Teams</h3>
        
        {teams.length === 0 ? (
          <div className="p-6 bg-gray-700 rounded-lg border border-gray-600 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mb-2">No teams currently available to join</p>
            <p className="text-gray-400 text-sm">Be the first to create your own team and lead the way!</p>
          </div>
        ) : (
          teams.map(team => (
          <div
            key={team.id}
            onClick={() => setFormData({...formData, teamId: team.id, teamAction: 'join'})}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.teamId === team.id
                ? 'border-blue-500 bg-blue-900/50'
                : 'border-gray-600 hover:border-gray-500 bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">{team.name}</h4>
                <p className="text-gray-400 text-sm">{team.description}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {team.memberCount}/50 members
                </p>
              </div>
              {formData.teamId === team.id && (
                <Check className="w-6 h-6 text-blue-400" />
              )}
            </div>
          </div>
        ))
        )}
        
        {/* Create New Team */}
        <div
          onClick={() => setFormData({...formData, teamAction: 'create'})}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            formData.teamAction === 'create'
              ? 'border-green-500 bg-green-900/50'
              : 'border-gray-600 hover:border-gray-500 bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-green-400" />
            <div>
              <h4 className="text-white font-medium">Create New Team</h4>
              <p className="text-gray-400 text-sm">Become a team leader and invite others</p>
            </div>
          </div>
        </div>
        
        {formData.teamAction === 'create' && (
          <div className="ml-12 space-y-4">
            <input
              type="text"
              value={formData.newTeamName}
              onChange={(e) => setFormData({...formData, newTeamName: e.target.value})}
              placeholder="Team name"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg"
            />
            <textarea
              value={formData.newTeamDescription}
              onChange={(e) => setFormData({...formData, newTeamDescription: e.target.value})}
              placeholder="Team description (optional)"
              rows={2}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg"
            />
          </div>
        )}
        
        {/* Skip Option */}
        <button
          onClick={() => {
            setFormData({...formData, teamAction: 'skip', teamId: null})
            onNext()
          }}
          className="w-full py-3 text-gray-400 hover:text-white transition-colors"
        >
          Skip for now - I&apos;ll join a team later
        </button>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={formData.teamAction === 'create' && !formData.newTeamName}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function GoalsStep({ formData, setFormData, onNext }) {
  const toggleImprovement = (id) => {
    const areas = formData.improvementAreas.includes(id)
      ? formData.improvementAreas.filter(a => a !== id)
      : [...formData.improvementAreas, id]
    setFormData({...formData, improvementAreas: areas})
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-900 rounded-lg">
          <Target className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Set Your Goals</h2>
          <p className="text-gray-400">What do you want to achieve?</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Monthly Sales Target *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number"
            value={formData.monthlySalesTarget}
            onChange={(e) => setFormData({...formData, monthlySalesTarget: e.target.value})}
            placeholder="50000"
            className="w-full pl-8 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-gray-500 text-sm mt-1">We&apos;ll help you track progress toward this goal</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          What areas do you want to improve? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {IMPROVEMENT_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => toggleImprovement(option.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                formData.improvementAreas.includes(option.id)
                  ? 'border-blue-500 bg-blue-900/50'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="text-white">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Personal Goal (Optional)
        </label>
        <textarea
          value={formData.personalGoal}
          onChange={(e) => setFormData({...formData, personalGoal: e.target.value})}
          placeholder="What's your biggest goal for this year?"
          rows={2}
          className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function TourStep({ tourActive, tourStep, setTourStep, onStart, onSkip, onNext }) {
  if (tourActive) {
    const step = TOUR_STEPS[tourStep]
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{step.title}</h3>
          <span className="text-gray-400">
            {tourStep + 1} of {TOUR_STEPS.length}
          </span>
        </div>
        
        <p className="text-gray-300">{step.description}</p>
        
        <div className="flex justify-between">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Skip Tour
          </button>
          
          <button
            onClick={() => {
              if (tourStep < TOUR_STEPS.length - 1) {
                setTourStep(tourStep + 1)
              } else {
                onNext()
              }
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {tourStep < TOUR_STEPS.length - 1 ? 'Next' : 'Finish Tour'}
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
        <Play className="w-10 h-10 text-white ml-1" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">
        Quick Platform Tour
      </h2>
      
      <p className="text-gray-300 mb-8 max-w-lg mx-auto">
        Let us show you around! We&apos;ll highlight the key features that will help you succeed.
      </p>
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={onStart}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Start Tour
        </button>
        
        <button
          onClick={onSkip}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
        >
          Skip Tour
        </button>
      </div>
    </div>
  )
}

function FirstActionStep({ onNext }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6">
        <Trophy className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">
        Ready for Your First Achievement?
      </h2>
      
      <p className="text-gray-300 mb-8 max-w-lg mx-auto">
        Let&apos;s get you started with your first action. Choose one to begin earning points!
      </p>
      
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
        <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-white font-medium mb-1">Log First Sale</h3>
          <p className="text-gray-400 text-sm">Earn 10 points instantly</p>
        </button>
        
        <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-white font-medium mb-1">Set Daily Goal</h3>
          <p className="text-gray-400 text-sm">Start building streaks</p>
        </button>
      </div>
      
      <button
        onClick={onNext}
        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        I&apos;ll Do This Later
      </button>
    </div>
  )
}

function PreferencesStep({ formData, setFormData, onComplete, loading }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-900 rounded-lg">
          <Settings className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Final Preferences</h2>
          <p className="text-gray-400">Customize your experience</p>
        </div>
      </div>
      
      {/* Notifications */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Notifications
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-gray-200">Email Notifications</span>
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({...formData, emailNotifications: e.target.checked})}
              className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-gray-200">In-App Notifications</span>
            <input
              type="checkbox"
              checked={formData.inAppNotifications}
              onChange={(e) => setFormData({...formData, inAppNotifications: e.target.checked})}
              className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded"
            />
          </label>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <label className="text-gray-200 block mb-2">Notification Frequency</label>
            <select
              value={formData.notificationFrequency}
              onChange={(e) => setFormData({...formData, notificationFrequency: e.target.value})}
              className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded"
            >
              <option value="realtime">Real-time</option>
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Privacy */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Privacy
        </h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-gray-700 rounded-lg">
            <label className="text-gray-200 block mb-2">Profile Visibility</label>
            <select
              value={formData.profileVisibility}
              onChange={(e) => setFormData({...formData, profileVisibility: e.target.value})}
              className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded"
            >
              <option value="public">Public</option>
              <option value="team">Team Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          
          <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <span className="text-gray-200 block">Data Sharing</span>
              <span className="text-gray-400 text-sm">Help improve the platform</span>
            </div>
            <input
              type="checkbox"
              checked={formData.dataSharing}
              onChange={(e) => setFormData({...formData, dataSharing: e.target.checked})}
              className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <span className="text-gray-200 block">Marketing Emails</span>
              <span className="text-gray-400 text-sm">Tips, updates, and offers</span>
            </div>
            <input
              type="checkbox"
              checked={formData.marketingEmails}
              onChange={(e) => setFormData({...formData, marketingEmails: e.target.checked})}
              className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded"
            />
          </label>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-700">
        <button
          onClick={onComplete}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Setting up your account...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Complete Setup & Enter Dashboard
            </>
          )}
        </button>
      </div>
    </div>
  )
}