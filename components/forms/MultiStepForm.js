'use client'
import { useState, useEffect } from 'react'

// Stepper Component
export function FormStepper({ steps, currentStep, onStepClick, completedSteps = [] }) {
  return (
    <div className="glass-xl border-b border-ink-100 px-6 py-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.includes(index)
          const isClickable = isCompleted || index <= currentStep
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={`flex items-center gap-3 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {/* Step Number */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-medium transition-all
                  ${isActive ? 'bg-brand-500 text-white ring-4 ring-brand-200/30' : ''}
                  ${isCompleted && !isActive ? 'bg-success text-white' : ''}
                  ${!isActive && !isCompleted ? 'glass border border-ink-200 text-ink-500' : ''}
                `}>
                  {isCompleted && !isActive ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                
                {/* Step Label */}
                <div className="hidden md:block text-left">
                  <p className={`type-list-body font-medium ${
                    isActive ? 'text-brand-600' : isCompleted ? 'text-primary' : 'text-ink-500'
                  }`}>
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="type-detail-caption text-ink-400">{step.description}</p>
                  )}
                </div>
              </button>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 transition-all
                  ${isCompleted ? 'bg-success' : 'bg-ink-200'}
                `} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Sticky Side Navigation
export function FormSideNav({ sections, activeSection, onSectionClick }) {
  return (
    <div className="sticky top-6">
      <nav className="glass-xl rounded-lg p-4">
        <h3 className="type-list-label text-ink-500 mb-3">QUICK JUMP</h3>
        <div className="space-y-1">
          {sections.map((section, index) => {
            const isActive = section.id === activeSection
            const isAccessible = !section.disabled
            
            return (
              <button
                key={section.id}
                onClick={() => isAccessible && onSectionClick(section.id)}
                disabled={!isAccessible}
                className={`
                  w-full text-left px-3 py-2 rounded-lg
                  flex items-center gap-2
                  type-list-body transition-all
                  ${isActive 
                    ? 'glass-brand text-white' 
                    : isAccessible
                      ? 'hover:bg-surface-100 text-ink-700'
                      : 'opacity-50 cursor-not-allowed text-ink-400'
                  }
                `}
              >
                {section.icon && <span className="text-lg">{section.icon}</span>}
                <span className="flex-1">{section.label}</span>
                {section.error && (
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                )}
                {section.complete && !section.error && (
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

// Auto-save Indicator
export function AutoSaveIndicator({ status, lastSaved }) {
  const getStatusDisplay = () => {
    switch(status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-ink-500">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="type-detail-caption">Saving...</span>
          </div>
        )
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-success">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="type-detail-caption">
              Saved {lastSaved ? `at ${new Date(lastSaved).toLocaleTimeString()}` : ''}
            </span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center gap-2 text-error">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="type-detail-caption">Failed to save</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-end">
      {getStatusDisplay()}
    </div>
  )
}

// Unsaved Changes Warning
export function UnsavedChangesWarning({ hasChanges, onSave, onDiscard }) {
  if (!hasChanges) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-xl elev-3 rounded-lg p-4 flex items-center gap-4">
        <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="type-list-body text-ink-700">You have unsaved changes</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white type-list-body font-medium transition-colors"
          >
            Save
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-1.5 rounded-lg glass hover:glass-brand text-ink-700 hover:text-white type-list-body transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}

// Form Progress Bar
export function FormProgressBar({ progress }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="type-detail-caption text-ink-500">Form Progress</span>
        <span className="type-detail-caption text-ink-700 font-medium">{progress}%</span>
      </div>
      <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Validation Summary
export function ValidationSummary({ errors }) {
  if (!errors || errors.length === 0) return null

  return (
    <div className="p-4 rounded-lg bg-error/10 border border-error/20">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="type-list-body text-error font-medium mb-2">
            Please fix the following errors:
          </p>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="type-detail-caption text-error flex items-start gap-1">
                <span>•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Multi-Step Form Container
export default function MultiStepForm({
  steps,
  children,
  onSubmit,
  onStepChange,
  initialStep = 0,
  showProgress = true,
  className = ''
}) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [completedSteps, setCompletedSteps] = useState([])
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  const handleStepChange = (step) => {
    setCurrentStep(step)
    if (onStepChange) {
      onStepChange(step)
    }
  }

  const markStepComplete = (step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
  }

  const progress = Math.round(((completedSteps.length) / steps.length) * 100)

  return (
    <div className={`multi-step-form ${className}`}>
      {/* Stepper */}
      <FormStepper
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepChange}
      />

      {/* Progress Bar */}
      {showProgress && (
        <div className="px-6 py-3 border-b border-ink-100">
          <div className="max-w-4xl mx-auto">
            <FormProgressBar progress={progress} />
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-6">
        {children({
          currentStep,
          setCurrentStep,
          markStepComplete,
          formData,
          setFormData,
          errors,
          setErrors
        })}
      </div>
    </div>
  )
}