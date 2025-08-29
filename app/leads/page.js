'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/navigation/AppShell'
import DataTable from '@/components/ui/DataTable'
import InspectorDrawer, { DrawerSection, DrawerInfo, DrawerActions } from '@/components/ui/InspectorDrawer'
import { HelpIcon, CoachMarks, useIsFirstRun } from '@/components/help/HelpSystem'

// Sample lead data
const SAMPLE_LEADS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    status: 'hot',
    source: 'Website',
    product: 'Home Insurance',
    value: 5600,
    assignedTo: 'You',
    createdAt: '2024-01-20',
    lastContact: '2 hours ago',
    notes: 'Interested in bundling home and auto. Has a quote from competitor.',
    nextStep: 'Follow up with revised bundle quote'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    status: 'warm',
    source: 'Referral',
    product: 'Auto Insurance',
    value: 2400,
    assignedTo: 'You',
    createdAt: '2024-01-19',
    lastContact: '1 day ago',
    notes: 'Looking for better rates. Currently with State Farm.',
    nextStep: 'Send comparative quote'
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '(555) 345-6789',
    status: 'new',
    source: 'Phone',
    product: 'Life Insurance',
    value: 3200,
    assignedTo: 'You',
    createdAt: '2024-01-21',
    lastContact: 'Never',
    notes: 'Young family, looking for term life coverage.',
    nextStep: 'Initial consultation call'
  },
  {
    id: 4,
    name: 'Robert Wilson',
    email: 'rwilson@email.com',
    phone: '(555) 456-7890',
    status: 'cold',
    source: 'Email Campaign',
    product: 'Business Insurance',
    value: 12000,
    assignedTo: 'Team',
    createdAt: '2024-01-15',
    lastContact: '1 week ago',
    notes: 'Small business owner, needs general liability.',
    nextStep: 'Re-engage with new offer'
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '(555) 567-8901',
    status: 'hot',
    source: 'Walk-in',
    product: 'Auto + Home Bundle',
    value: 8500,
    assignedTo: 'You',
    createdAt: '2024-01-20',
    lastContact: '3 hours ago',
    notes: 'Ready to switch. Needs quote ASAP.',
    nextStep: 'Finalize paperwork'
  },
]

// Table columns configuration
const COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (value, row) => (
      <div>
        <p className="type-list-body font-medium text-primary">{value}</p>
        <p className="type-detail-caption text-ink-400">{row.email}</p>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '120px',
    render: (value) => {
      const statusConfig = {
        hot: { color: 'bg-error/10 text-error border-error/20', label: '🔥 Hot' },
        warm: { color: 'bg-warning/10 text-warning border-warning/20', label: '⭐ Warm' },
        new: { color: 'bg-brand-50 text-brand-600 border-brand-200', label: '✨ New' },
        cold: { color: 'bg-ink-100 text-ink-600 border-ink-200', label: '❄️ Cold' },
      }
      const config = statusConfig[value] || statusConfig.cold
      return (
        <span className={`px-2 py-1 rounded-full border type-detail-caption font-medium ${config.color}`}>
          {config.label}
        </span>
      )
    }
  },
  {
    key: 'product',
    label: 'Product',
    sortable: true,
  },
  {
    key: 'value',
    label: 'Value',
    sortable: true,
    width: '100px',
    render: (value) => (
      <span className="type-list-body font-medium text-success">
        ${value.toLocaleString()}
      </span>
    )
  },
  {
    key: 'assignedTo',
    label: 'Assigned',
    sortable: true,
    width: '100px',
    render: (value) => (
      <span className={`type-list-body ${value === 'You' ? 'text-brand-600 font-medium' : 'text-ink-600'}`}>
        {value}
      </span>
    )
  },
  {
    key: 'lastContact',
    label: 'Last Contact',
    sortable: true,
    width: '120px',
    render: (value) => (
      <span className="type-detail-caption text-ink-500">
        {value}
      </span>
    )
  },
  {
    key: 'source',
    label: 'Source',
    sortable: true,
    visible: false, // Hidden by default
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    visible: false, // Hidden by default
    render: (value) => (
      <span className="type-detail-caption text-ink-500">
        {new Date(value).toLocaleDateString()}
      </span>
    )
  },
]

