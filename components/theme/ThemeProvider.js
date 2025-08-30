'use client'
import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  // Always use dark mode
  useEffect(() => {
    // Set dark mode on mount
    document.documentElement.setAttribute('data-theme', 'dark')
    document.documentElement.classList.add('dark')
    
    // Remove any old UI version classes
    document.body.classList.remove('ui-v1', 'ui-v2')
  }, [])

  return (
    <ThemeContext.Provider value={{}}>
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