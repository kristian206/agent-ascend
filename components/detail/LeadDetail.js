'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Summary Header Component
function SummaryHeader({ lead, onStatusChange, onPrimaryAction }) {
  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-700 border-blue-200',
      'contacted': 'bg-amber-100 text-amber-700 border-amber-200',
      'qualified': 'bg-purple-100 text-purple-700 border-purple-200',
      'proposal': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'negotiation': 'bg-orange-100 text-orange-700 border-orange-200',
      'closed': 'bg-green-100 text-green-700 border-green-200',
      'lost': 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[status] || 'bg-ink-100 text-ink-700 border-ink-200'
  }

  const getPrimaryAction = (status) => {
    const actions = {
      'new': { label: 'Call Lead', icon: '📞', action: 'call' },
      'contacted': { label: 'Send Quote', icon: '📋', action: 'quote' },
      'qualified': { label: 'Create Proposal', icon: '📄', action: 'proposal' },
      'proposal': { label: 'Follow Up', icon: '💬', action: 'follow-up' },
      'negotiation': { label: 'Bind Policy', icon: '✅', action: 'bind' },
      'closed': { label: 'View Policy', icon: '📊', action: 'view-policy' },
      'lost': { label: 'Reactivate', icon: '🔄', action: 'reactivate' }
    }
    return actions[status] || { label: 'Contact', icon: '📞', action: 'contact' }
  }

  const primaryAction = getPrimaryAction(lead.status)

  return (
    <div className="glass-xl border-b border-ink-100 p-6">
      <div className="flex items-start justify-between">
        {/* Left: Lead Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="type-dashboard-title text-primary truncate">
              {lead.name}
            </h1>
            <span className={`px-3 py-1 rounded-full border type-list-label ${getStatusColor(lead.status)}`}>
              {lead.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4 type-list-body text-ink-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {lead.assignee || 'Unassigned'}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last contact: {lead.lastContact || 'Never'}
            </span>
            <span className="flex items-center gap-1">
              💰 Potential: ${lead.potentialValue?.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        {/* Right: Primary CTA */}
        <div className="flex items-center gap-3 ml-6">
          <button
            onClick={() => onPrimaryAction(primaryAction.action)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all type-list-body"
          >
            <span className="text-xl">{primaryAction.icon}</span>
            {primaryAction.label}
          </button>
          
          {/* More Actions */}
          <button className="p-3 rounded-lg glass hover:glass-brand transition-colors">
            <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Key Fields Component
function KeyFields({ lead, onEdit }) {
  const [activeSection, setActiveSection] = useState('contact')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const sections = {
    contact: {
      label: 'Contact Information',
      icon: '👤',
      fields: [
        { key: 'email', label: 'Email', value: lead.email, editable: true },
        { key: 'phone', label: 'Phone', value: lead.phone, editable: true },
        { key: 'address', label: 'Address', value: lead.address, editable: true },
        { key: 'preferredContact', label: 'Preferred Contact', value: lead.preferredContact || 'Email', editable: true }
      ]
    },
    policy: {
      label: 'Policy Details',
      icon: '📋',
      fields: [
        { key: 'policyType', label: 'Policy Type', value: lead.policyType || 'Auto + Home', editable: true },
        { key: 'currentCarrier', label: 'Current Carrier', value: lead.currentCarrier || 'State Farm', editable: true },
        { key: 'renewalDate', label: 'Renewal Date', value: lead.renewalDate || '03/15/2024', editable: true },
        { key: 'currentPremium', label: 'Current Premium', value: `$${lead.currentPremium?.toLocaleString() || '0'}/yr`, editable: true }
      ]
    },
    billing: {
      label: 'Billing & Payment',
      icon: '💳',
      fields: [
        { key: 'quotedPremium', label: 'Quoted Premium', value: `$${lead.quotedPremium?.toLocaleString() || '0'}/yr`, editable: true },
        { key: 'paymentMethod', label: 'Payment Method', value: lead.paymentMethod || 'Monthly Auto-Pay', editable: true },
        { key: 'discount', label: 'Discounts Applied', value: lead.discount || 'Multi-Policy, Safe Driver', editable: false },
        { key: 'bindingDate', label: 'Target Binding Date', value: lead.bindingDate || 'Not Set', editable: true }
      ]
    }
  }

  const advancedFields = [
    { key: 'source', label: 'Lead Source', value: lead.source || 'Website' },
    { key: 'referredBy', label: 'Referred By', value: lead.referredBy || 'N/A' },
    { key: 'marketingCampaign', label: 'Campaign', value: lead.marketingCampaign || 'Q4-2023-Bundle' },
    { key: 'leadScore', label: 'Lead Score', value: lead.leadScore || '85/100' },
    { key: 'tags', label: 'Tags', value: lead.tags?.join(', ') || 'high-value, bundle-opportunity' },
    { key: 'internalNotes', label: 'Internal Notes', value: lead.internalNotes || 'Prefers morning calls' }
  ]

  return (
    <div className="glass-xl p-6">
      {/* Section Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 type-list-body font-medium transition-all ${
              activeSection === key 
                ? 'glass-brand text-white' 
                : 'glass hover:glass-brand hover:text-white text-ink-700'
            }`}
          >
            <span className="text-lg">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {sections[activeSection].fields.map(field => (
          <div key={field.key} className="group">
            <label className="type-list-label text-ink-500 block mb-1">
              {field.label}
            </label>
            <div className="flex items-center gap-2">
              <span className="type-list-body text-primary flex-1">
                {field.value}
              </span>
              {field.editable && (
                <button
                  onClick={() => onEdit(field.key, field.value)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-100 transition-all"
                >
                  <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Fields Accordion */}
      <div className="mt-6 pt-6 border-t border-ink-100">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 type-list-body text-ink-600 hover:text-brand-500 transition-colors"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Advanced Settings
        </button>
        
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4 p-4 glass rounded-lg">
            {advancedFields.map(field => (
              <div key={field.key}>
                <label className="type-list-label text-ink-500 block mb-1">
                  {field.label}
                </label>
                <span className="type-list-body text-ink-700">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Activity Timeline Component
function ActivityTimeline({ activities, onAddActivity }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [activityType, setActivityType] = useState('note')
  const [activityContent, setActivityContent] = useState('')

  const handleAdd = () => {
    if (activityContent.trim()) {
      onAddActivity({
        type: activityType,
        content: activityContent,
        timestamp: new Date().toISOString()
      })
      setActivityContent('')
      setShowAddForm(false)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      note: '📝',
      call: '📞',
      email: '📧',
      meeting: '🤝',
      task: '✅',
      file: '📎',
      status: '🔄'
    }
    return icons[type] || '📌'
  }

  const getActivityColor = (type) => {
    const colors = {
      note: 'border-blue-200',
      call: 'border-green-200',
      email: 'border-purple-200',
      meeting: 'border-amber-200',
      task: 'border-indigo-200',
      file: 'border-gray-200',
      status: 'border-brand-200'
    }
    return colors[type] || 'border-ink-200'
  }

  return (
    <div className="glass-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="type-list-heading text-primary">Activity Timeline</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg glass hover:glass-brand transition-colors type-list-body font-medium text-ink-700 hover:text-white flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Activity
        </button>
      </div>

      {/* Inline Add Form */}
      {showAddForm && (
        <div className="mb-4 p-4 glass-brand rounded-lg">
          <div className="flex gap-2 mb-3">
            {['note', 'call', 'email', 'meeting', 'task'].map(type => (
              <button
                key={type}
                onClick={() => setActivityType(type)}
                className={`px-3 py-1 rounded-lg type-list-body capitalize transition-colors ${
                  activityType === type 
                    ? 'bg-white/30 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {getActivityIcon(type)} {type}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={activityContent}
              onChange={(e) => setActivityContent(e.target.value)}
              placeholder={`Add a ${activityType}...`}
              className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/50"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-white/30 hover:bg-white/40 text-white font-medium rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setActivityContent('')
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={activity.id || index} className={`flex gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)} hover:bg-surface-50 transition-colors`}>
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="type-list-body text-primary">{activity.content}</p>
                  {activity.metadata && (
                    <p className="type-detail-caption text-ink-500 mt-1">{activity.metadata}</p>
                  )}
                </div>
                <span className="type-detail-caption text-ink-400 ml-4 flex-shrink-0">
                  {activity.timestamp}
                </span>
              </div>
              {activity.attachments && (
                <div className="flex items-center gap-2 mt-2">
                  {activity.attachments.map((file, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-surface-100 rounded type-detail-caption text-ink-600">
                      📎 {file}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && !showAddForm && (
        <div className="py-8 text-center">
          <p className="type-list-body text-ink-400 mb-3">No activities yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-brand-500 hover:text-brand-600 type-list-body font-medium"
          >
            Add your first activity
          </button>
        </div>
      )}
    </div>
  )
}

// Main Lead Detail Component
export default function LeadDetail({ leadId }) {
  const router = useRouter()
  
  // Sample lead data - in production this would come from Firebase
  const [lead] = useState({
    id: leadId || '1',
    name: 'Sarah Johnson',
    status: 'qualified',
    assignee: 'John Smith',
    lastContact: '2 hours ago',
    potentialValue: 8500,
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Chicago, IL 60601',
    policyType: 'Auto + Home Bundle',
    currentCarrier: 'State Farm',
    renewalDate: '03/15/2024',
    currentPremium: 7200,
    quotedPremium: 6500,
    paymentMethod: 'Monthly Auto-Pay',
    discount: 'Multi-Policy, Safe Driver',
    source: 'Website',
    leadScore: 92
  })

  const [activities] = useState([
    {
      id: 1,
      type: 'call',
      content: 'Initial discovery call - interested in bundling auto and home insurance',
      metadata: 'Duration: 15 minutes',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'note',
      content: 'Customer prefers morning calls before 10 AM. Has teenage driver.',
      timestamp: '2 hours ago'
    },
    {
      id: 3,
      type: 'email',
      content: 'Sent quote comparison showing $700 annual savings',
      attachments: ['Quote_Comparison.pdf'],
      timestamp: 'Yesterday'
    },
    {
      id: 4,
      type: 'status',
      content: 'Lead status changed from New to Qualified',
      timestamp: '2 days ago'
    },
    {
      id: 5,
      type: 'task',
      content: 'Follow up scheduled for tomorrow at 9:30 AM',
      timestamp: '2 days ago'
    }
  ])

  const handlePrimaryAction = (action) => {
    console.log('Primary action:', action)
    // Handle different actions
    switch(action) {
      case 'call':
        console.log('Initiating call...')
        break
      case 'quote':
        router.push(`/leads/${lead.id}/quote`)
        break
      case 'bind':
        router.push(`/leads/${lead.id}/bind`)
        break
      default:
        console.log('Action:', action)
    }
  }

  const handleEdit = (field, value) => {
    console.log('Edit field:', field, 'Value:', value)
    // In production, this would update Firebase
  }

  const handleAddActivity = (activity) => {
    console.log('Add activity:', activity)
    // In production, this would add to Firebase
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Zone 1: Summary Header */}
      <SummaryHeader 
        lead={lead} 
        onPrimaryAction={handlePrimaryAction}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Key Fields */}
          <div className="lg:col-span-2">
            {/* Zone 2: Key Fields */}
            <KeyFields 
              lead={lead} 
              onEdit={handleEdit}
            />
          </div>

          {/* Right Column: Activity Timeline */}
          <div className="lg:col-span-1">
            {/* Zone 3: Activity Timeline */}
            <ActivityTimeline 
              activities={activities}
              onAddActivity={handleAddActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}