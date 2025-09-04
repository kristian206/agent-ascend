# Component Library Documentation

This document provides comprehensive documentation for all components in the Agency Max Plus platform, organized by category and functionality.

## Table of Contents

- [Overview](#overview)
- [Component Categories](#component-categories)
- [Design System](#design-system)
- [Core Components](#core-components)
- [Layout Components](#layout-components)
- [Dashboard Components](#dashboard-components)
- [Authentication Components](#authentication-components)
- [User Interface Components](#user-interface-components)
- [Gamification Components](#gamification-components)
- [Usage Guidelines](#usage-guidelines)

## Overview

The Agency Max Plus component library is built on React 19.1.1 with a focus on:

- **Liquid Glass Design** - Translucent surfaces with backdrop blur effects
- **Accessibility First** - WCAG AA compliant with keyboard navigation
- **Responsive Design** - Mobile-first approach with desktop optimization
- **Performance** - Optimized rendering with lazy loading and memoization
- **Consistency** - Standardized props interface and design tokens

### Design Principles

- **Single Purpose** - Each component has one primary responsibility
- **Composable** - Components can be combined to create complex UIs
- **Themeable** - Support for light/dark modes and custom theming
- **Density Aware** - Toggle between spacious and condensed layouts

## Component Categories

```
src/components/
├── auth/           # Authentication & session management
├── banner/         # User profile banners and customization
├── common/         # Shared utility components
├── dashboard/      # Dashboard-specific widgets and cards
├── journal/        # Activity logging and history
├── layout/         # Application shell and navigation
├── notifications/  # Alert and notification system
├── onboarding/     # User onboarding workflows
├── performance/    # Performance tracking and analytics
├── sales/          # Sales logging and management
├── season/         # Seasonal campaigns and challenges
├── skeletons/      # Loading state components
├── team/           # Team management and collaboration
└── ui/             # Base UI component library
```

## Design System

### CSS Classes

The platform uses a custom design system with utility classes:

```css
/* Glass Effects */
.glass              /* Translucent glass surface */
.elev-1, .elev-2    /* Elevation shadows */
.radius-lg          /* Rounded corners */

/* Typography */
.type-display       /* Large display text */
.type-heading       /* Section headings */
.type-list-heading  /* List and card titles */
.type-list-body     /* Body text in lists */
.type-detail-caption /* Small detail text */

/* Colors */
.text-primary       /* Primary text color */
.text-ink-400       /* Muted text */
.text-brand-500     /* Brand color */
.text-success       /* Success state */
.text-error         /* Error state */
```

### Size System

Components use a consistent sizing system:

```javascript
const sizes = {
  xs: '24px',    // Extra small
  sm: '32px',    // Small
  md: '40px',    // Medium (default)
  lg: '48px',    // Large
  xl: '64px',    // Extra large
  '2xl': '80px', // 2X large
  '3xl': '96px'  // 3X large
}
```

## Core Components

### UserAvatar

Displays user profile pictures with intelligent fallbacks and status indicators.

**Location:** `src/components/common/UserAvatar.js`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | Object | - | User object containing avatar and profile data |
| `size` | String | `'md'` | Size variant: xs, sm, md, lg, xl, 2xl, 3xl |
| `className` | String | `''` | Additional CSS classes |
| `showStatus` | Boolean | `false` | Show online/offline status indicator |
| `showLevel` | Boolean | `false` | Show user level badge |

#### Features

- **Intelligent Fallbacks** - DiceBear avatars, uploaded images, or initials
- **Error Handling** - Automatically falls back to initials on image load failure
- **Status Indicators** - Online/offline status with color coding
- **Level Badges** - User level display with appropriate sizing
- **Multiple Sources** - Supports URLs, data URLs, and DiceBear integration

#### Usage

```jsx
import UserAvatar from '@/src/components/common/UserAvatar'

// Basic avatar
<UserAvatar user={currentUser} />

// With status and level
<UserAvatar 
  user={currentUser} 
  size="lg" 
  showStatus={true} 
  showLevel={true} 
/>

// Custom styling
<UserAvatar 
  user={currentUser} 
  className="ring-2 ring-blue-500" 
/>
```

### DashboardCard

Flexible card component for displaying metrics, content, and actions.

**Location:** `src/components/dashboard/DashboardCard.js`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | String | - | Card title/heading |
| `metric` | String/Number | - | Primary metric value |
| `metricLabel` | String | - | Label for the metric |
| `trend` | String | - | Trend indicator text |
| `trendDirection` | String | - | Trend direction: 'up', 'down', or neutral |
| `primaryAction` | Object | - | Primary action button config |
| `details` | ReactNode | - | Expandable details content |
| `isCondensed` | Boolean | `false` | Use condensed density mode |
| `className` | String | `''` | Additional CSS classes |
| `children` | ReactNode | - | Custom content |

#### Primary Action Object

```javascript
primaryAction: {
  label: 'Action Text',
  onClick: () => handleAction()
}
```

#### Usage

```jsx
import DashboardCard from '@/src/components/dashboard/DashboardCard'

// Metric card with trend
<DashboardCard 
  title="Sales This Month"
  metric="42"
  metricLabel="Policies sold"
  trend="+12%"
  trendDirection="up"
  primaryAction={{
    label: 'Log Sale',
    onClick: () => openSalesForm()
  }}
/>

// Custom content card
<DashboardCard title="Recent Activity">
  <ActivityList items={recentItems} />
</DashboardCard>
```

### ListCard

Specialized card for displaying lists with pagination and actions.

**Location:** `src/components/dashboard/DashboardCard.js` (export)

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | String | - | List title |
| `items` | Array | - | Array of list items |
| `emptyMessage` | String | - | Message when list is empty |
| `primaryAction` | Object | - | Primary action button |
| `isCondensed` | Boolean | `false` | Condensed layout mode |
| `maxItems` | Number | `5` | Maximum items to show initially |

#### Item Structure

```javascript
{
  id: 'unique-id',
  title: 'Item Title',
  subtitle: 'Optional subtitle',
  icon: '📊', // Optional emoji or icon
  badge: {
    type: 'hot' | 'new' | 'default',
    label: 'Badge Text'
  },
  meta: 'Additional info',
  onClick: () => handleItemClick()
}
```

#### Usage

```jsx
import { ListCard } from '@/src/components/dashboard/DashboardCard'

<ListCard 
  title="Hot Leads"
  items={hotLeads}
  emptyMessage="No hot leads at the moment"
  primaryAction={{
    label: 'View All',
    onClick: () => navigateToLeads()
  }}
  maxItems={3}
/>
```

## Layout Components

### AppShell

Main application layout container with navigation and global UI elements.

**Location:** `src/components/layout/AppShell.js`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Main page content |
| `user` | Object | - | Current user object |

#### Features

- **Responsive Layout** - Adapts to mobile and desktop screens
- **Keyboard Shortcuts** - Global shortcuts for navigation and actions
- **Persistent State** - Remembers sidebar collapse state
- **Command Palette** - Quick access to all application actions
- **Version Support** - Supports both classic (v1) and modern (v2) UI

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘N` / `Ctrl+N` | Create new item |
| `⌘B` / `Ctrl+B` | Toggle sidebar |

#### Usage

```jsx
import AppShell from '@/src/components/layout/AppShell'

export default function RootLayout({ children }) {
  return (
    <AppShell user={currentUser}>
      {children}
    </AppShell>
  )
}
```

### TopBar

Global navigation bar with search, notifications, and user menu.

**Location:** `src/components/layout/TopBar.js`

#### Features

- **Global Search** - Context-aware search functionality
- **Notifications** - Real-time notification center
- **User Menu** - Profile access and settings
- **Theme Toggle** - Switch between light and dark modes
- **Responsive** - Adapts layout for mobile screens

### LeftRail

Primary navigation sidebar with collapsible menu items.

**Location:** `src/components/layout/LeftRail.js`

#### Features

- **Collapsible Design** - Expand/collapse with smooth animations
- **Active States** - Highlights current page/section
- **Icon Support** - Icons for all navigation items
- **Pinned Items** - Frequently accessed items stay visible
- **Mobile Friendly** - Touch-optimized for mobile devices

### CommandPalette

Global command interface for quick actions and navigation.

**Location:** `src/components/layout/CommandPalette.js`

#### Features

- **Fuzzy Search** - Intelligent search across all actions
- **Keyboard Navigation** - Full keyboard support with arrow keys
- **Categories** - Organized action groups (Navigation, Actions, etc.)
- **Recent Actions** - Shows recently used commands first
- **Extensible** - Easy to add new command categories

#### Adding Commands

```javascript
// In CommandPalette.js
const customActions = [
  {
    id: 'custom-action',
    name: 'My Custom Action',
    icon: '🎯',
    shortcut: ['⌘', 'Y'],
    category: 'Actions',
    action: () => {
      // Action logic
    }
  }
]
```

## Dashboard Components

### MetricsDashboard

Comprehensive dashboard showing key performance indicators.

**Location:** `src/components/dashboard/MetricsDashboard.js`

#### Features

- **Real-time Data** - Live updates from Firestore
- **Customizable Layout** - Drag and drop widget arrangement
- **Filtering** - Date range and metric type filters
- **Export** - Data export functionality
- **Responsive** - Grid layout adapts to screen size

### QuickStats

Compact statistics display for key metrics.

**Location:** `src/components/dashboard/QuickStats.js`

### PersonalProgress

Individual progress tracking with goals and achievements.

**Location:** `src/components/dashboard/PersonalProgress.js`

### StreakDisplay

Gamified streak counter with visual progress indicators.

**Location:** `src/components/dashboard/StreakDisplay.js`

## Authentication Components

### AuthProvider

Global authentication context and session management.

**Location:** `src/components/auth/AuthProvider.js`

#### Features

- **Firebase Integration** - Handles Firebase Auth lifecycle
- **Session Persistence** - Maintains login state across sessions
- **Error Handling** - Graceful handling of auth errors
- **Loading States** - Proper loading indicators during auth operations

### EmailVerification

Email verification flow for new user accounts.

**Location:** `src/components/auth/EmailVerification.js`

### PasswordMigration

Legacy password migration for existing users.

**Location:** `src/components/auth/PasswordMigration.js`

### SessionManager

Advanced session management with timeout and renewal.

**Location:** `src/components/auth/SessionManager.js`

## User Interface Components

### ThemeProvider

Application-wide theme management and dark mode support.

**Location:** `src/components/common/ThemeProvider.js`

#### Features

- **System Preference** - Automatically detects system theme
- **Manual Override** - User can manually select light/dark mode
- **Persistent Storage** - Remembers user theme preference
- **CSS Variables** - Updates design tokens dynamically

### ErrorBoundary

React error boundary for graceful error handling.

**Location:** `src/components/common/ErrorBoundary.js`

#### Features

- **Error Logging** - Captures and logs JavaScript errors
- **Fallback UI** - Shows user-friendly error message
- **Recovery Options** - Allows users to retry or report issues
- **Development Mode** - Shows detailed error info in development

### Skeleton

Loading state components for various content types.

**Location:** `src/components/common/Skeleton.js`

#### Variants

- **TextSkeleton** - For text content
- **CardSkeleton** - For card layouts
- **AvatarSkeleton** - For user avatars
- **ListSkeleton** - For list items

### HelpSystem

Contextual help and documentation system.

**Location:** `src/components/common/HelpSystem.js`

#### Features

- **Context-Aware** - Shows relevant help for current page
- **Search** - Full-text search across help content
- **Interactive Tours** - Guided onboarding flows
- **Feedback** - Users can rate help article usefulness

## Gamification Components

### BadgeDisplay

Achievement badge showcase with animations and descriptions.

**Location:** `src/components/banner/BadgeDisplay.js`

### CheerButton

Peer recognition system for celebrating team achievements.

**Location:** `src/components/banner/CheerButton.js`

### MicroCelebration

Instant feedback animations for user actions.

**Location:** `src/components/common/MicroCelebration.js`

#### Features

- **Confetti Effects** - Celebration animations
- **Achievement Unlocks** - Badge and level-up notifications
- **Point Animations** - Visual feedback for point gains
- **Sound Effects** - Optional audio feedback (user configurable)

## Usage Guidelines

### Best Practices

1. **Prop Validation** - Always validate props with PropTypes or TypeScript
2. **Accessibility** - Include proper ARIA labels and keyboard navigation
3. **Performance** - Use React.memo() for components that re-render frequently
4. **Error Handling** - Wrap components in ErrorBoundary when appropriate
5. **Testing** - Write unit tests for complex component logic

### Naming Conventions

- **Components** - PascalCase (e.g., `UserAvatar`, `DashboardCard`)
- **Props** - camelCase (e.g., `showStatus`, `isCondensed`)
- **Files** - PascalCase matching component name
- **CSS Classes** - kebab-case (e.g., `glass-card`, `elev-2`)

### File Organization

```
ComponentName/
├── index.js          # Main component export
├── ComponentName.js  # Component implementation
├── ComponentName.test.js  # Unit tests
├── ComponentName.stories.js  # Storybook stories
└── styles.module.css # Component-specific styles
```

### Import/Export Patterns

```javascript
// Named exports for utilities
export { parseAvatarData, generateInitials }

// Default export for main component
export default UserAvatar

// Re-exports from index files
export { default as UserAvatar } from './UserAvatar'
export { default as DashboardCard } from './DashboardCard'
```

### Performance Optimization

- Use `React.memo()` for pure components
- Implement `useMemo()` and `useCallback()` for expensive operations
- Lazy load components with `React.lazy()` when appropriate
- Optimize images with Next.js Image component

### Accessibility Standards

- Include `alt` text for all images
- Use semantic HTML elements
- Provide keyboard navigation support
- Maintain proper focus management
- Follow WCAG AA contrast guidelines
- Include screen reader friendly labels

---

*This documentation is automatically updated with each release. For the latest component examples and API changes, refer to the design system page at `/design-system` in the application.*