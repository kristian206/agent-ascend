'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/navigation/AppShell'
import MultiStepForm, {
  FormSideNav,
  AutoSaveIndicator,
  UnsavedChangesWarning,
  ValidationSummary
} from '@/components/forms/MultiStepForm'
import {
  TextField,
  SelectField,
  TextAreaField,
  RadioGroup,
  CheckboxField,
  ToggleField,
  FormSection,
  FormActions,
  SuccessMessage
} from '@/components/forms/FormKit'

// Form steps configuration
const FORM_STEPS = [
  {
    id: 'contact',
    label: 'Contact Info',
    description: 'Basic contact details'
  },
  {
    id: 'insurance',
    label: 'Insurance Needs',
    description: 'Coverage requirements'
  },
  {
    id: 'qualification',
    label: 'Qualification',
    description: 'Lead scoring'
  },
  {
    id: 'assignment',
    label: 'Assignment',
    description: 'Assign and schedule'
  }
]

// Form sections for side nav
const FORM_SECTIONS = {
  contact: [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'contact-details', label: 'Contact Details', icon: '📞' },
    { id: 'address', label: 'Address', icon: '📍' }
  ],
  insurance: [
    { id: 'current-coverage', label: 'Current Coverage', icon: '📋' },
    { id: 'needs', label: 'Insurance Needs', icon: '🎯' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' }
  ],
  qualification: [
    { id: 'timeline', label: 'Timeline', icon: '⏰' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'scoring', label: 'Lead Scoring', icon: '📊' }
  ],
  assignment: [
    { id: 'assignee', label: 'Assign To', icon: '👥' },
    { id: 'follow-up', label: 'Follow-up', icon: '📅' },
    { id: 'notes', label: 'Internal Notes', icon: '📝' }
  ]
}

// Validation rules
const validateField = (name, value, rules) => {
  if (rules.required && !value) {
    return `${name} is required`
  }
  if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address'
  }
  if (rules.phone && value && !/^\(\d{3}\) \d{3}-\d{4}$/.test(value)) {
    return 'Please enter a valid phone number (XXX) XXX-XXXX'
  }
  return null
}

