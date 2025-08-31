'use client'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen p-8">
      {/* Page Header */}
      <header className="mb-12">
        <h1 className="type-dashboard-hero text-brand-500 mb-2">Design System</h1>
        <p className="type-detail-body text-gray-300">
          Core design tokens, typography, and components
        </p>
      </header>

      {/* Color Palette Section */}
      <section className="mb-12">
        <h2 className="type-dashboard-title text-primary mb-6">Brand Colors</h2>
        <div className="grid grid-cols-10 gap-2 mb-8">
          {[900, 800, 700, 600, 500, 400, 300, 200, 100, 50].map(shade => (
            <div key={shade} className="text-center">
              <div 
                className="h-20 rounded-lg elev-1 mb-2" 
                style={{ backgroundColor: `var(--brand-${shade})` }}
              />
              <span className="type-list-label text-gray-400">{shade}</span>
            </div>
          ))}
        </div>

        <h3 className="type-list-heading text-primary mb-4">Ink Scale</h3>
        <div className="grid grid-cols-11 gap-2">
          {[900, 800, 700, 600, 500, 400, 300, 200, 100, 50, 0].map(shade => (
            <div key={shade} className="text-center">
              <div 
                className="h-16 rounded-md border elev-1 mb-2" 
                style={{ backgroundColor: `var(--ink-${shade})` }}
              />
              <span className="type-list-label text-gray-400">{shade}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Section */}
      <section className="mb-12">
        <h2 className="type-dashboard-title text-primary mb-6">Typography Scale</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="type-list-heading text-gray-300 mb-4">Dashboard</h3>
            <div className="space-y-4">
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Hero</p>
                <p className="type-dashboard-hero">48px Dashboard Hero</p>
              </div>
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Title</p>
                <p className="type-dashboard-title">32px Dashboard Title</p>
              </div>
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Metric</p>
                <p className="type-dashboard-metric">24px Dashboard Metric</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="type-list-heading text-gray-300 mb-4">List</h3>
            <div className="space-y-4">
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Heading</p>
                <p className="type-list-heading">18px List Heading</p>
              </div>
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Body</p>
                <p className="type-list-body">14px List Body Text</p>
              </div>
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Label</p>
                <p className="type-list-label">12px LIST LABEL</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="type-list-heading text-gray-300 mb-4">Detail</h3>
            <div className="space-y-4">
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Title</p>
                <p className="type-detail-title">20px Detail Title</p>
              </div>
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Body</p>
                <p className="type-detail-body">16px Detail Body Text for reading content</p>
              </div>
              <div className="glass radius-lg p-space-4">
                <p className="type-list-label text-gray-400 mb-2">Caption</p>
                <p className="type-detail-caption">13px Detail Caption Text</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Glass Surfaces Section */}
      <section className="mb-12">
        <h2 className="type-dashboard-title text-primary mb-6">Glass Surfaces</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass radius-lg p-space-6">
            <h3 className="type-list-heading text-primary mb-2">Default Glass</h3>
            <p className="type-list-body text-gray-300">
              Standard glass surface with medium blur
            </p>
          </div>

          <div className="glass-xs radius-lg p-space-6">
            <h3 className="type-list-heading text-primary mb-2">Glass XS</h3>
            <p className="type-list-body text-gray-300">
              Minimal blur for subtle depth
            </p>
          </div>

          <div className="glass-sm radius-lg p-space-6">
            <h3 className="type-list-heading text-primary mb-2">Glass SM</h3>
            <p className="type-list-body text-gray-300">
              Small blur for light overlay
            </p>
          </div>

          <div className="glass-lg radius-lg p-space-6">
            <h3 className="type-list-heading text-primary mb-2">Glass LG</h3>
            <p className="type-list-body text-gray-300">
              Large blur for prominent surfaces
            </p>
          </div>

          <div className="glass-xl radius-lg p-space-6">
            <h3 className="type-list-heading text-primary mb-2">Glass XL</h3>
            <p className="type-list-body text-gray-300">
              Extra large blur for modals
            </p>
          </div>

          <div className="glass-brand radius-lg p-space-6">
            <h3 className="type-list-heading text-brand mb-2">Glass Brand</h3>
            <p className="type-list-body text-gray-300">
              Glass with brand color tint
            </p>
          </div>
        </div>
      </section>

      {/* Elevation Section */}
      <section className="mb-12">
        <h2 className="type-dashboard-title text-primary mb-6">Elevation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[0, 1, 2, 3, 4].map(level => (
            <div 
              key={level}
              className={`bg-surface-ground radius-lg p-space-6 elev-${level}`}
            >
              <h3 className="type-list-heading text-primary mb-2">Level {level}</h3>
              <p className="type-detail-caption text-gray-300">
                elev-{level} shadow
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="bg-surface-ground radius-lg p-space-6 elev-interactive cursor-pointer">
            <h3 className="type-list-heading text-primary mb-2">Interactive</h3>
            <p className="type-detail-caption text-gray-300">
              Hover me for elevation change
            </p>
          </div>
        </div>
      </section>

      {/* Border Radius Section */}
      <section className="mb-12">
        <h2 className="type-dashboard-title text-primary mb-6">Border Radius</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].map(size => (
            <div key={size} className="text-center">
              <div 
                className={`h-20 bg-brand-500 radius-${size} elev-1 mb-2`}
              />
              <span className="type-list-label text-gray-400">radius-{size}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing Section */}
      <section className="mb-12">
        <h2 className="type-dashboard-title text-primary mb-6">Spacing Scale</h2>
        
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map(space => (
            <div key={space} className="flex items-center gap-4">
              <span className="type-list-label text-gray-400 w-20">space-{space}</span>
              <div 
                className="bg-brand-500 h-4 radius-sm"
                style={{ width: `var(--space-${space})` }}
              />
              <span className="type-detail-caption text-gray-300">
                {space * 4}px
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}