export default function LeadsPage() {
  const { user, userData } = useAuth()
  const [leads, setLeads] = useState(SAMPLE_LEADS)
  const [selectedLead, setSelectedLead] = useState(null)
  const [sortBy, setSortBy] = useState('status')
  const [sortDirection, setSortDirection] = useState('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const { isFirstRun, markAsSeen } = useIsFirstRun('leads-onboarding')

  // Sort leads
  const sortedLeads = [...leads].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    
    if (sortBy === 'status') {
      const statusOrder = { hot: 4, warm: 3, new: 2, cold: 1 }
      const aOrder = statusOrder[aVal] || 0
      const bOrder = statusOrder[bVal] || 0
      return sortDirection === 'asc' ? aOrder - bOrder : bOrder - aOrder
    }
    
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  // Filter leads
  const filteredLeads = sortedLeads.filter(lead => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.product.toLowerCase().includes(query) ||
      lead.status.toLowerCase().includes(query)
    )
  })

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  // Row actions
  const rowActions = [
    {
      id: 'view',
      label: 'View',
      icon: <svg className="w-4 h-4 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>,
      onClick: (row) => window.location.href = `/leads/${row.id}`
    },
    {
      id: 'call',
      label: 'Call',
      icon: <svg className="w-4 h-4 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>,
      onClick: (row) => window.open(`tel:${row.phone}`)
    },
    {
      id: 'email',
      label: 'Email',
      icon: <svg className="w-4 h-4 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      onClick: (row) => window.open(`mailto:${row.email}`)
    },
    {
      id: 'note',
      label: 'Add Note',
      icon: <svg className="w-4 h-4 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      onClick: (row) => console.log('Add note for', row.name)
    },
  ]

  // Bulk actions
  const bulkActions = [
    {
      id: 'assign',
      label: 'Assign',
      icon: '👤',
      onClick: (ids) => console.log('Assign leads:', ids)
    },
    {
      id: 'export',
      label: 'Export',
      icon: '📥',
      onClick: (ids) => console.log('Export leads:', ids)
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      variant: 'danger',
      onClick: (ids) => {
        setLeads(leads.filter(l => !ids.includes(l.id)))
      }
    },
  ]

  if (!user) return null

  return (
    <AppShell user={userData}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="type-dashboard-title text-primary">Leads</h1>
                <HelpIcon section="leads-table" />
              </div>
              <p className="type-detail-body text-secondary mt-1">
                {filteredLeads.length} active leads
              </p>
            </div>
            <div className="flex items-center gap-2">
              <HelpIcon section="leads-create" />
              <button 
                onClick={() => window.location.href = '/leads/create'}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white type-list-body font-medium hover:shadow-lg transition-all"
                id="add-lead-button"
              >
                + Add Lead
              </button>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md" id="search-section">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg glass border border-ink-100 type-list-body text-primary placeholder-ink-400 focus:outline-none focus:border-brand-300"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Data Table */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="type-list-heading text-primary">Lead Management</h2>
            <HelpIcon section="leads-actions" />
          </div>
          <div className="glass radius-lg overflow-hidden" id="table-section">
          <DataTable
            columns={COLUMNS}
            data={filteredLeads}
            onRowClick={(row) => window.location.href = `/leads/${row.id}`}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            rowActions={rowActions}
            bulkActions={bulkActions}
            preferencesKey="leads-table"
          />
        </div>
        </div>

        {/* Inspector Drawer */}
        <InspectorDrawer
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={selectedLead?.name}
          subtitle={selectedLead?.email}
        >
          {selectedLead && (
            <>
              {/* Quick Actions */}
              <DrawerActions
                actions={[
                  {
                    id: 'call',
                    label: 'Call Now',
                    icon: '📞',
                    variant: 'primary',
                    onClick: () => window.open(`tel:${selectedLead.phone}`)
                  },
                  {
                    id: 'email',
                    label: 'Send Email',
                    icon: '✉️',
                    onClick: () => window.open(`mailto:${selectedLead.email}`)
                  },
                  {
                    id: 'quote',
                    label: 'Create Quote',
                    icon: '💰',
                    onClick: () => console.log('Create quote')
                  },
                ]}
              />

              {/* Lead Info */}
              <DrawerSection title="CONTACT INFORMATION">
                <DrawerInfo label="Phone" value={selectedLead.phone} icon="📱" />
                <DrawerInfo label="Email" value={selectedLead.email} icon="📧" />
                <DrawerInfo label="Source" value={selectedLead.source} icon="🔗" />
              </DrawerSection>

              {/* Lead Details */}
              <DrawerSection title="LEAD DETAILS">
                <DrawerInfo label="Status" value={
                  <span className={`px-2 py-1 rounded-full type-detail-caption font-medium ${
                    selectedLead.status === 'hot' ? 'bg-error/10 text-error' :
                    selectedLead.status === 'warm' ? 'bg-warning/10 text-warning' :
                    selectedLead.status === 'new' ? 'bg-brand-50 text-brand-600' :
                    'bg-ink-100 text-ink-600'
                  }`}>
                    {selectedLead.status.toUpperCase()}
                  </span>
                } />
                <DrawerInfo label="Product" value={selectedLead.product} icon="📋" />
                <DrawerInfo label="Value" value={`$${selectedLead.value.toLocaleString()}`} icon="💵" />
                <DrawerInfo label="Assigned To" value={selectedLead.assignedTo} icon="👤" />
                <DrawerInfo label="Created" value={new Date(selectedLead.createdAt).toLocaleDateString()} icon="📅" />
                <DrawerInfo label="Last Contact" value={selectedLead.lastContact} icon="🕐" />
              </DrawerSection>

              {/* Notes */}
              <DrawerSection title="NOTES">
                <div className="p-3 rounded-lg bg-surface-100">
                  <p className="type-list-body text-ink-700">{selectedLead.notes}</p>
                </div>
              </DrawerSection>

              {/* Next Steps */}
              <DrawerSection title="NEXT STEPS">
                <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
                  <p className="type-list-body text-brand-700">
                    <span className="font-medium">Action Required:</span> {selectedLead.nextStep}
                  </p>
                </div>
              </DrawerSection>

              {/* Activity Timeline */}
              <DrawerSection title="RECENT ACTIVITY">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">📞</span>
                    </div>
                    <div className="flex-1">
                      <p className="type-list-body text-primary">Phone call completed</p>
                      <p className="type-detail-caption text-ink-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">📧</span>
                    </div>
                    <div className="flex-1">
                      <p className="type-list-body text-primary">Quote sent</p>
                      <p className="type-detail-caption text-ink-400">Yesterday at 3:45 PM</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">➕</span>
                    </div>
                    <div className="flex-1">
                      <p className="type-list-body text-primary">Lead created</p>
                      <p className="type-detail-caption text-ink-400">{new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}
        </InspectorDrawer>
      </div>
      
      {/* Coach Marks for first-time users */}
      {isFirstRun && (
        <CoachMarks
          marks={[
            {
              id: 'leads-welcome',
              title: 'Welcome to Lead Management!',
              description: 'This is where you manage all your leads from initial contact to closing. Let me show you the key features.',
              tooltipTop: '20%',
              tooltipLeft: '50%'
            },
            {
              id: 'leads-search',
              element: '#search-section',
              title: 'Quick Search',
              description: 'Find leads instantly by name, email, or product. The search updates in real-time as you type.',
              tooltipTop: '250px',
              tooltipLeft: '50px'
            },
            {
              id: 'leads-table',
              element: '#table-section',
              title: 'Lead Table',
              description: 'Click column headers to sort. Hover over rows for quick actions. Select multiple leads for bulk operations.',
              tooltipTop: '400px',
              tooltipLeft: '50px'
            },
            {
              id: 'leads-add',
              element: '#add-lead-button',
              title: 'Add New Leads',
              description: 'Click here to add a new lead. The multi-step form guides you through capturing all necessary information.',
              tooltipTop: '150px',
              tooltipRight: '200px'
            },
            {
              id: 'leads-actions',
              title: 'Quick Actions',
              description: 'Hover over any lead row to see action buttons. You can call, email, or add notes without leaving this page.',
              tooltipTop: '450px',
              tooltipLeft: '300px'
            }
          ]}
          onComplete={markAsSeen}
        />
      )}
    </AppShell>
  )
}