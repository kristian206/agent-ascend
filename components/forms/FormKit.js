'use client'
import { useState, useEffect, useRef } from 'react'

// Text Input Component
export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required,
  disabled,
  type = 'text',
  icon,
  autoFocus,
  className = ''
}) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={name} className="block mb-2">
        <span className="type-list-label text-ink-600">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      
      <div className={`relative ${icon ? 'flex items-center' : ''}`}>
        {icon && (
          <span className="absolute left-3 text-ink-400 text-lg">{icon}</span>
        )}
        <input
          ref={inputRef}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-2.5 rounded-lg
            ${icon ? 'pl-10' : ''}
            glass border transition-all
            type-list-body text-primary
            placeholder:text-ink-400
            ${isFocused ? 'border-brand-400 ring-2 ring-brand-200/30' : 'border-ink-200'}
            ${error ? 'border-error ring-2 ring-error/20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-100' : ''}
            focus:outline-none
          `}
        />
      </div>
      
      {(helperText || error) && (
        <div className="mt-2">
          {error && (
            <p className="type-detail-caption text-error flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="type-detail-caption text-ink-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Select Dropdown Component
export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  helperText,
  error,
  required,
  disabled,
  icon,
  className = ''
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={name} className="block mb-2">
        <span className="type-list-label text-ink-600">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      
      <div className={`relative ${icon ? 'flex items-center' : ''}`}>
        {icon && (
          <span className="absolute left-3 text-ink-400 text-lg z-10">{icon}</span>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-2.5 rounded-lg
            ${icon ? 'pl-10' : ''}
            glass border transition-all
            type-list-body text-primary
            appearance-none cursor-pointer
            ${isFocused ? 'border-brand-400 ring-2 ring-brand-200/30' : 'border-ink-200'}
            ${error ? 'border-error ring-2 ring-error/20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-100' : ''}
            focus:outline-none
          `}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {(helperText || error) && (
        <div className="mt-2">
          {error && (
            <p className="type-detail-caption text-error flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="type-detail-caption text-ink-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Textarea Component
export function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required,
  disabled,
  rows = 4,
  maxLength,
  className = ''
}) {
  const [isFocused, setIsFocused] = useState(false)
  const characterCount = value?.length || 0

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={name} className="block mb-2">
        <span className="type-list-label text-ink-600">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      
      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-2.5 rounded-lg
            glass border transition-all
            type-list-body text-primary
            placeholder:text-ink-400
            resize-none
            ${isFocused ? 'border-brand-400 ring-2 ring-brand-200/30' : 'border-ink-200'}
            ${error ? 'border-error ring-2 ring-error/20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-100' : ''}
            focus:outline-none
          `}
        />
        {maxLength && (
          <div className="absolute bottom-2 right-2 type-detail-caption text-ink-400">
            {characterCount}/{maxLength}
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <div className="mt-2">
          {error && (
            <p className="type-detail-caption text-error flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="type-detail-caption text-ink-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Radio Group Component
export function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  helperText,
  error,
  required,
  disabled,
  inline = false,
  className = ''
}) {
  return (
    <div className={`form-field ${className}`}>
      <fieldset>
        <legend className="block mb-3">
          <span className="type-list-label text-ink-600">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </legend>
        
        <div className={inline ? 'flex gap-4' : 'space-y-2'}>
          {options.map(option => (
            <label
              key={option.value}
              className={`
                flex items-center gap-2 cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={disabled || option.disabled}
                className="w-4 h-4 text-brand-500 border-ink-300 focus:ring-brand-500"
              />
              <span className="type-list-body text-ink-700">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      
      {(helperText || error) && (
        <div className="mt-2">
          {error && (
            <p className="type-detail-caption text-error flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="type-detail-caption text-ink-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Checkbox Component
export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  helperText,
  error,
  disabled,
  className = ''
}) {
  return (
    <div className={`form-field ${className}`}>
      <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 mt-0.5 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
        />
        <div className="flex-1">
          <span className="type-list-body text-ink-700">{label}</span>
          {helperText && (
            <p className="type-detail-caption text-ink-500 mt-1">{helperText}</p>
          )}
        </div>
      </label>
      
      {error && (
        <div className="mt-2 ml-7">
          <p className="type-detail-caption text-error flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  )
}

// Toggle Switch Component
export function ToggleField({
  label,
  name,
  checked,
  onChange,
  helperText,
  disabled,
  className = ''
}) {
  return (
    <div className={`form-field ${className}`}>
      <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            ${checked ? 'bg-brand-500' : 'bg-ink-300'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        <div className="flex-1">
          <span className="type-list-body text-ink-700">{label}</span>
          {helperText && (
            <p className="type-detail-caption text-ink-500 mt-1">{helperText}</p>
          )}
        </div>
      </label>
    </div>
  )
}

// Form Section Component
export function FormSection({ title, description, children, className = '' }) {
  return (
    <div className={`form-section ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="type-list-heading text-primary mb-2">{title}</h3>
          )}
          {description && (
            <p className="type-detail-body text-secondary">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

// Form Actions Component
export function FormActions({
  primaryLabel = 'Save & Continue',
  primaryIcon,
  onPrimary,
  secondaryLabel = 'Cancel',
  onSecondary,
  showSecondary = true,
  isLoading = false,
  disabled = false,
  className = ''
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="submit"
        onClick={onPrimary}
        disabled={disabled || isLoading}
        className={`
          px-6 py-2.5 rounded-lg font-medium
          bg-gradient-to-r from-brand-500 to-brand-600
          hover:from-brand-600 hover:to-brand-700
          text-white type-list-body
          flex items-center gap-2
          transition-all shadow-lg hover:shadow-xl
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </>
        ) : (
          <>
            {primaryIcon && <span className="text-lg">{primaryIcon}</span>}
            {primaryLabel}
          </>
        )}
      </button>
      
      {showSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg glass hover:glass-brand text-ink-700 hover:text-white type-list-body font-medium transition-all"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  )
}

// Success Message Component
export function SuccessMessage({ message, onDismiss }) {
  return (
    <div className="p-4 rounded-lg bg-success/10 border border-success/20 flex items-start gap-3">
      <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <p className="type-list-body text-success flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-success hover:text-success/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}