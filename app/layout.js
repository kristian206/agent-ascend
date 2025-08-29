import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import NotificationProvider from '@/components/NotificationProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

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
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen relative">
                {/* Background Gradient Orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-float" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl animate-pulse-slow" />
                </div>
                
                {/* Main Content */}
                <div className="relative z-base">
                  {children}
                </div>
              </div>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}