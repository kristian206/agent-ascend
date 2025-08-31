'use client'
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // In production, you could send this to an error reporting service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
      console.log('Would send error to tracking service:', error.toString())
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
    
    // Optionally reload the page if errors keep happening
    if (this.state.errorCount > 3) {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI based on the area of the app
      const { fallback, area = 'application' } = this.props
      
      if (fallback) {
        return fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="glass-error radius-xl p-8 text-center">
              {/* Error Icon */}
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-error/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>

              {/* Error Message */}
              <h2 className="type-dashboard-title text-primary mb-2">
                Oops! Something went wrong
              </h2>
              
              <p className="type-list-body text-gray-300 mb-6">
                {area === 'component' 
                  ? 'This section encountered an error and cannot be displayed.'
                  : 'We encountered an unexpected error. Don\'t worry, your data is safe.'}
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="type-detail-caption text-gray-400 cursor-pointer hover:text-gray-300">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                    <p className="type-detail-mono text-error text-xs break-all">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="mt-2 type-detail-mono text-gray-400 text-xs overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors type-list-body font-medium"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-4 py-2 glass hover:glass-brand rounded-lg transition-colors type-list-body font-medium"
                >
                  Go to Dashboard
                </button>
              </div>

              {/* Error count warning */}
              {this.state.errorCount > 2 && (
                <p className="mt-4 type-detail-caption text-warning">
                  Multiple errors detected. The page may reload automatically.
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Functional component wrapper for easier use
export function withErrorBoundary(Component, area = 'component') {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary area={area}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}