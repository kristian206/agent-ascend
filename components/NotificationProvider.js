'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '@/components/Toast'

const NotificationContext = createContext({})

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export default function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((notification) => {
    const id = Date.now()
    const newToast = { ...notification, id }
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const value = {
    showToast,
    removeToast
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render all active toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(-${index * 80}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            <Toast
              notification={toast}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration || 5000}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}