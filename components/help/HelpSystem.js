'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

// Help content database
const HELP_CONTENT = {
  // Dashboard sections
  'dashboard-kpis': {
    title: 'Key Performance Indicators',
    description: 'Your most important metrics at a glance. These KPIs help you track progress toward your goals.',
    tips: [
      '📊 Focus on one KPI at a time to avoid overwhelm',
      '🎯 Set realistic daily targets that ladder up to monthly goals',
      '📈 Check trends weekly to spot patterns early',
      '⚡ Use the quick actions to update metrics in real-time',
      '🔔 Enable notifications for goal milestones'
    ],
    docLink: '/docs/dashboard/kpis'
  },
  'dashboard-performance': {
    title: 'Performance HUD',
    description: 'Real-time performance tracking with AI-powered coaching suggestions based on your activity.',
    tips: [
      '🎯 Pay attention to coaching prompts—they adapt to your patterns',
      '📊 Green trends are good, red means attention needed',
      '⏰ Best call times are highlighted based on your success rate',
      '🔥 Maintain streaks for bonus points and recognition'
    ],
    docLink: '/docs/performance/hud'
  },
  'dashboard-work-queue': {
    title: 'Work Queue',
    description: 'Your prioritized list of tasks and follow-ups. Items are sorted by urgency and value.',
    tips: [
      '🔥 Hot leads appear at the top—contact them first',
      '📅 Overdue items are highlighted in red',
      '✅ Click items to mark complete right from the dashboard',
      '🔄 Queue refreshes every 5 minutes automatically'
    ],
    docLink: '/docs/dashboard/work-queue'
  },
  'dashboard-activity': {
    title: 'Recent Activity',
    description: 'Timeline of your recent actions and their outcomes. Great for tracking what works.',
    tips: [
      '📝 Add notes immediately after calls for better recall',
      '🎯 Look for patterns in successful interactions',
      '📊 Export activity reports weekly for review',
      '🔍 Use filters to find specific types of activities'
    ],
    docLink: '/docs/dashboard/activity'
  },
  
  // Leads sections
  'leads-table': {
    title: 'Leads Table',
    description: 'Manage all your leads in one place. Sort, filter, and take bulk actions to work efficiently.',
    tips: [
      '🔍 Use search to quickly find leads by name, email, or product',
      '📊 Click column headers to sort by that field',
      '☑️ Select multiple leads for bulk actions like assign or export',
      '👁️ Hover over rows to see quick action buttons',
      '⚙️ Customize visible columns using the settings icon'
    ],
    docLink: '/docs/leads/table'
  },
  'leads-create': {
    title: 'Create New Lead',
    description: 'Add new leads to your pipeline. The multi-step form ensures you capture all necessary information.',
    tips: [
      '💾 Form auto-saves every 5 seconds—never lose your work',
      '📱 Phone numbers auto-format as you type',
      '🎯 Lead scoring happens automatically based on criteria',
      '📅 Set follow-up reminders during creation',
      '✨ Use templates for common lead types'
    ],
    docLink: '/docs/leads/create'
  },
  'leads-detail': {
    title: 'Lead Details',
    description: 'Complete view of a lead with all interactions, notes, and next steps in one place.',
    tips: [
      '📞 Primary CTA changes based on lead status',
      '📝 Add activities inline without leaving the page',
      '📊 Key fields are grouped logically for easy scanning',
      '🔒 Advanced settings hidden by default to reduce clutter',
      '📎 Attach files directly to the timeline'
    ],
    docLink: '/docs/leads/detail'
  },
  'leads-actions': {
    title: 'Lead Actions',
    description: 'Quick actions you can take on leads without navigating away from your current view.',
    tips: [
      '📞 Click phone icon to dial directly',
      '✉️ Email opens your default client with pre-filled info',
      '📝 Add notes inline for quick updates',
      '👁️ Preview lead details in side panel',
      '🎯 Convert hot leads to opportunities with one click'
    ],
    docLink: '/docs/leads/actions'
  },
  
  // Team sections
  'team-roster': {
    title: 'Team Roster',
    description: 'View and manage your team members. See performance, assign leads, and collaborate.',
    tips: [
      '👥 Click members to see detailed performance',
      '📊 Compare stats to identify coaching opportunities',
      '🎯 Assign leads based on member strengths',
      '🏆 Celebrate wins publicly in team chat'
    ],
    docLink: '/docs/team/roster'
  },
  'team-performance': {
    title: 'Team Performance',
    description: 'Aggregate team metrics and leaderboards. Track progress toward team goals.',
    tips: [
      '📈 Team averages help identify training needs',
      '🏆 Leaderboards update in real-time',
      '🎯 Set team challenges to boost engagement',
      '📊 Export reports for team meetings'
    ],
    docLink: '/docs/team/performance'
  }
}

