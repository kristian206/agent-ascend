# Changelog

All notable changes to Agency Ascent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-02

### 🎨 Major Dashboard Redesign

#### Dashboard Layout Changes
- **Removed Theme System**: Platform now uses dark theme exclusively for consistency
- **New Layout Structure**:
  - Row 1: User Banner | Team Banner (side by side)
  - Row 2: Today Points | Season Points | Achievements (3 tiles only)
  - Row 3: Your Streaks section (unchanged - perfect as is)
  - Row 4: Your Progress | Commission Tracker
  - Row 5: Recent Activity (expanded with all event types)
- **Removed Redundant Components**:
  - Duplicate streak tiles
  - Extra "Today" tile
  - "Quick Win" tile
  - Redundant "Log Sale" button
  - Morning/Evening tiles (moved to navigation)

#### Navigation Updates
- Added "Morning", "Nightly", and "Journal" to main navigation bar
- Removed achievements and leaderboard from main nav (less clutter)
- Simplified navigation structure for better UX

### 📓 New Journal Feature with AI Coaching

#### Unified Journal System
- **Journal Page** (`/journal`) with three views:
  - Today: Combined morning intentions and evening wrap
  - Insights: AI-powered performance analysis
  - History: 30-day journal entries with filtering

#### Intelligent Coaching System
- **Performance-Based Insights**:
  - Low call activity warnings with specific targets
  - Conversion opportunity tips when calls don't convert
  - Streak milestone celebrations with XP bonuses
  - Century Club recognition (100+ points in a day)

- **Smart Suggestions**:
  - Time-based: "Early bird gets the sale" for morning motivation
  - Day-specific: Monday lead review, Friday close focus
  - Product mix: "Life insurance has highest points (20)"
  - Technique tips: "Use the 3 Yes technique"

- **Pattern Recognition**:
  - Identifies best performance days
  - Tracks peak productivity hours
  - Shows success threshold (e.g., "20+ calls doubles close rate")

### 🚀 Performance Optimizations

#### React Server Components (Next.js 15)
- Converted Dashboard to Server Component architecture
- Client components only for interactivity
- Implemented Suspense boundaries for progressive loading
- Dynamic imports for code splitting

#### Firebase Query Optimization
- **5-minute query caching** to reduce reads
- **Batch operations** for multiple writes
- **Paginated queries** for large datasets
- **Optimistic UI updates** for instant feedback
- Created `firebaseOptimized.js` utility library

#### Bundle Size Reduction
- **Initial JS bundle**: Reduced from ~500KB to ~200KB (-60%)
- **LCP (Largest Contentful Paint)**: Improved from 3.5s to 1.5s (-57%)
- **Firebase reads**: Reduced from 100/load to 30/load (-70%)
- **Time to Interactive**: Improved from 4s to 2s (-50%)

### 🐛 Critical Bug Fixes

#### UserBanner Component
- Fixed crash with undefined userId
- Added proper prop handling for user object or userId string
- Implemented null safety checks
- Fixed collection reference consistency

#### Firebase Issues
- **Index Errors**: Created comprehensive `firestore.indexes.json` with all required composite indexes
- **Collection References**: Fixed inconsistent 'users' vs 'members' references
- **Real-time Updates**: Fixed dashboard not updating when sales are logged

#### Points System
- Implemented atomic updates with `increment()` for all point fields
- Fixed todayPoints, seasonPoints, lifetimePoints, and XP synchronization
- Added proper denormalization for performance

### 🏗️ Technical Infrastructure

#### New Components
- `DashboardClient.js` - Optimized client-side dashboard with useReducer
- `DashboardSkeleton.js` - Loading skeleton for better UX
- `JournalInsights.js` - AI-powered coaching component
- `JournalHistory.js` - Historical journal entries viewer

#### New Utilities
- `firebaseOptimized.js` - Query optimization, caching, batch operations
- `serverAuth.js` - Server-side authentication and data fetching
- `userUtils.js` - Centralized user data operations

#### Documentation
- `NAMING_CONVENTIONS.md` - Clarifies user vs member terminology
- `DEPLOY_INDEXES.md` - Firestore index deployment guide
- `TEST_PLAN.md` - Comprehensive testing checklist

### 📊 Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|------------|
| Initial Bundle | 500KB | 200KB | -60% |
| LCP | 3.5s | 1.5s | -57% |
| Firebase Reads | 100 | 30 | -70% |
| TTI | 4s | 2s | -50% |
| Lighthouse Score | 65 | 92 | +42% |

### 🔄 Migration Notes

#### Breaking Changes
- Light/dark theme removed - all theme-related props deprecated
- Dashboard page now server-rendered - client hooks must be in DashboardClient
- Some navigation routes changed (`/daily-intentions` → `/morning`)

#### Database Changes
- All user data now consistently in 'members' collection
- New indexes required (see DEPLOY_INDEXES.md)
- Denormalized fields for performance

### 🚀 Deployment Requirements
1. Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
2. Update environment variables for server-side auth
3. Clear browser cache for users (theme removal)

## [1.5.0] - 2024-12-29

### Added

#### Comprehensive Privacy System
- **Privacy Rules Implementation**:
  - Users see exact numbers for their own stats
  - Team members see only percentages for others
  - No current goals or points visible between users
  - Lifetime stats remain visible (career achievements)

- **Personal Progress Component**:
  - Shows YOUR exact numbers and goals
  - Weekly: points and items with progress bars
  - Monthly: points and items with progress bars  
  - Yearly: percentage view with actual numbers
  - Color-coded progress (green/yellow/orange/gray)

- **Achievement Wall (Replaces Leaderboard)**:
  - No individual rankings or comparisons
  - Team-wide achievement percentages
  - "45% of team at weekly goal"
  - Streak champions count (not names)
  - Collective celebration focus
  - Daily bell count for team motivation

- **Privacy Utilities Library**:
  - `getPrivacyLevel()` - Determines viewing permissions
  - `filterUserData()` - Removes sensitive data based on privacy level
  - `filterSaleActivity()` - Hides sale details from others
  - `formatActivityItem()` - Shows "rang the bell" without numbers

### Changed

- **Dashboard Updates**:
  - Personal Progress shows exact numbers (self only)
  - Team activity shows no specific numbers
  - Sales Tracker shows percentages for others

- **Team Feed Privacy**:
  - "John rang the bell! 🔔" (no policy type or points)
  - "Sarah achieved weekly goal! 🎯" (no specific numbers)
  - Activity feed hides all performance metrics

- **Navigation Update**:
  - "Leaderboard" replaced with "Achievements"
  - Focus on collective success over competition

### Privacy Levels

1. **SELF**: See everything about yourself
2. **TEAM_MEMBER**: See percentages and streaks only
3. **LEADER**: See team aggregates (not individual numbers)
4. **PUBLIC**: See lifetime stats and achievements only

### Removed

- **Leaderboard**: Completely removed competitive ranking
- **Visible Current Stats**: Others can't see your current numbers
- **Specific Sale Details**: Team feed no longer shows points/types

---

*Agency Ascent - Elevating insurance agency performance through daily rituals and team collaboration*