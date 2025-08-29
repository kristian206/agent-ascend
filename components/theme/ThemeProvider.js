'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
  uiVersion: 'v2',
  setUiVersion: () => {}
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system')
  const [resolvedTheme, setResolvedTheme] = useState('light')
  const [uiVersion, setUiVersion] = useState('v2')
  const [mounted, setMounted] = useState(false)

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system'
    const savedUiVersion = localStorage.getItem('uiVersion') || 'v2'
    
    setTheme(savedTheme)
    setUiVersion(savedUiVersion)
    setMounted(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const applyTheme = (theme) => {
      const root = document.documentElement
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.setAttribute('data-theme', systemTheme)
        setResolvedTheme(systemTheme)
      } else {
        root.setAttribute('data-theme', theme)
        setResolvedTheme(theme)
      }
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e) => {
        const newTheme = e.matches ? 'dark' : 'light'
        root.setAttribute('data-theme', newTheme)
        setResolvedTheme(newTheme)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, mounted])

  // Apply UI version
  useEffect(() => {
    if (!mounted) return
    
    localStorage.setItem('uiVersion', uiVersion)
    
    // Add class to body for conditional styling
    if (uiVersion === 'v1') {
      document.body.classList.add('ui-v1')
      document.body.classList.remove('ui-v2')
    } else {
      document.body.classList.add('ui-v2')
      document.body.classList.remove('ui-v1')
    }
  }, [uiVersion, mounted])

  const value = {
    theme,
    setTheme,
    resolvedTheme: mounted ? resolvedTheme : 'light',
    uiVersion,
    setUiVersion
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Theme Toggle Component
export function ThemeToggle({ className = '' }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg glass ${className}`} />
    )
  }

  const cycleTheme = () => {
    const themes = ['system', 'light', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getIcon = () => {
    if (theme === 'system') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
    if (resolvedTheme === 'dark') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }

  return (
    <button
      onClick={cycleTheme}
      className={`p-2 rounded-lg glass hover:glass-brand transition-colors ${className}`}
      title={`Theme: ${theme}`}
    >
      {getIcon()}
    </button>
  )
}

// UI Version Toggle Component
export function UiVersionToggle({ className = '' }) {
  const { uiVersion, setUiVersion } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 glass rounded-lg p-1 ${className}`}>
      <button
        onClick={() => setUiVersion('v1')}
        className={`px-3 py-1.5 rounded-lg type-list-body transition-all ${
          uiVersion === 'v1' 
            ? 'glass-brand text-white' 
            : 'text-ink-600 hover:bg-surface-100'
        }`}
      >
        Classic
      </button>
      <button
        onClick={() => setUiVersion('v2')}
        className={`px-3 py-1.5 rounded-lg type-list-body transition-all ${
          uiVersion === 'v2' 
            ? 'glass-brand text-white' 
            : 'text-ink-600 hover:bg-surface-100'
        }`}
      >
        Modern
      </button>
    </div>
  )
}