export default function CreateLeadPage() {
  const { user, userData } = useAuth()
  const router = useRouter()
  
  // Form state
  const [currentStep, setCurrentStep] = useState(0)
  const [activeSection, setActiveSection] = useState('personal')
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [lastSaved, setLastSaved] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('createLeadDraft')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed.data || {})
        setCurrentStep(parsed.step || 0)
        setActiveSection(parsed.section || 'personal')
        setLastSaved(parsed.timestamp)
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
  }, [])

  // Auto-save to localStorage
  const autoSave = useCallback(() => {
    if (hasChanges) {
      setSaveStatus('saving')
      const saveData = {
        data: formData,
        step: currentStep,
        section: activeSection,
        timestamp: Date.now()
      }
      localStorage.setItem('createLeadDraft', JSON.stringify(saveData))
      setTimeout(() => {
        setSaveStatus('saved')
        setLastSaved(Date.now())
        setHasChanges(false)
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, 500)
    }
  }, [formData, currentStep, activeSection, hasChanges])

  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 5000)
    return () => clearInterval(interval)
  }, [autoSave])

  // Handle field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Format phone number
  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }

  // Validate current step
  const validateStep = () => {
    const newErrors = {}
    const stepSections = FORM_SECTIONS[FORM_STEPS[currentStep].id]
    
    // Validate required fields based on current step
    switch(currentStep) {
      case 0: // Contact Info
        if (!formData.firstName) newErrors.firstName = 'First name is required'
        if (!formData.lastName) newErrors.lastName = 'Last name is required'
        if (!formData.email) newErrors.email = 'Email is required'
        if (!formData.phone) newErrors.phone = 'Phone is required'
        break
      case 1: // Insurance Needs
        if (!formData.insuranceType) newErrors.insuranceType = 'Insurance type is required'
        break
      case 2: // Qualification
        if (!formData.timeline) newErrors.timeline = 'Timeline is required'
        if (!formData.budget) newErrors.budget = 'Budget is required'
        break
      case 3: // Assignment
        if (!formData.assignTo) newErrors.assignTo = 'Assignment is required'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle step navigation
  const handleNextStep = () => {
    if (validateStep()) {
      autoSave()
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
        setActiveSection(FORM_SECTIONS[FORM_STEPS[currentStep + 1].id][0].id)
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setActiveSection(FORM_SECTIONS[FORM_STEPS[currentStep - 1].id][0].id)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (validateStep()) {
      setSaveStatus('saving')
      
      // Simulate API call with optimistic UI
      setTimeout(() => {
        // Clear draft from localStorage
        localStorage.removeItem('createLeadDraft')
        setSaveStatus('saved')
        setShowSuccess(true)
        
        // Redirect after success
        setTimeout(() => {
          router.push('/leads')
        }, 2000)
      }, 1000)
    }
  }

  // Handle unsaved changes
  const handleSaveChanges = () => {
    autoSave()
  }

  const handleDiscardChanges = () => {
    const savedData = localStorage.getItem('createLeadDraft')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setFormData(parsed.data || {})
    }
    setHasChanges(false)
  }

  if (!user) return null

  const currentSections = FORM_SECTIONS[FORM_STEPS[currentStep].id]

  return (
    <AppShell user={userData}>
      <div className="min-h-screen bg-surface-50">
        {/* Header */}
        <div className="glass-xl border-b border-ink-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="type-dashboard-title text-primary">Create New Lead</h1>
              <p className="type-detail-body text-secondary mt-1">
                Add a new lead to your pipeline
              </p>
            </div>
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
        </div>

        {/* Multi-Step Form */}
        <MultiStepForm
          steps={FORM_STEPS}
          initialStep={currentStep}
          onStepChange={setCurrentStep}
        >
          {({ currentStep, setCurrentStep, markStepComplete }) => (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Side Navigation */}
                <div className="lg:col-span-1">
                  <FormSideNav
                    sections={currentSections}
                    activeSection={activeSection}
                    onSectionClick={setActiveSection}
                  />
                </div>

                {/* Form Content */}
                <div className="lg:col-span-3">
                  <div className="glass-xl rounded-lg p-6">
                    {/* Success Message */}
                    {showSuccess && (
                      <div className="mb-6">
                        <SuccessMessage
                          message="Lead created successfully! Redirecting..."
                          onDismiss={() => setShowSuccess(false)}
                        />
                      </div>
                    )}

                    {/* Validation Summary */}
                    {Object.keys(errors).length > 0 && (
                      <div className="mb-6">
                        <ValidationSummary errors={Object.values(errors)} />
                      </div>
                    )}

                    {/* Step 1: Contact Info */}
                    {currentStep === 0 && (
                      <div className="space-y-8">
                        {/* Personal Info Section */}
                        <FormSection
                          title="Personal Information"
                          description="Basic information about the lead"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField
                              label="First Name"
                              name="firstName"
                              value={formData.firstName || ''}
                              onChange={(value) => handleFieldChange('firstName', value)}
                              placeholder="John"
                              required
                              error={errors.firstName}
                              autoFocus
                            />
                            <TextField
                              label="Last Name"
                              name="lastName"
                              value={formData.lastName || ''}
                              onChange={(value) => handleFieldChange('lastName', value)}
                              placeholder="Smith"
                              required
                              error={errors.lastName}
                            />
                          </div>
                          <SelectField
                            label="Lead Source"
                            name="source"
                            value={formData.source || ''}
                            onChange={(value) => handleFieldChange('source', value)}
                            options={[
                              { value: 'website', label: 'Website' },
                              { value: 'referral', label: 'Referral' },
                              { value: 'phone', label: 'Phone Call' },
                              { value: 'walkin', label: 'Walk-in' },
                              { value: 'social', label: 'Social Media' },
                              { value: 'email', label: 'Email Campaign' }
                            ]}
                            helperText="How did this lead find us?"
                            icon="🔗"
                          />
                        </FormSection>

                        {/* Contact Details Section */}
                        <FormSection
                          title="Contact Details"
                          description="How to reach the lead"
                        >
                          <TextField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(value) => handleFieldChange('email', value)}
                            placeholder="john.smith@email.com"
                            required
                            error={errors.email}
                            helperText="Primary email for communication"
                            icon="📧"
                          />
                          <TextField
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={formData.phone || ''}
                            onChange={(value) => handleFieldChange('phone', formatPhone(value))}
                            placeholder="(555) 123-4567"
                            required
                            error={errors.phone}
                            helperText="Best number to reach them"
                            icon="📱"
                          />
                          <RadioGroup
                            label="Preferred Contact Method"
                            name="preferredContact"
                            value={formData.preferredContact || 'email'}
                            onChange={(value) => handleFieldChange('preferredContact', value)}
                            options={[
                              { value: 'email', label: 'Email' },
                              { value: 'phone', label: 'Phone' },
                              { value: 'text', label: 'Text Message' }
                            ]}
                            inline
                          />
                        </FormSection>

                        {/* Address Section */}
                        <FormSection
                          title="Address"
                          description="Lead's location information"
                        >
                          <TextField
                            label="Street Address"
                            name="address"
                            value={formData.address || ''}
                            onChange={(value) => handleFieldChange('address', value)}
                            placeholder="123 Main Street"
                            icon="🏠"
                          />
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <TextField
                              label="City"
                              name="city"
                              value={formData.city || ''}
                              onChange={(value) => handleFieldChange('city', value)}
                              placeholder="Chicago"
                            />
                            <SelectField
                              label="State"
                              name="state"
                              value={formData.state || ''}
                              onChange={(value) => handleFieldChange('state', value)}
                              options={[
                                { value: 'IL', label: 'Illinois' },
                                { value: 'IN', label: 'Indiana' },
                                { value: 'WI', label: 'Wisconsin' },
                                { value: 'MI', label: 'Michigan' },
                                { value: 'IA', label: 'Iowa' }
                              ]}
                            />
                            <TextField
                              label="ZIP Code"
                              name="zip"
                              value={formData.zip || ''}
                              onChange={(value) => handleFieldChange('zip', value)}
                              placeholder="60601"
                            />
                          </div>
                        </FormSection>
                      </div>
                    )}

                    {/* Step 2: Insurance Needs */}
                    {currentStep === 1 && (
                      <div className="space-y-8">
                        {/* Current Coverage Section */}
                        <FormSection
                          title="Current Coverage"
                          description="Existing insurance information"
                        >
                          <TextField
                            label="Current Carrier"
                            name="currentCarrier"
                            value={formData.currentCarrier || ''}
                            onChange={(value) => handleFieldChange('currentCarrier', value)}
                            placeholder="State Farm, Geico, etc."
                            helperText="Leave blank if no current coverage"
                            icon="🏢"
                          />
                          <TextField
                            label="Current Premium"
                            name="currentPremium"
                            type="number"
                            value={formData.currentPremium || ''}
                            onChange={(value) => handleFieldChange('currentPremium', value)}
                            placeholder="1200"
                            helperText="Annual premium amount"
                            icon="💵"
                          />
                          <TextField
                            label="Policy Renewal Date"
                            name="renewalDate"
                            type="date"
                            value={formData.renewalDate || ''}
                            onChange={(value) => handleFieldChange('renewalDate', value)}
                            helperText="When does their current policy expire?"
                            icon="📅"
                          />
                        </FormSection>

                        {/* Insurance Needs Section */}
                        <FormSection
                          title="Insurance Needs"
                          description="What coverage are they looking for?"
                        >
                          <SelectField
                            label="Primary Insurance Type"
                            name="insuranceType"
                            value={formData.insuranceType || ''}
                            onChange={(value) => handleFieldChange('insuranceType', value)}
                            options={[
                              { value: 'auto', label: 'Auto Insurance' },
                              { value: 'home', label: 'Home Insurance' },
                              { value: 'life', label: 'Life Insurance' },
                              { value: 'bundle', label: 'Multi-Policy Bundle' },
                              { value: 'business', label: 'Business Insurance' },
                              { value: 'other', label: 'Other' }
                            ]}
                            required
                            error={errors.insuranceType}
                            icon="📋"
                          />
                          <CheckboxField
                            label="Interested in bundling multiple policies"
                            name="bundleInterest"
                            checked={formData.bundleInterest || false}
                            onChange={(value) => handleFieldChange('bundleInterest', value)}
                            helperText="Could save them 15-25% on premiums"
                          />
                          <TextAreaField
                            label="Specific Coverage Needs"
                            name="coverageNeeds"
                            value={formData.coverageNeeds || ''}
                            onChange={(value) => handleFieldChange('coverageNeeds', value)}
                            placeholder="E.g., Full coverage for 2 vehicles, $500k home coverage, etc."
                            rows={3}
                            maxLength={500}
                          />
                        </FormSection>

                        {/* Preferences Section */}
                        <FormSection
                          title="Preferences"
                          description="Lead's insurance preferences"
                        >
                          <RadioGroup
                            label="Coverage Priority"
                            name="priority"
                            value={formData.priority || 'balance'}
                            onChange={(value) => handleFieldChange('priority', value)}
                            options={[
                              { value: 'price', label: 'Lowest Price' },
                              { value: 'coverage', label: 'Best Coverage' },
                              { value: 'balance', label: 'Balance of Both' }
                            ]}
                          />
                          <ToggleField
                            label="Has had claims in the past 3 years"
                            name="hasClaims"
                            checked={formData.hasClaims || false}
                            onChange={(value) => handleFieldChange('hasClaims', value)}
                            helperText="This may affect their premium"
                          />
                        </FormSection>
                      </div>
                    )}

                    {/* Step 3: Qualification */}
                    {currentStep === 2 && (
                      <div className="space-y-8">
                        {/* Timeline Section */}
                        <FormSection
                          title="Timeline"
                          description="When are they looking to make a decision?"
                        >
                          <RadioGroup
                            label="Decision Timeline"
                            name="timeline"
                            value={formData.timeline || ''}
                            onChange={(value) => handleFieldChange('timeline', value)}
                            options={[
                              { value: 'immediate', label: 'Immediate (This week)' },
                              { value: 'soon', label: 'Soon (Within 2 weeks)' },
                              { value: 'month', label: 'This month' },
                              { value: 'exploring', label: 'Just exploring options' }
                            ]}
                            required
                            error={errors.timeline}
                          />
                        </FormSection>

                        {/* Budget Section */}
                        <FormSection
                          title="Budget"
                          description="Financial qualification"
                        >
                          <SelectField
                            label="Budget Range"
                            name="budget"
                            value={formData.budget || ''}
                            onChange={(value) => handleFieldChange('budget', value)}
                            options={[
                              { value: 'under1k', label: 'Under $1,000/year' },
                              { value: '1k-3k', label: '$1,000 - $3,000/year' },
                              { value: '3k-5k', label: '$3,000 - $5,000/year' },
                              { value: '5k-10k', label: '$5,000 - $10,000/year' },
                              { value: 'over10k', label: 'Over $10,000/year' }
                            ]}
                            required
                            error={errors.budget}
                            icon="💰"
                          />
                        </FormSection>

                        {/* Lead Scoring Section */}
                        <FormSection
                          title="Lead Scoring"
                          description="Qualify the lead"
                        >
                          <RadioGroup
                            label="Lead Temperature"
                            name="temperature"
                            value={formData.temperature || 'warm'}
                            onChange={(value) => handleFieldChange('temperature', value)}
                            options={[
                              { value: 'hot', label: '🔥 Hot - Ready to buy' },
                              { value: 'warm', label: '⭐ Warm - Interested' },
                              { value: 'cold', label: '❄️ Cold - Just looking' }
                            ]}
                          />
                          <SelectField
                            label="Lead Quality Score"
                            name="qualityScore"
                            value={formData.qualityScore || ''}
                            onChange={(value) => handleFieldChange('qualityScore', value)}
                            options={[
                              { value: '10', label: '10 - Perfect fit' },
                              { value: '9', label: '9 - Excellent' },
                              { value: '8', label: '8 - Very Good' },
                              { value: '7', label: '7 - Good' },
                              { value: '6', label: '6 - Above Average' },
                              { value: '5', label: '5 - Average' },
                              { value: '4', label: '4 - Below Average' },
                              { value: '3', label: '3 - Poor' }
                            ]}
                            helperText="Based on budget, timeline, and needs"
                          />
                        </FormSection>
                      </div>
                    )}

                    {/* Step 4: Assignment */}
                    {currentStep === 3 && (
                      <div className="space-y-8">
                        {/* Assignee Section */}
                        <FormSection
                          title="Assignment"
                          description="Who will handle this lead?"
                        >
                          <SelectField
                            label="Assign To"
                            name="assignTo"
                            value={formData.assignTo || ''}
                            onChange={(value) => handleFieldChange('assignTo', value)}
                            options={[
                              { value: 'self', label: 'Myself' },
                              { value: 'john', label: 'John Smith' },
                              { value: 'sarah', label: 'Sarah Johnson' },
                              { value: 'team', label: 'Team Pool' },
                              { value: 'round-robin', label: 'Round Robin' }
                            ]}
                            required
                            error={errors.assignTo}
                            icon="👤"
                          />
                        </FormSection>

                        {/* Follow-up Section */}
                        <FormSection
                          title="Follow-up Schedule"
                          description="When should we contact them?"
                        >
                          <TextField
                            label="First Contact Date"
                            name="firstContactDate"
                            type="date"
                            value={formData.firstContactDate || ''}
                            onChange={(value) => handleFieldChange('firstContactDate', value)}
                            helperText="When to make initial contact"
                            icon="📅"
                          />
                          <TextField
                            label="Preferred Contact Time"
                            name="contactTime"
                            type="time"
                            value={formData.contactTime || ''}
                            onChange={(value) => handleFieldChange('contactTime', value)}
                            helperText="Best time to reach them"
                            icon="🕐"
                          />
                          <CheckboxField
                            label="Add to automated follow-up sequence"
                            name="autoFollowUp"
                            checked={formData.autoFollowUp || false}
                            onChange={(value) => handleFieldChange('autoFollowUp', value)}
                            helperText="Send automated emails and reminders"
                          />
                        </FormSection>

                        {/* Notes Section */}
                        <FormSection
                          title="Internal Notes"
                          description="Additional information for the team"
                        >
                          <TextAreaField
                            label="Notes"
                            name="notes"
                            value={formData.notes || ''}
                            onChange={(value) => handleFieldChange('notes', value)}
                            placeholder="Any special considerations, referral details, or other important information..."
                            rows={4}
                            maxLength={1000}
                            helperText="These notes are only visible to our team"
                          />
                          <CheckboxField
                            label="Mark as priority lead"
                            name="isPriority"
                            checked={formData.isPriority || false}
                            onChange={(value) => handleFieldChange('isPriority', value)}
                            helperText="This lead will appear at the top of the queue"
                          />
                        </FormSection>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="mt-8 pt-6 border-t border-ink-100 flex items-center justify-between">
                      <div>
                        {currentStep > 0 && (
                          <button
                            onClick={handlePreviousStep}
                            className="px-6 py-2.5 rounded-lg glass hover:glass-brand text-ink-700 hover:text-white type-list-body font-medium transition-all"
                          >
                            ← Previous
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push('/leads')}
                          className="px-6 py-2.5 rounded-lg glass hover:bg-surface-100 text-ink-700 type-list-body font-medium transition-all"
                        >
                          Cancel
                        </button>
                        
                        {currentStep < FORM_STEPS.length - 1 ? (
                          <FormActions
                            primaryLabel="Save & Continue"
                            primaryIcon="→"
                            onPrimary={handleNextStep}
                            showSecondary={false}
                            isLoading={saveStatus === 'saving'}
                          />
                        ) : (
                          <FormActions
                            primaryLabel="Create Lead"
                            primaryIcon="✓"
                            onPrimary={handleSubmit}
                            showSecondary={false}
                            isLoading={saveStatus === 'saving'}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </MultiStepForm>

        {/* Unsaved Changes Warning */}
        <UnsavedChangesWarning
          hasChanges={hasChanges}
          onSave={handleSaveChanges}
          onDiscard={handleDiscardChanges}
        />
      </div>
    </AppShell>
  )
}