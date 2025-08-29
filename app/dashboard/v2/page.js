'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/navigation/AppShell'
import DashboardCard, { ListCard } from '@/components/dashboard/DashboardCard'
import PerformanceHUD from '@/components/performance/PerformanceHUD'
import { HelpIcon, CoachMarks, useIsFirstRun } from '@/components/help/HelpSystem'

// Sample data - in production this would come from Firebase/API
const SAMPLE_DATA = {
  kpis: {
    monthlyGoal: {
      current: 87500,
      target: 100000,
      percentage: 88
    },
    salesToday: {
      count: 3,
      value: 12500,
      trend: '+23%',
      trendDirection: 'up'
    },
    leadsIn: {
      count: 12,
      new: 5,
      trend: '+2',
      trendDirection: 'up'
    },
    conversion: {
      rate: 24.5,
      trend: '-2.1%',
      trendDirection: 'down'
    }
  },
  workQueue: {
    followUps: [
      { id: 1, title: 'Sarah Johnson', subtitle: 'Home insurance quote follow-up', icon: '📞', meta: '10:30 AM', badge: { type: 'hot', label: 'HOT' } },
      { id: 2, title: 'Mike Davis', subtitle: 'Auto policy renewal discussion', icon: '📧', meta: '11:00 AM' },
      { id: 3, title: 'Emma Wilson', subtitle: 'Life insurance consultation', icon: '🤝', meta: '2:00 PM', badge: { type: 'new', label: 'NEW' } },
      { id: 4, title: 'James Brown', subtitle: 'Bundle quote review', icon: '📞', meta: '3:30 PM' },
      { id: 5, title: 'Lisa Anderson', subtitle: 'Claim status update', icon: '📧', meta: '4:00 PM' },
    ],
    hotLeads: [
      { id: 1, title: 'Robert Chen', subtitle: 'Requesting auto + home bundle', icon: '🔥', meta: '$8,500/yr', badge: { type: 'hot', label: 'HOT' } },
      { id: 2, title: 'Amanda Foster', subtitle: 'Shopping for life insurance', icon: '⭐', meta: '$3,200/yr', badge: { type: 'new', label: 'NEW' } },
      { id: 3, title: 'Daniel Kim', subtitle: 'Commercial property inquiry', icon: '🏢', meta: '$15,000/yr' },
    ]
  },
  recentActivity: [
    { id: 1, title: 'Called Sarah Johnson', subtitle: 'Discussed home insurance options', icon: '📞', meta: '1 hour ago' },
    { id: 2, title: 'Sent quote to Mike Davis', subtitle: 'Auto policy - $1,200/yr', icon: '📧', meta: '2 hours ago' },
    { id: 3, title: 'Added note for Emma Wilson', subtitle: 'Interested in life insurance for family', icon: '📝', meta: '3 hours ago' },
    { id: 4, title: 'Completed sale - James Brown', subtitle: 'Home + Auto bundle - $4,500/yr', icon: '✅', meta: '5 hours ago' },
    { id: 5, title: 'Scheduled meeting with Lisa Anderson', subtitle: 'Policy review - Tomorrow 2 PM', icon: '📅', meta: '6 hours ago' },
    { id: 6, title: 'Updated lead status - Robert Chen', subtitle: 'Moved to Hot Lead', icon: '🔥', meta: 'Yesterday' },
    { id: 7, title: 'Sent follow-up to Amanda Foster', subtitle: 'Life insurance information packet', icon: '📧', meta: 'Yesterday' },
  ]
}

