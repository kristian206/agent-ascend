'use client'
import { useState, useEffect, useMemo } from 'react'

export default function DataTable({
  columns,
  data,
  onRowClick,
  onSort,
  sortBy,
  sortDirection,
  rowActions,
  bulkActions,
  stickyHeader = true,
  savePreferences = true,
  preferencesKey = 'table-prefs',
  className = ''
}) {
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [hoveredRow, setHoveredRow] = useState(null)
  const [columnVisibility, setColumnVisibility] = useState({})
  const [columnOrder, setColumnOrder] = useState([])
  
  // Load saved preferences
  useEffect(() => {
    if (savePreferences && preferencesKey) {
      const saved = localStorage.getItem(`${preferencesKey}-columns`)
      if (saved) {
        const prefs = JSON.parse(saved)
        setColumnVisibility(prefs.visibility || {})
        setColumnOrder(prefs.order || [])
      } else {
        // Initialize all columns as visible
        const visibility = {}
        columns.forEach(col => {
          visibility[col.key] = col.visible !== false
        })
        setColumnVisibility(visibility)
        setColumnOrder(columns.map(c => c.key))
      }
    }
  }, [columns, preferencesKey, savePreferences])

  // Save preferences
  const saveColumnPrefs = (visibility, order) => {
    if (savePreferences && preferencesKey) {
      localStorage.setItem(`${preferencesKey}-columns`, JSON.stringify({
        visibility,
        order
      }))
    }
  }

  // Toggle column visibility
  const toggleColumn = (key) => {
    const newVisibility = {
      ...columnVisibility,
      [key]: !columnVisibility[key]
    }
    setColumnVisibility(newVisibility)
    saveColumnPrefs(newVisibility, columnOrder)
  }

  // Get visible columns in order
  const visibleColumns = useMemo(() => {
    const ordered = columnOrder.length > 0 
      ? columnOrder.map(key => columns.find(c => c.key === key)).filter(Boolean)
      : columns
    return ordered.filter(col => columnVisibility[col.key] !== false)
  }, [columns, columnOrder, columnVisibility])

  // Select/deselect rows
  const toggleRowSelection = (id) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  const toggleAllRows = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map(row => row.id)))
    }
  }

  const clearSelection = () => {
    setSelectedRows(new Set())
  }

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (bulkActions && action.onClick) {
      action.onClick(Array.from(selectedRows))
      clearSelection()
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && bulkActions && (
        <div className="absolute top-0 left-0 right-0 z-10 glass-brand border-b border-brand-200 px-4 py-3 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <span className="type-list-body font-medium text-white">
              {selectedRows.size} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-white/70 hover:text-white type-list-body"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleBulkAction(action)}
                className={`
                  px-3 py-1.5 rounded-lg type-list-body font-medium
                  ${action.variant === 'danger' 
                    ? 'bg-error/20 text-white hover:bg-error/30' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }
                  transition-colors
                `}
              >
                {action.icon && <span className="mr-1.5">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className={stickyHeader ? 'sticky top-0 z-5' : ''}>
            <tr className="glass-lg border-b border-ink-100">
              {/* Checkbox column */}
              {bulkActions && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    indeterminate={selectedRows.size > 0 && selectedRows.size < data.length}
                    onChange={toggleAllRows}
                    className="w-4 h-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
                  />
                </th>
              )}
              
              {/* Data columns */}
              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 text-left
                    ${column.sortable ? 'cursor-pointer hover:bg-surface-100' : ''}
                    transition-colors
                  `}
                  onClick={() => column.sortable && onSort && onSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    <span className="type-list-label text-ink-600">
                      {column.label}
                    </span>
                    {column.sortable && sortBy === column.key && (
                      <svg 
                        className={`w-3 h-3 text-brand-500 transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions column */}
              {rowActions && (
                <th className="w-32 px-4 py-3 text-right">
                  <span className="type-list-label text-ink-600">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id}
                className={`
                  border-b border-ink-50 hover:bg-surface-100 transition-colors
                  ${selectedRows.has(row.id) ? 'bg-brand-50' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                onClick={(e) => {
                  // Don't trigger row click on checkbox or action clicks
                  if (!e.target.closest('[data-no-row-click]')) {
                    onRowClick && onRowClick(row)
                  }
                }}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Checkbox */}
                {bulkActions && (
                  <td className="px-4 py-3" data-no-row-click>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                      className="w-4 h-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
                    />
                  </td>
                )}

                {/* Data cells */}
                {visibleColumns.map(column => (
                  <td key={column.key} className="px-4 py-3">
                    {column.render ? (
                      column.render(row[column.key], row)
                    ) : (
                      <span className="type-list-body text-ink-700">
                        {row[column.key]}
                      </span>
                    )}
                  </td>
                ))}

                {/* Actions */}
                {rowActions && (
                  <td className="px-4 py-3" data-no-row-click>
                    <div className={`
                      flex items-center justify-end gap-1
                      transition-opacity duration-200
                      ${hoveredRow === row.id ? 'opacity-100' : 'opacity-0 lg:opacity-0'}
                    `}>
                      {rowActions.map(action => (
                        <button
                          key={action.id}
                          onClick={() => action.onClick(row)}
                          className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors"
                          title={action.label}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {data.length === 0 && (
          <div className="py-12 text-center">
            <p className="type-list-body text-ink-400">No data available</p>
          </div>
        )}
      </div>

      {/* Column preferences dropdown */}
      <ColumnPreferences
        columns={columns}
        visibility={columnVisibility}
        onToggle={toggleColumn}
      />

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

// Column preferences dropdown
function ColumnPreferences({ columns, visibility, onToggle }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg glass hover:glass-brand transition-colors"
        title="Column preferences"
      >
        <svg className="w-4 h-4 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-12 right-0 w-64 glass-xl rounded-lg elev-3 p-3 z-20">
            <h3 className="type-list-heading text-primary mb-3">Visible Columns</h3>
            <div className="space-y-2">
              {columns.map(column => (
                <label 
                  key={column.key}
                  className="flex items-center gap-2 p-2 rounded hover:bg-surface-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibility[column.key] !== false}
                    onChange={() => onToggle(column.key)}
                    className="w-4 h-4 rounded border-ink-300 text-brand-500"
                  />
                  <span className="type-list-body text-ink-700">
                    {column.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}