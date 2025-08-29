import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import NotificationProvider from '@/components/NotificationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Agent Ascend - Performance Gamification Platform',
  description: 'Make work rewarding again with gamification',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}