// Help Icon Component
export function HelpIcon({ section, className = '' }) {
  const [showPanel, setShowPanel] = useState(false)
  
  const handleClick = (e) => {
    e.stopPropagation()
    setShowPanel(true)
  }
  
  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full glass hover:glass-brand text-ink-400 hover:text-white transition-all ${className}`}
        title="Get help"
      >
        <span className="text-xs font-bold">?</span>
      </button>
      
      {showPanel && (
        <HelpPanel 
          section={section}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  )
}

// Help Panel Component
export function HelpPanel({ section, onClose }) {
  const content = HELP_CONTENT[section] || {
    title: 'Help',
    description: 'Learn more about this feature.',
    tips: ['No tips available yet.'],
    docLink: '/docs'
  }
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])
  
  // Create portal to render at root level
  if (typeof document === 'undefined') return null
  
  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink-900/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-96 glass-xl border-l border-ink-100 z-50 animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass-lg border-b border-ink-100 p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="type-list-heading text-primary">{content.title}</h2>
              <p className="type-detail-caption text-ink-500 mt-1">Quick Help</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="type-list-label text-ink-500 mb-2">ABOUT</h3>
            <p className="type-list-body text-ink-700">
              {content.description}
            </p>
          </div>
          
          {/* Tips */}
          <div>
            <h3 className="type-list-label text-ink-500 mb-3">QUICK TIPS</h3>
            <div className="space-y-3">
              {content.tips.map((tip, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center type-detail-caption font-medium">
                    {index + 1}
                  </span>
                  <p className="type-list-body text-ink-700 flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Documentation Link */}
          <div>
            <a 
              href={content.docLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass hover:glass-brand text-ink-700 hover:text-white type-list-body font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              View Full Documentation
            </a>
          </div>
          
          {/* Related Topics */}
          <div>
            <h3 className="type-list-label text-ink-500 mb-3">RELATED TOPICS</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 type-list-body text-ink-700 transition-colors">
                Getting Started Guide →
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 type-list-body text-ink-700 transition-colors">
                Keyboard Shortcuts →
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 type-list-body text-ink-700 transition-colors">
                Best Practices →
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 glass-lg border-t border-ink-100 p-6">
          <div className="flex items-center justify-between">
            <p className="type-detail-caption text-ink-500">
              Need more help?
            </p>
            <button className="type-list-body text-brand-500 hover:text-brand-600 font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>,
    document.body
  )
}

// Coach Marks Component
export function CoachMarks({ marks, onComplete }) {
  const [currentMark, setCurrentMark] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [completed, setCompleted] = useState([])
  
  // Load completed marks from localStorage
  useEffect(() => {
    const savedCompleted = localStorage.getItem('coachMarksCompleted')
    if (savedCompleted) {
      const parsed = JSON.parse(savedCompleted)
      setCompleted(parsed)
      
      // Find first incomplete mark
      const firstIncomplete = marks.findIndex(mark => !parsed.includes(mark.id))
      if (firstIncomplete === -1) {
        setDismissed(true)
      } else {
        setCurrentMark(firstIncomplete)
      }
    }
  }, [marks])
  
  // Save completed marks
  const markAsComplete = (markId) => {
    const newCompleted = [...completed, markId]
    setCompleted(newCompleted)
    localStorage.setItem('coachMarksCompleted', JSON.stringify(newCompleted))
  }
  
  const handleNext = () => {
    const mark = marks[currentMark]
    markAsComplete(mark.id)
    
    if (currentMark < marks.length - 1) {
      setCurrentMark(currentMark + 1)
    } else {
      handleComplete()
    }
  }
  
  const handleSkip = () => {
    marks.forEach(mark => markAsComplete(mark.id))
    handleComplete()
  }
  
  const handleComplete = () => {
    setDismissed(true)
    if (onComplete) {
      onComplete()
    }
  }
  
  if (dismissed || !marks || marks.length === 0) {
    return null
  }
  
  const mark = marks[currentMark]
  if (completed.includes(mark.id)) {
    return null
  }
  
  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Spotlight overlay */}
      <div className="absolute inset-0 bg-ink-900/50 pointer-events-auto" />
      
      {/* Highlighted element */}
      {mark.element && (
        <div
          className="absolute bg-transparent border-2 border-brand-400 rounded-lg pointer-events-none"
          style={{
            top: mark.top || 'auto',
            left: mark.left || 'auto',
            right: mark.right || 'auto',
            bottom: mark.bottom || 'auto',
            width: mark.width || 'auto',
            height: mark.height || 'auto'
          }}
        />
      )}
      
      {/* Coach mark tooltip */}
      <div
        className="absolute glass-xl rounded-lg p-6 max-w-sm pointer-events-auto elev-3 animate-bounce-in"
        style={{
          top: mark.tooltipTop || 'auto',
          left: mark.tooltipLeft || 'auto',
          right: mark.tooltipRight || 'auto',
          bottom: mark.tooltipBottom || 'auto'
        }}
      >
        {/* Progress */}
        <div className="flex items-center gap-1 mb-4">
          {marks.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index < currentMark 
                  ? 'bg-success' 
                  : index === currentMark 
                    ? 'bg-brand-500' 
                    : 'bg-ink-200'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <h3 className="type-list-heading text-primary mb-2">{mark.title}</h3>
          <p className="type-list-body text-ink-700">{mark.description}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="type-list-body text-ink-500 hover:text-ink-700"
          >
            Skip tour
          </button>
          
          <div className="flex items-center gap-2">
            {currentMark > 0 && (
              <button
                onClick={() => setCurrentMark(currentMark - 1)}
                className="px-4 py-2 rounded-lg glass hover:bg-surface-100 type-list-body text-ink-700"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white type-list-body font-medium"
            >
              {currentMark === marks.length - 1 ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </div>,
    document.body
  )
}

// Hook to check if user is new
export function useIsFirstRun(key = 'hasSeenOnboarding') {
  const [isFirstRun, setIsFirstRun] = useState(false)
  
  useEffect(() => {
    const hasSeen = localStorage.getItem(key)
    if (!hasSeen) {
      setIsFirstRun(true)
    }
  }, [key])
  
  const markAsSeen = () => {
    localStorage.setItem(key, 'true')
    setIsFirstRun(false)
  }
  
  return { isFirstRun, markAsSeen }
}