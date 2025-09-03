'use client'
import { useEffect } from 'react'

export function ThemeProvider({ children }) {
  // Always use dark mode
  useEffect(() => {
    // Set dark mode on mount
    document.documentElement.setAttribute('data-theme', 'dark')
    document.documentElement.classList.add('dark')
    
    // Remove any old UI version classes
    document.body.classList.remove('ui-v1', 'ui-v2')
  }, [])

  return children
}

