import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import NotificationProvider from '@/components/NotificationProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import DailyCheckInModal from '@/components/DailyCheckInModal'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'Agent Ascend - Performance Gamification Platform',
  description: 'Elevate your performance with intelligent gamification and team collaboration',
  keywords: 'performance, gamification, team collaboration, productivity, goals',
  authors: [{ name: 'Agent Ascend Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary area="application">
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <DailyCheckInModal />
                <div className="min-h-screen relative bg-liquid-gradient">
                  {/* LiquidGlass Background Layers */}
                  <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('/images/bg/grid.svg')] opacity-30 mix-blend-soft-light" />
                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-[url('/images/bg/noise.svg')] opacity-40" />
                    {/* Gradient Orbs */}
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-lavender/20 rounded-full blur-3xl animate-float" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-seafoam/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-aa-blue-300/10 rounded-full blur-3xl animate-pulse-slow" />
                  </div>
                  
                  {/* Main Content */}
                  <div className="relative z-base">
                    <ErrorBoundary area="page">
                      {children}
                    </ErrorBoundary>
                  </div>
                </div>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}