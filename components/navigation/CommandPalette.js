'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// Search index - in production this would come from a backend
const SEARCH_INDEX = {
  entities: [
    // Sample leads
    { type: 'lead', id: '1', name: 'John Smith', meta: 'Interested in auto policy', icon: '👤' },
    { type: 'lead', id: '2', name: 'Sarah Johnson', meta: 'Home insurance quote', icon: '👤' },
    { type: 'lead', id: '3', name: 'Mike Davis', meta: 'Life insurance inquiry', icon: '👤' },
    
    // Sample policies
    { type: 'policy', id: 'P001', name: 'AUTO-2024-001', meta: 'John Smith - Active', icon: '🚗' },
    { type: 'policy', id: 'P002', name: 'HOME-2024-042', meta: 'Sarah Johnson - Pending', icon: '🏠' },
    { type: 'policy', id: 'P003', name: 'LIFE-2024-018', meta: 'Mike Davis - Active', icon: '❤️' },
    
    // Sample contacts
    { type: 'contact', id: 'C1', name: 'Alice Brown', meta: 'Customer since 2020', icon: '📞' },
    { type: 'contact', id: 'C2', name: 'Bob Wilson', meta: 'Premium member', icon: '📞' },
  ],
  
  actions: [
    // Quick actions
    { type: 'action', id: 'add-lead', name: 'Add New Lead', meta: 'Create a new prospect', icon: '➕', shortcut: '⌘L' },
    { type: 'action', id: 'create-quote', name: 'Create Quote', meta: 'Generate new quote', icon: '💰', shortcut: '⌘Q' },
    { type: 'action', id: 'log-call', name: 'Log Call', meta: 'Record customer interaction', icon: '📞' },
    { type: 'action', id: 'update-goals', name: 'Update Team Goals', meta: 'Set new targets', icon: '🎯' },
    { type: 'action', id: 'daily-checkin', name: 'Daily Check-in', meta: 'Morning intentions', icon: '☀️' },
    { type: 'action', id: 'ring-bell', name: 'Ring the Bell', meta: 'Log a sale', icon: '🔔', shortcut: '⌘B' },
  ],
  
  navigation: [
    // Page navigation
    { type: 'nav', id: 'dashboard', name: 'Dashboard', meta: 'Home overview', icon: '📊', href: '/dashboard' },
    { type: 'nav', id: 'team', name: 'Team', meta: 'Team performance', icon: '👥', href: '/team' },
    { type: 'nav', id: 'metrics', name: 'Analytics', meta: 'Performance metrics', icon: '📈', href: '/metrics' },
    { type: 'nav', id: 'achievements', name: 'Achievements', meta: 'Badges and rewards', icon: '🏆', href: '/achievement-wall' },
    { type: 'nav', id: 'leaderboard', name: 'Leaderboard', meta: 'Rankings', icon: '🥇', href: '/leaderboard' },
    { type: 'nav', id: 'profile', name: 'Profile', meta: 'Your profile', icon: '👤', href: '/profile' },
    { type: 'nav', id: 'settings', name: 'Settings', meta: 'Preferences', icon: '⚙️', href: '/settings' },
  ]
}

// Fuzzy search implementation
function fuzzySearch(query, items) {
  const q = query.toLowerCase()
  return items
    .map(item => {
      const name = item.name.toLowerCase()
      const meta = (item.meta || '').toLowerCase()
      
      // Exact match gets highest score
      if (name === q) return { ...item, score: 100 }
      if (name.startsWith(q)) return { ...item, score: 90 }
      if (name.includes(q)) return { ...item, score: 70 }
      
      // Check meta
      if (meta.includes(q)) return { ...item, score: 50 }
      
      // Character-by-character fuzzy match
      let score = 0
      let searchIndex = 0
      for (let i = 0; i < name.length && searchIndex < q.length; i++) {
        if (name[i] === q[searchIndex]) {
          score += (10 - searchIndex) // Earlier matches score higher
          searchIndex++
        }
      }
      
      if (searchIndex === q.length) {
        return { ...item, score: score + 20 }
      }
      
      return null
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // Limit results
}

export default function CommandPalette({ isOpen, onClose }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  // Combine all searchable items
  const allItems = useMemo(() => [
    ...SEARCH_INDEX.entities,
    ...SEARCH_INDEX.actions,
    ...SEARCH_INDEX.navigation,
  ], [])

  // Search results
  const results = useMemo(() => {
    if (!query) {
      // Show recent/suggested when no query
      return [
        ...SEARCH_INDEX.actions.slice(0, 3),
        ...SEARCH_INDEX.navigation.slice(0, 3),
      ]
    }
    return fuzzySearch(query, allItems)
  }, [query, allItems])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + results.length) % results.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results[selectedIndex]) {
      const items = resultsRef.current.querySelectorAll('[data-index]')
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, results])

  const handleSelect = (item) => {
    if (item.type === 'nav') {
      router.push(item.href)
    } else if (item.type === 'action') {
      // Handle actions
      switch (item.id) {
        case 'add-lead':
          router.push('/leads/new')
          break
        case 'create-quote':
          router.push('/quotes/new')
          break
        case 'daily-checkin':
          router.push('/daily-intentions')
          break
        case 'ring-bell':
          // Trigger bell ring modal
          window.dispatchEvent(new CustomEvent('ring-bell'))
          break
        case 'update-goals':
          router.push('/team?tab=goals')
          break
        default:
          console.log('Action:', item.id)
      }
    } else if (item.type === 'lead') {
      router.push(`/leads/${item.id}`)
    } else if (item.type === 'policy') {
      router.push(`/policies/${item.id}`)
    } else if (item.type === 'contact') {
      router.push(`/contacts/${item.id}`)
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink-900/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div className="fixed inset-x-0 top-20 mx-auto max-w-2xl p-4 z-50">
        <div className="glass-xl rounded-xl elev-4 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-ink-100">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads, policies, or actions..."
                className="flex-1 bg-transparent type-detail-body text-primary placeholder-ink-400 outline-none"
              />
              <kbd className="px-2 py-1 rounded bg-surface-200 type-detail-caption text-ink-400">
                ESC
              </kbd>
            </div>
          </div>
          
          {/* Results */}
          <div ref={resultsRef} className="max-h-96 overflow-y-auto p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                {!query && (
                  <div className="px-3 py-1 type-list-label text-ink-400">
                    SUGGESTED
                  </div>
                )}
                {results.map((item, index) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    data-index={index}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors text-left
                      ${selectedIndex === index 
                        ? 'bg-brand-50 text-brand-700' 
                        : 'hover:bg-surface-100 text-ink-700'
                      }
                    `}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="type-list-body font-medium truncate">
                        {item.name}
                      </div>
                      <div className="type-detail-caption text-ink-400 truncate">
                        {item.meta}
                      </div>
                    </div>
                    {item.shortcut && (
                      <kbd className="px-2 py-1 rounded bg-surface-200 type-detail-caption text-ink-400 flex-shrink-0">
                        {item.shortcut}
                      </kbd>
                    )}
                    {item.type === 'nav' && (
                      <svg className="w-4 h-4 text-ink-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-8 text-center">
                <div className="type-list-body text-ink-400">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between">
            <div className="flex gap-4 type-detail-caption text-ink-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-surface-200">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-surface-200">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-surface-200">ESC</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}