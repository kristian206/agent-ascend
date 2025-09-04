'use client'
import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block type-list-label text-ink-300"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`
            w-full p-space-3 radius-lg
            glass border border-ink-200/20
            type-detail-body text-white placeholder-ink-400
            focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-black
            focus:border-brand-400/50
            hover:border-ink-200/30
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-red-400/50 focus:ring-red-400' : ''}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="type-detail-caption text-red-400 animate-fade-in-up">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="type-detail-caption text-ink-400">
          {helperText}
        </p>
      )}
    </div>
  )
})

export default Input

export const Textarea = forwardRef(function Textarea({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  id,
  ...props
}, ref) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block type-list-label text-ink-300"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={`
            w-full p-space-3 radius-lg
            glass border border-ink-200/20
            type-detail-body text-white placeholder-ink-400
            focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-black
            focus:border-brand-400/50
            hover:border-ink-200/30
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            resize-vertical
            ${error ? 'border-red-400/50 focus:ring-red-400' : ''}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="type-detail-caption text-red-400 animate-fade-in-up">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="type-detail-caption text-ink-400">
          {helperText}
        </p>
      )}
    </div>
  )
})

export const Select = forwardRef(function Select({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  children,
  id,
  ...props
}, ref) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block type-list-label text-ink-300"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`
            w-full p-space-3 radius-lg
            glass border border-ink-200/20
            type-detail-body text-white
            focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-black
            focus:border-brand-400/50
            hover:border-ink-200/30
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            appearance-none cursor-pointer
            ${error ? 'border-red-400/50 focus:ring-red-400' : ''}
          `}
          {...props}
        >
          {children}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <p className="type-detail-caption text-red-400 animate-fade-in-up">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="type-detail-caption text-ink-400">
          {helperText}
        </p>
      )}
    </div>
  )
})