export default function DashboardV2() {
  const { user, userData } = useAuth()
  const [density, setDensity] = useState('default')
  const [data, setData] = useState(SAMPLE_DATA)
  const { isFirstRun, markAsSeen } = useIsFirstRun('dashboard-onboarding')

  // Load user preference for density
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-density')
    if (saved) setDensity(saved)
  }, [])

  const toggleDensity = () => {
    const newDensity = density === 'default' ? 'condensed' : 'default'
    setDensity(newDensity)
    localStorage.setItem('dashboard-density', newDensity)
  }

  const isCondensed = density === 'condensed'

  if (!user) return null

  return (
    <AppShell user={userData}>
      <div className="max-w-7xl mx-auto">
        {/* Header with Density Toggle */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="type-dashboard-title text-primary">
              Dashboard
            </h1>
            <p className="type-detail-body text-secondary mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          {/* Density Toggle */}
          <div className="flex items-center gap-3">
            <span className="type-list-body text-secondary">View:</span>
            <button
              onClick={toggleDensity}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:glass-brand transition-colors"
            >
              {density === 'default' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="type-list-body">Default</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="type-list-body">Condensed</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Row 1: KPIs */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="type-list-heading text-primary">Key Metrics</h2>
            <HelpIcon section="dashboard-kpis" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="kpis-section">
          {/* Monthly Goal */}
          <DashboardCard
            title="Monthly Goal"
            metric={`$${(data.kpis.monthlyGoal.current / 1000).toFixed(1)}k`}
            metricLabel={`of $${(data.kpis.monthlyGoal.target / 1000).toFixed(0)}k target`}
            isCondensed={isCondensed}
            primaryAction={{
              label: 'View',
              onClick: () => console.log('View monthly goal')
            }}
            details={
              <div className="space-y-2">
                <div className="flex justify-between type-list-body">
                  <span className="text-ink-600">Progress</span>
                  <span className="font-medium text-primary">{data.kpis.monthlyGoal.percentage}%</span>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-400 to-brand-600"
                    style={{ width: `${data.kpis.monthlyGoal.percentage}%` }}
                  />
                </div>
                <p className="type-detail-caption text-ink-400">
                  ${((data.kpis.monthlyGoal.target - data.kpis.monthlyGoal.current) / 1000).toFixed(1)}k remaining • 8 days left
                </p>
              </div>
            }
          />

          {/* Sales Today */}
          <DashboardCard
            title="Sales Today"
            metric={data.kpis.salesToday.count}
            metricLabel={`$${(data.kpis.salesToday.value / 1000).toFixed(1)}k value`}
            trend={data.kpis.salesToday.trend}
            trendDirection={data.kpis.salesToday.trendDirection}
            isCondensed={isCondensed}
            primaryAction={{
              label: 'Log Sale',
              onClick: () => window.dispatchEvent(new CustomEvent('ring-bell'))
            }}
            details={
              <div className="space-y-2">
                <div className="type-list-body text-ink-600">Recent Sales:</div>
                <div className="space-y-1">
                  <div className="flex justify-between type-detail-caption">
                    <span>Auto Policy - J. Brown</span>
                    <span className="text-success">$2,400</span>
                  </div>
                  <div className="flex justify-between type-detail-caption">
                    <span>Home Bundle - S. Wilson</span>
                    <span className="text-success">$5,600</span>
                  </div>
                  <div className="flex justify-between type-detail-caption">
                    <span>Life Insurance - M. Davis</span>
                    <span className="text-success">$4,500</span>
                  </div>
                </div>
              </div>
            }
          />

          {/* Leads In */}
          <DashboardCard
            title="Leads In"
            metric={data.kpis.leadsIn.count}
            metricLabel={`${data.kpis.leadsIn.new} new today`}
            trend={data.kpis.leadsIn.trend}
            trendDirection={data.kpis.leadsIn.trendDirection}
            isCondensed={isCondensed}
            primaryAction={{
              label: 'Add Lead',
              onClick: () => console.log('Add lead')
            }}
            details={
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="type-list-heading text-primary">{data.kpis.leadsIn.new}</div>
                    <div className="type-detail-caption text-ink-400">New</div>
                  </div>
                  <div>
                    <div className="type-list-heading text-primary">4</div>
                    <div className="type-detail-caption text-ink-400">Contacted</div>
                  </div>
                  <div>
                    <div className="type-list-heading text-primary">3</div>
                    <div className="type-detail-caption text-ink-400">Qualified</div>
                  </div>
                </div>
              </div>
            }
          />

          {/* Conversion Rate */}
          <DashboardCard
            title="Conversion"
            metric={`${data.kpis.conversion.rate}%`}
            metricLabel="lead to sale"
            trend={data.kpis.conversion.trend}
            trendDirection={data.kpis.conversion.trendDirection}
            isCondensed={isCondensed}
            primaryAction={{
              label: 'Details',
              onClick: () => console.log('View conversion details')
            }}
            details={
              <div className="space-y-2">
                <div className="type-list-body text-ink-600">This Month:</div>
                <div className="space-y-1">
                  <div className="flex justify-between type-detail-caption">
                    <span>Leads Converted</span>
                    <span className="font-medium">12 of 49</span>
                  </div>
                  <div className="flex justify-between type-detail-caption">
                    <span>Avg. Time to Close</span>
                    <span className="font-medium">3.2 days</span>
                  </div>
                  <div className="flex justify-between type-detail-caption">
                    <span>Avg. Deal Size</span>
                    <span className="font-medium">$4,200</span>
                  </div>
                </div>
              </div>
            }
          />
        </div>
        </div>

        {/* Performance HUD - Compact View */}
        <div className="relative mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="type-list-heading text-primary">Performance</h2>
            <HelpIcon section="dashboard-performance" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="performance-section">
          <div className="lg:col-span-2">
            <PerformanceHUD 
              userId={userData?.uid}
              view="personal"
              compact={true}
              showCoaching={true}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="glass-xl rounded-lg p-4 h-full">
              <h3 className="type-list-heading text-primary mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 rounded-lg glass hover:glass-brand text-left type-list-body text-ink-700 hover:text-white transition-all">
                  📞 Start Call Session
                </button>
                <button className="w-full px-4 py-2 rounded-lg glass hover:glass-brand text-left type-list-body text-ink-700 hover:text-white transition-all">
                  📧 Send Follow-ups
                </button>
                <button className="w-full px-4 py-2 rounded-lg glass hover:glass-brand text-left type-list-body text-ink-700 hover:text-white transition-all">
                  📊 View Full HUD
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Row 3: Work Queue */}
        <div className="relative mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="type-list-heading text-primary">Work Queue</h2>
            <HelpIcon section="dashboard-work-queue" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="work-queue-section">
          {/* Due Follow-ups */}
          <ListCard
            title="Due Follow-ups"
            items={data.workQueue.followUps}
            maxItems={isCondensed ? 4 : 3}
            isCondensed={isCondensed}
            primaryAction={{
              label: 'View All',
              onClick: () => console.log('View all follow-ups')
            }}
            emptyMessage="No follow-ups scheduled"
          />

          {/* Hot Leads */}
          <ListCard
            title="Hot Leads"
            items={data.workQueue.hotLeads}
            maxItems={isCondensed ? 4 : 3}
            isCondensed={isCondensed}
            primaryAction={{
              label: 'View All',
              onClick: () => console.log('View all hot leads')
            }}
            emptyMessage="No hot leads at the moment"
          />
        </div>
        </div>

        {/* Row 4: Recent Activity */}
        <div className="relative mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="type-list-heading text-primary">Recent Activity</h2>
            <HelpIcon section="dashboard-activity" />
          </div>
          <div id="activity-section">
          <ListCard
            title="Recent Activity"
            items={data.recentActivity}
            maxItems={isCondensed ? 6 : 5}
            isCondensed={isCondensed}
            primaryAction={{
              label: 'View All',
              onClick: () => console.log('View all activity')
            }}
            emptyMessage="No recent activity"
          />
        </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="glass radius-lg p-4 flex items-center justify-around">
          <div className="text-center">
            <div className="type-dashboard-metric text-brand-600">
              {userData?.streak || 0}
            </div>
            <div className="type-list-label text-ink-400">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="type-dashboard-metric text-brand-600">
              {userData?.level || 1}
            </div>
            <div className="type-list-label text-ink-400">Level</div>
          </div>
          <div className="text-center">
            <div className="type-dashboard-metric text-brand-600">
              {userData?.todayPoints || 0}
            </div>
            <div className="type-list-label text-ink-400">Points Today</div>
          </div>
          <div className="text-center">
            <div className="type-dashboard-metric text-brand-600">
              #{userData?.rank || '—'}
            </div>
            <div className="type-list-label text-ink-400">Team Rank</div>
          </div>
        </div>
      </div>
      
      {/* Coach Marks for first-time users */}
      {isFirstRun && (
        <CoachMarks
          marks={[
            {
              id: 'welcome',
              title: 'Welcome to Your Dashboard!',
              description: 'This is your command center. Let me show you around the key features.',
              tooltipTop: '20%',
              tooltipLeft: '50%',
              tooltipRight: 'auto'
            },
            {
              id: 'kpis',
              element: '#kpis-section',
              title: 'Track Your Key Metrics',
              description: 'Monitor your progress toward monthly and weekly goals. Click any card for more details.',
              top: '200px',
              left: '20px',
              right: '20px',
              height: '180px',
              tooltipTop: '400px',
              tooltipLeft: '50px'
            },
            {
              id: 'performance',
              element: '#performance-section',
              title: 'Performance HUD',
              description: 'Get AI-powered coaching suggestions based on your real-time performance metrics.',
              tooltipTop: '450px',
              tooltipLeft: '50px'
            },
            {
              id: 'work-queue',
              element: '#work-queue-section',
              title: 'Your Work Queue',
              description: 'See your prioritized tasks and follow-ups. Hot leads appear at the top.',
              tooltipTop: '550px',
              tooltipLeft: '50px'
            },
            {
              id: 'activity',
              element: '#activity-section',
              title: 'Recent Activity',
              description: 'Track your interactions and their outcomes. Use this to identify patterns in what works.',
              tooltipTop: '650px',
              tooltipLeft: '50px'
            }
          ]}
          onComplete={markAsSeen}
        />
      )}
    </AppShell>
  )
}