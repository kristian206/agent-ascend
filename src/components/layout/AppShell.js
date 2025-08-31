'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TopBar from './TopBar'
import LeftRail from './LeftRail'
import CommandPalette from './CommandPalette'
import FloatingAction from './FloatingAction'

export default function AppShell({ children, user }) {
  const searchParams = useSearchParams()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isRailCollapsed, setIsRailCollapsed] = useState(false)
  
  // Check if classic UI is requested (default to new UI)
  const useClassicUI = searchParams.get('ui') === 'v1'

  // Load rail state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rail-collapsed')
    if (saved) {
      setIsRailCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save rail state
  const toggleRail = () => {
    const newState = !isRailCollapsed
    setIsRailCollapsed(newState)
    localStorage.setItem('rail-collapsed', JSON.stringify(newState))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandOpen(true)
      }
      
      // Create action: Cmd/Ctrl + N
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('open-create'))
      }
      
      // Toggle sidebar: Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleRail()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // If using classic UI, return children with old Navigation
  if (useClassicUI) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Bar */}
      <TopBar 
        user={user}
        onOpenCommand={() => setIsCommandOpen(true)}
      />
      
      {/* Left Rail */}
      <LeftRail 
        isCollapsed={isRailCollapsed}
        onToggle={toggleRail}
      />
      
      {/* Main Content */}
      <main className={`
        pt-16
        transition-all duration-300
        ${isRailCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
      
      {/* Floating Action Button */}
      <FloatingAction />
      
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleRail}
        className="lg:hidden fixed bottom-6 left-6 w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center elev-3 z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  )
}