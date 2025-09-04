# System Architecture

This document provides a comprehensive technical architecture overview of the Agency Max Plus platform, including system design, data flow, performance optimizations, and scalability considerations.

## Table of Contents

- [Overview](#overview)
- [High-Level Architecture](#high-level-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Architecture](#data-architecture)
- [Authentication & Authorization](#authentication--authorization)
- [Performance & Scalability](#performance--scalability)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Monitoring & Observability](#monitoring--observability)

## Overview

Agency Max Plus is a modern, cloud-native performance gamification platform built with a serverless-first architecture. The system leverages Firebase's Backend-as-a-Service (BaaS) capabilities combined with Next.js for a highly scalable, performant, and maintainable solution.

### Key Architectural Principles

- **Serverless First** - Minimize infrastructure management overhead
- **Progressive Enhancement** - Works without JavaScript, enhanced with it
- **API-First Design** - Clear separation between frontend and backend
- **Real-time by Default** - Live updates across all user interfaces
- **Mobile-First Responsive** - Optimized for all device types
- **Security by Design** - Zero-trust security model with fine-grained permissions

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Web App   │  │ Mobile PWA  │  │Admin Portal │         │
│  │  (Next.js)  │  │ (Capacitor) │  │ (Next.js)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     API GATEWAY LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌─────────────────────────────────┐            │
│              │        Firebase SDK             │            │
│              │   (Client & Admin SDKs)         │            │
│              └─────────────────────────────────┘            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │  Firestore  │  │   Storage   │         │
│  │   Service   │  │  Database   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Cloud     │  │   Hosting   │  │ Analytics   │         │
│  │  Functions  │  │   Service   │  │  Service    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌─────────────────────────────────┐            │
│              │      Google Cloud Platform       │            │
│              │     (Firebase Services)          │            │
│              └─────────────────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15.5.2, React 19.1.1 | Server-side rendering, client app |
| Styling | Tailwind CSS 3.4.17 | Utility-first styling system |
| Database | Firestore | NoSQL document database |
| Authentication | Firebase Auth | User management & security |
| Backend Logic | Cloud Functions | Serverless business logic |
| File Storage | Cloud Storage | Asset and file management |
| Hosting | Vercel / Firebase Hosting | CDN and static site hosting |
| Monitoring | Firebase Analytics | User analytics and crash reporting |

## Frontend Architecture

The frontend is built using Next.js 15 with the App Router, providing server-side rendering, static generation, and client-side hydration for optimal performance.

### Application Structure

```
app/
├── (auth)/                 # Auth-required routes
│   ├── dashboard/         # Main dashboard
│   ├── profile/          # User profile management
│   ├── team/            # Team management
│   └── admin/           # Admin panel
├── (public)/            # Public routes
│   ├── login/          # Authentication pages
│   └── register/       # User registration
├── api/                # API routes (if needed)
├── globals.css         # Global styles
├── layout.js          # Root layout
└── page.js           # Landing page

src/
├── components/        # Reusable UI components
│   ├── auth/         # Authentication components
│   ├── dashboard/    # Dashboard-specific widgets
│   ├── layout/       # Layout and navigation
│   └── ui/          # Base UI component library
├── lib/             # Utilities and configurations
│   ├── firebase.js  # Firebase client configuration
│   ├── hooks/       # Custom React hooks
│   └── utils/       # Helper functions
└── styles/          # CSS and design system files
```

### Component Architecture

Agency Max Plus follows a component-driven development approach with clear separation of concerns:

#### Component Hierarchy

```
AppShell (Layout)
├── TopBar (Global Navigation)
│   ├── GlobalSearch
│   ├── NotificationCenter
│   └── UserMenu
├── LeftRail (Primary Navigation)
│   ├── NavigationItems
│   └── TeamSelector
├── MainContent (Page Content)
│   ├── PageHeader
│   ├── DashboardCards
│   │   ├── MetricCard
│   │   ├── ActivityCard
│   │   └── LeaderboardCard
│   └── CommandPalette
└── FloatingActionButton
```

#### Design System Components

- **Base Components** - Buttons, inputs, modals, tooltips
- **Layout Components** - Grids, containers, spacers
- **Data Display** - Tables, cards, lists, charts
- **Feedback Components** - Alerts, notifications, loading states
- **Navigation Components** - Menus, breadcrumbs, pagination

### State Management

The application uses a hybrid state management approach:

#### Local State (React State)
- Component-specific UI state
- Form state and validation
- Temporary user interactions

#### Global State (Context API)
- User authentication state
- Theme preferences
- Application-wide settings

#### Server State (Firebase Real-time)
- User profiles and teams
- Real-time activity feeds
- Leaderboards and statistics

```javascript
// Example: User context for global authentication state
const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])
  
  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}
```

### Performance Optimizations

#### Code Splitting
- **Route-based splitting** - Automatic with Next.js App Router
- **Component-based splitting** - `React.lazy()` for heavy components
- **Dynamic imports** - Load libraries only when needed

#### Caching Strategy
- **Static Generation** - Pre-render pages at build time
- **Incremental Static Regeneration** - Update static content periodically
- **Client-side caching** - Cache API responses and user data
- **CDN caching** - Global content distribution

#### Bundle Optimization
- **Tree shaking** - Remove unused code
- **Module federation** - Share code across applications
- **Image optimization** - Next.js automatic image optimization
- **Font optimization** - Next.js font loading optimization

## Backend Architecture

The backend leverages Firebase's serverless services for maximum scalability and minimal operational overhead.

### Firebase Services Integration

#### Authentication Service
- **Email/Password Authentication** - Primary login method
- **Social Authentication** - Google, Facebook, Apple (future)
- **Custom Claims** - Role-based access control
- **Session Management** - Automatic token refresh
- **Rate Limiting** - Protection against abuse

#### Firestore Database
- **Document-based NoSQL** - Flexible data modeling
- **Real-time Synchronization** - Live updates across clients
- **Offline Support** - Local caching and sync
- **Atomic Transactions** - Data consistency guarantees
- **Security Rules** - Fine-grained access control

#### Cloud Functions
- **HTTP Triggers** - REST API endpoints
- **Auth Triggers** - User lifecycle events
- **Database Triggers** - Data change reactions
- **Scheduled Functions** - Cron-like tasks
- **Background Processing** - Async operations

#### Cloud Storage
- **File Upload/Download** - User-generated content
- **Image Processing** - Automatic optimization
- **Access Control** - Secure file sharing
- **CDN Distribution** - Global file delivery

### Data Flow Architecture

#### Authentication Flow
```
1. User Login Request
   ↓
2. Firebase Auth Validation
   ↓
3. Custom Claims Assignment (Cloud Function)
   ↓
4. User Profile Fetch (Firestore)
   ↓
5. Client State Hydration
   ↓
6. Real-time Listeners Established
```

#### Activity Logging Flow
```
1. User Action (Sales, Call, Meeting)
   ↓
2. Client Validation
   ↓
3. Firestore Write (activities collection)
   ↓
4. Cloud Function Trigger
   ↓
5. Points Calculation & User Stats Update
   ↓
6. Achievement Check & Badge Assignment
   ↓
7. Real-time UI Updates
   ↓
8. Notification Dispatch (if applicable)
```

#### Team Collaboration Flow
```
1. Team Member Action
   ↓
2. Firestore Write with Security Rules Check
   ↓
3. Real-time Listener Updates
   ↓
4. Team Statistics Recalculation
   ↓
5. Leaderboard Updates
   ↓
6. Team Activity Feed Update
   ↓
7. Push Notifications (Mobile)
```

## Data Architecture

The data architecture is designed for scalability, consistency, and real-time performance.

### Database Design Principles

- **Denormalization** - Optimize for read performance
- **Compound Queries** - Efficient multi-field filtering
- **Hierarchical Security** - Role-based data access
- **Atomic Operations** - Maintain data consistency
- **Eventual Consistency** - Accept temporary inconsistencies for performance

### Core Data Models

#### User Data Model
```typescript
interface User {
  // Identity
  uid: string
  userId: string        // 6-digit public ID
  email: string
  name: string
  avatar?: string
  
  // Authorization
  role: 'member' | 'leader' | 'god'
  teamId?: string
  
  // Gamification
  xp: number
  level: number
  streak: number
  lifetimePoints: number
  monthPoints: number
  weekPoints: number
  
  // Timestamps
  createdAt: Timestamp
  lastLogin: Timestamp
  lastActivity: Timestamp
}
```

#### Activity Data Model
```typescript
interface Activity {
  id: string
  userId: string
  teamId?: string
  
  // Activity Details
  type: 'call' | 'meeting' | 'sale' | 'follow-up'
  description: string
  outcome?: string
  
  // Gamification
  points: number
  bonusPoints: number
  
  // Context
  clientName?: string
  metadata: Record<string, any>
  
  timestamp: Timestamp
}
```

#### Team Data Model
```typescript
interface Team {
  id: string
  name: string
  leaderId: string
  coLeaders: string[]
  members: string[]
  
  // Statistics
  totalPoints: number
  memberCount: number
  avgPerformance: number
  
  // Configuration
  settings: TeamSettings
  
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Database Collections Strategy

#### Primary Collections
- **members** - User profiles and statistics
- **teams** - Team organization and settings
- **activities** - User actions and performance data
- **sales** - Sales transactions and commissions
- **achievements** - Achievement definitions and progress

#### Aggregation Collections
- **monthlyTotals** - Pre-calculated monthly statistics
- **teamStats** - Team performance aggregations
- **leaderboards** - Cached ranking data
- **userStats** - User performance summaries

#### System Collections
- **config** - Application configuration
- **settings** - Feature flags and preferences
- **notifications** - In-app notifications
- **audit** - Security and compliance logs

### Indexing Strategy

Critical indexes for query performance:

```json
// User activity queries
{
  "collectionGroup": "activities",
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "timestamp", "order": "DESCENDING"}
  ]
}

// Team leaderboard queries
{
  "collectionGroup": "members",
  "fields": [
    {"fieldPath": "teamId", "order": "ASCENDING"},
    {"fieldPath": "seasonPoints", "order": "DESCENDING"}
  ]
}

// Sales tracking queries
{
  "collectionGroup": "sales",
  "fields": [
    {"fieldPath": "teamId", "order": "ASCENDING"},
    {"fieldPath": "timestamp", "order": "DESCENDING"}
  ]
}
```

## Authentication & Authorization

### Multi-Layer Security Architecture

```
┌─────────────────────────────────────┐
│           Client Layer              │
│  - JWT Token Validation            │
│  - Role-based UI Rendering         │
│  - Client-side Route Protection     │
└─────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────┐
│          API Gateway Layer          │
│  - Firebase Auth Token Validation  │
│  - Custom Claims Verification      │
│  - Rate Limiting & Throttling       │
└─────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────┐
│         Data Access Layer           │
│  - Firestore Security Rules        │
│  - Field-level Permissions         │
│  - Document-level Access Control   │
└─────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

#### Role Hierarchy
```
god (Admin)
├── Full system access
├── User management
├── System configuration
└── Audit log access

leader (Team Leader)
├── Team member management
├── Team goal setting
├── Performance reporting
└── Member data access

member (Standard User)
├── Personal data management
├── Activity logging
├── Team collaboration
└── Profile customization
```

#### Permission Matrix

| Resource | Member | Leader | God |
|----------|--------|--------|-----|
| Own Profile | Read/Write | Read/Write | Read/Write |
| Team Profiles | Read | Read/Write | Read/Write |
| Team Goals | Read | Read/Write | Read/Write |
| System Config | - | - | Read/Write |
| User Roles | - | - | Read/Write |
| Audit Logs | - | - | Read |

### Security Implementation

#### Custom Claims
```javascript
// Set custom claims on user creation
await admin.auth().setCustomUserClaims(uid, {
  role: 'member',
  teamId: 'team_123',
  permissions: ['read_team', 'write_own']
})
```

#### Security Rules Example
```javascript
// Allow users to read their team members' profiles
match /members/{userId} {
  allow read: if isAuthenticated() && 
    (isOwner(userId) || 
     areTeammates(request.auth.uid, userId) ||
     isGod())
}
```

## Performance & Scalability

### Performance Optimization Strategy

#### Frontend Performance
- **Server-Side Rendering** - Faster initial page loads
- **Code Splitting** - Reduce initial bundle size
- **Image Optimization** - Automatic WebP conversion and sizing
- **Caching Strategy** - Aggressive caching with smart invalidation
- **Bundle Analysis** - Monitor and optimize bundle size

#### Database Performance
- **Query Optimization** - Proper indexing for all queries
- **Data Denormalization** - Trade storage for query speed
- **Connection Pooling** - Reuse database connections
- **Read Replicas** - Distribute read load (future enhancement)
- **Caching Layer** - In-memory caching for hot data

#### Network Performance
- **CDN Distribution** - Global content delivery
- **HTTP/2 Push** - Preload critical resources
- **Compression** - Gzip/Brotli compression
- **Keep-Alive Connections** - Reduce connection overhead
- **Resource Bundling** - Minimize HTTP requests

### Scalability Architecture

#### Horizontal Scaling
- **Stateless Functions** - Cloud Functions auto-scale
- **Database Sharding** - Partition data across regions (future)
- **Load Balancing** - Distribute traffic evenly
- **CDN Scaling** - Handle static content at edge

#### Vertical Scaling
- **Performance Monitoring** - Identify bottlenecks early
- **Resource Optimization** - Efficient memory and CPU usage
- **Database Optimization** - Query performance tuning
- **Caching Layers** - Reduce database load

### Monitoring & Alerting

#### Performance Metrics
- **Core Web Vitals** - LCP, FID, CLS tracking
- **Database Performance** - Query latency and throughput
- **Function Performance** - Execution time and error rates
- **User Experience** - Page load times and interaction delays

#### Alert Configuration
- **Error Rate Thresholds** - >5% error rate triggers alert
- **Performance Degradation** - >2s page load time alert
- **Database Limits** - Approaching quotas or limits
- **Security Events** - Suspicious authentication patterns

## Security Architecture

### Security-First Design Principles

#### Zero Trust Architecture
- **Verify Everything** - No implicit trust within the system
- **Least Privilege** - Minimum necessary permissions
- **Defense in Depth** - Multiple security layers
- **Continuous Monitoring** - Real-time threat detection

#### Data Protection
```
┌─────────────────────────────────────┐
│        Data Classification          │
├─────────────────────────────────────┤
│  Public    │ Marketing materials    │
│  Internal  │ Team performance data  │
│  Sensitive │ Personal information   │
│  Restricted│ Payment information    │
└─────────────────────────────────────┘
```

### Security Controls

#### Authentication Security
- **Password Complexity** - Enforced strong passwords
- **Account Lockout** - Protection against brute force
- **Session Management** - Automatic token rotation
- **Multi-Factor Authentication** - Future enhancement
- **OAuth Integration** - Secure third-party login

#### Data Security
- **Encryption at Rest** - All data encrypted in database
- **Encryption in Transit** - TLS 1.3 for all connections
- **Key Management** - Firebase handles key rotation
- **Data Anonymization** - PII protection in analytics
- **Backup Encryption** - Encrypted database backups

#### Application Security
- **Input Validation** - Server-side validation for all inputs
- **XSS Protection** - Content Security Policy headers
- **CSRF Protection** - Token-based request validation
- **SQL Injection Prevention** - Parameterized queries (NoSQL)
- **Rate Limiting** - Protection against abuse

### Compliance & Privacy

#### Data Privacy
- **GDPR Compliance** - EU data protection rights
- **CCPA Compliance** - California privacy regulations
- **Data Minimization** - Collect only necessary data
- **Right to Deletion** - User data removal capabilities
- **Data Portability** - Export user data functionality

#### Audit & Compliance
- **Access Logging** - All data access logged
- **Change Tracking** - Audit trail for all modifications
- **Compliance Reporting** - Automated compliance reports
- **Security Assessments** - Regular security reviews
- **Incident Response** - Security incident procedures

## Deployment Architecture

### Multi-Environment Strategy

```
┌─────────────────────────────────────┐
│          Production                 │
│  - Firebase Production Project      │
│  - Vercel Production Deployment     │
│  - Custom Domain with SSL          │
│  - Full monitoring & alerting      │
└─────────────────────────────────────┘
                   ↑
┌─────────────────────────────────────┐
│          Staging                    │
│  - Firebase Staging Project        │
│  - Vercel Preview Deployment       │
│  - Integration testing              │
│  - Performance testing             │
└─────────────────────────────────────┘
                   ↑
┌─────────────────────────────────────┐
│        Development                  │
│  - Firebase Development Project     │
│  - Local development server         │
│  - Feature development              │
│  - Unit testing                    │
└─────────────────────────────────────┘
```

### CI/CD Pipeline

#### Deployment Workflow
```yaml
# GitHub Actions Workflow
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
      - name: Install dependencies
      - name: Run tests
      - name: Run linting
      - name: Build application

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
      - name: Deploy Firebase Functions
      - name: Update Firestore Rules
      - name: Deploy Firestore Indexes
      - name: Run smoke tests
      - name: Notify team
```

### Infrastructure as Code

#### Firebase Configuration
```json
{
  "projects": {
    "default": "agency-max-plus-prod",
    "staging": "agency-max-plus-staging",
    "development": "agency-max-plus-dev"
  },
  "targets": {
    "agency-max-plus-prod": {
      "hosting": {
        "frontend": ["agency-max-plus-prod"]
      }
    }
  }
}
```

### Disaster Recovery

#### Backup Strategy
- **Database Backups** - Daily automated backups
- **Code Repository** - Git-based version control
- **Configuration Backup** - Infrastructure as code
- **Asset Backups** - Cloud Storage with versioning

#### Recovery Procedures
- **RTO (Recovery Time Objective)** - 4 hours maximum downtime
- **RPO (Recovery Point Objective)** - 1 hour maximum data loss
- **Failover Procedure** - Documented recovery steps
- **Testing Schedule** - Quarterly disaster recovery tests

## Monitoring & Observability

### Monitoring Stack

#### Application Performance Monitoring (APM)
- **Firebase Performance** - Web vitals and user experience
- **Vercel Analytics** - Core web vitals and page performance
- **Google Analytics** - User behavior and conversion tracking
- **Error Tracking** - Firebase Crashlytics for error monitoring

#### System Monitoring
- **Firebase Console** - Service health and quotas
- **Cloud Functions Metrics** - Execution time and error rates
- **Database Metrics** - Read/write operations and latency
- **Storage Metrics** - File upload/download performance

#### Business Metrics
- **User Engagement** - Daily/monthly active users
- **Feature Usage** - Component and page analytics
- **Performance Metrics** - Sales tracking and goal completion
- **Team Collaboration** - Team activity and interaction rates

### Alerting Strategy

#### Critical Alerts (Immediate Response)
- Application down or unreachable
- Database connection failures
- Authentication system failures
- Security breach detection

#### Warning Alerts (24-hour Response)
- Performance degradation
- Error rate increases
- Quota limit approaches
- Unusual user behavior patterns

#### Informational Alerts (Weekly Review)
- Usage trend reports
- Performance optimization opportunities
- Feature adoption statistics
- User feedback summaries

---

*This architecture documentation is maintained as a living document and updated with each major system change or enhancement.*