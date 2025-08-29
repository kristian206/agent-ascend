# Agent Ascend - Development Guide

## Project Overview
Agent Ascend is a performance management platform for insurance agents with gamification elements. The app uses Next.js 13+, React, Firebase, and a modern "Liquid Glass" design system inspired by Apple's design language with Allstate brand colors.

## Design System

### Core Design Principles
- **Liquid Glass**: Translucent surfaces with backdrop blur, creating depth through layering
- **Progressive Disclosure**: Show essential info first, details on demand
- **Single-Purpose Cards**: Each card focuses on one metric/action
- **Density Modes**: Toggle between Default and Condensed views
- **Allstate Palette**: Deep trustworthy blues (#003DA5) with airy surfaces

### Key Files
- `styles/design-tokens.css` - CSS variables for colors, typography, spacing
- `styles/utilities.css` - Glass effects, elevation, typography utilities
- `tailwind.config.js` - Extended with design tokens

### Color Palette
```css
--brand-500: #003DA5;  /* Primary Allstate blue */
--brand-600: #002D75;  /* Darker blue */
--brand-400: #0050C8;  /* Lighter blue */
```

## Navigation Architecture

### AppShell (`components/navigation/AppShell.js`)
Main layout wrapper with:
- **LeftRail**: Collapsible sidebar with pinnable shortcuts
- **TopBar**: Global search, notifications, profile
- **CommandPalette**: Universal search (⌘K)
- **FloatingAction**: Quick creation FAB

### Keyboard Shortcuts
- `⌘K` / `Ctrl+K` - Open command palette
- `⌘N` / `Ctrl+N` - New lead/task
- `⌘B` / `Ctrl+B` - Toggle sidebar
- `Escape` - Close modals/drawers

## Component Patterns

### DashboardCard (`components/dashboard/DashboardCard.js`)
Modular card with:
- Single metric focus
- Optional trend indicator
- Progressive disclosure via Details button
- Density-aware sizing

### DataTable (`components/ui/DataTable.js`)
Feature-rich table with:
- Sticky headers
- Sortable columns
- Row-level hover actions
- Bulk selection with contextual actions
- Column visibility preferences (saved to localStorage)
- Density modes

### InspectorDrawer (`components/ui/InspectorDrawer.js`)
Slide-in panel for:
- Quick entity preview
- Actions without navigation
- Escape key/backdrop dismissal
- Focus trap for accessibility

## Page Structure

### Dashboard V2 (`app/dashboard/v2/page.js`)
Grid layout:
1. **Row 1**: KPIs (Monthly Goal, Sales Today, Leads In, Conversion)
2. **Row 2**: Work Queue (Due Follow-ups, Hot Leads)
3. **Row 3**: Recent Activity
4. **Quick Stats Bar**: Streak, Level, Points, Rank

### List Pages (`app/leads/page.js`)
Standard pattern:
- DataTable for main content
- InspectorDrawer for quick preview
- Row actions (View, Call, Email, Note)
- Bulk operations toolbar

## Development Commands

### Build & Test
```bash
npm run dev     # Start development server
npm run build   # Production build
npm run lint    # Run ESLint
```

### Git Workflow
Working branch: `feat/ui-liquid-glass`

## Firebase Integration Points

### Collections
- `users` - User profiles, settings
- `leads` - Lead management
- `activities` - Activity tracking
- `notifications` - Real-time notifications

### Real-time Updates
Use Firebase listeners for:
- Lead status changes
- New notifications
- Activity feed updates

## UI State Management

### localStorage Keys
- `dashboard-density` - Default/Condensed view preference
- `rail-collapsed` - Sidebar collapsed state
- `pinned-shortcuts` - User's pinned navigation items
- `[table]-columns` - Column visibility per table

## Progressive Enhancement

### Query Params
- `?ui=v2` - Toggle new UI (dashboard redirect)
- Future: `?density=condensed` - Set initial density

## Accessibility

### Focus Management
- Focus trap in modals/drawers
- Keyboard navigation support
- ARIA labels on interactive elements

### Color Contrast
- All text meets WCAG AA standards
- Interactive elements have hover/focus states

## Performance Optimizations

### Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting via Next.js

### Image Optimization
- Use Next.js Image component
- Lazy load below-the-fold images

## Future Enhancements

### Planned Features
1. Dark mode support (CSS variables ready)
2. Mobile-responsive navigation
3. Real-time collaboration indicators
4. Advanced filtering in DataTable
5. Drag-and-drop for lead prioritization

### API Integration
- RESTful endpoints for CRUD operations
- WebSocket for real-time updates
- GraphQL for complex queries (future)

## Testing Strategy

### Component Testing
- Test progressive disclosure states
- Verify keyboard navigation
- Check density mode transitions

### E2E Testing
- User flows: Login → Dashboard → Lead Management
- Verify data persistence (localStorage)
- Test real-time updates

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### Build Optimization
- Enable SWC minification
- Optimize bundle size with tree shaking
- Use CDN for static assets

## Troubleshooting

### Common Issues
1. **Glass effects not working**: Check browser support for `backdrop-filter`
2. **localStorage errors**: Ensure browser allows localStorage
3. **Firebase auth issues**: Verify environment variables

### Debug Mode
Add `?debug=true` to URL for verbose logging

## Code Style

### Component Structure
```javascript
// 1. Imports
// 2. Component definition
// 3. State and effects
// 4. Event handlers
// 5. Render logic
// 6. Exports
```

### Naming Conventions
- Components: PascalCase
- Utilities: camelCase
- CSS classes: kebab-case
- Design tokens: --token-name

## Resources

### Design References
- Apple Human Interface Guidelines
- Allstate Brand Guidelines
- Material Design (for patterns)

### Dependencies
- Next.js 13+
- React 18+
- Firebase 10+
- Tailwind CSS 3+
- Framer Motion (animations)

---

*Last Updated: Current Session*
*Branch: feat/ui-liquid-glass*