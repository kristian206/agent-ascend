# API Documentation

This document provides comprehensive documentation for all APIs, Firebase functions, and backend services in the Agency Max Plus platform.

## Table of Contents

- [Overview](#overview)
- [Firebase Cloud Functions](#firebase-cloud-functions)
- [Firestore Collections](#firestore-collections)
- [Security Rules](#security-rules)
- [Database Indexes](#database-indexes)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Client SDK Usage](#client-sdk-usage)

## Overview

Agency Max Plus uses Firebase as its primary backend service, providing:

- **Authentication** - User login, registration, and session management
- **Firestore Database** - NoSQL document database for all application data
- **Cloud Storage** - File storage for avatars, images, and documents
- **Cloud Functions** - Serverless functions for complex business logic
- **Security Rules** - Fine-grained access control for data protection

### Architecture

```
Client Application
       ↓
Firebase SDK (Client)
       ↓
Firebase Services
├── Authentication
├── Firestore Database
├── Cloud Storage
└── Cloud Functions
       ↓
Firebase Admin SDK (Server)
```

## Firebase Cloud Functions

Cloud Functions provide server-side logic and admin operations. All functions are deployed to the Firebase project and can be called from the client application.

**Deployment:** `firebase deploy --only functions`

### Authentication & Role Management

#### setUserRole

Sets custom user roles with proper authorization checks.

**Endpoint:** `https://us-central1-{project-id}.cloudfunctions.net/setUserRole`
**Type:** Callable Function
**Authentication:** Required (Admin only)

**Parameters:**
```typescript
{
  uid: string,     // Target user ID
  role: 'member' | 'leader' | 'god'  // Role to assign
}
```

**Response:**
```typescript
{
  success: boolean,
  message: string
}
```

**Authorization:**
- Only users with `god` role can set roles
- Updates both Firebase Auth custom claims and Firestore user document

**Example Usage:**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()
const setUserRole = httpsCallable(functions, 'setUserRole')

try {
  const result = await setUserRole({
    uid: 'user123',
    role: 'leader'
  })
  console.log(result.data.message)
} catch (error) {
  console.error('Error setting role:', error)
}
```

#### processNewUser

Automatically processes new user registrations with role assignment and initial data setup.

**Type:** Auth Trigger
**Triggers:** On user creation
**Authentication:** Internal (Cloud Function)

**Automatic Actions:**
- Assigns appropriate role (`god` for admin email, `member` for others)
- Generates unique 6-digit user ID
- Creates user documents in both `users` and `members` collections
- Initializes user stats (XP, level, points, streaks)

**User Data Structure:**
```typescript
{
  userId: string,        // 6-digit unique ID
  email: string,
  name: string,
  role: 'member' | 'leader' | 'god',
  xp: 0,
  level: 1,
  streak: 0,
  lifetimePoints: 0,
  monthPoints: 0,
  weekPoints: 0,
  achievements: [],
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

#### verifyUserRole

Retrieves and verifies current user role information.

**Type:** Callable Function
**Authentication:** Required

**Response:**
```typescript
{
  uid: string,
  email: string,
  role: 'member' | 'leader' | 'god',
  isGod: boolean,
  isLeader: boolean,
  isMember: boolean
}
```

**Example Usage:**
```javascript
const verifyUserRole = httpsCallable(functions, 'verifyUserRole')
const roleInfo = await verifyUserRole()
console.log('User role:', roleInfo.data.role)
```

### Rate Limiting Functions

#### checkRateLimit

Implements rate limiting for authentication attempts and sensitive operations.

**Type:** Callable Function
**Parameters:**
```typescript
{
  email: string,
  action: string
}
```

**Rate Limits:**
- **Window:** 15 minutes
- **Max Attempts:** 5 per window
- **Scope:** Per email address

**Response:**
```typescript
{
  allowed: boolean,
  remaining: number,
  timeUntilReset?: number  // Minutes until reset (if blocked)
}
```

#### clearRateLimit

Clears rate limiting records on successful authentication.

**Type:** Callable Function
**Authentication:** Required

#### cleanupRateLimits

Automated cleanup of expired rate limit records.

**Type:** Scheduled Function
**Schedule:** Every 1 hour

## Firestore Collections

The database is organized into logical collections with specific access patterns and security rules.

### User Management Collections

#### members

**Primary user accounts collection.** Despite the name "members," this collection stores ALL user data for the platform.

**Document ID:** User's Firebase Auth UID
**Purpose:** Complete user profiles and statistics

**Schema:**
```typescript
{
  // Identity
  userId: string,           // 6-digit unique ID
  email: string,
  name: string,
  displayName?: string,
  avatar?: string,
  avatarData?: string,      // DiceBear avatar configuration
  
  // Authorization
  role: 'member' | 'leader' | 'god',
  teamId?: string,
  
  // Gamification
  xp: number,
  level: number,
  streak: number,
  lifetimePoints: number,
  monthPoints: number,
  weekPoints: number,
  seasonPoints: number,
  
  // Achievements
  achievements: string[],
  badges: string[],
  
  // Preferences
  theme?: 'light' | 'dark' | 'system',
  density?: 'comfortable' | 'compact',
  
  // Timestamps
  createdAt: Timestamp,
  lastLogin: Timestamp,
  lastActivity: Timestamp
}
```

**Access Control:**
- Read: Any authenticated user
- Create: Owner only
- Update: Owner or admin
- Delete: Admin only

#### users

**Legacy collection** maintained for backward compatibility. New code should use the `members` collection.

### Team Management Collections

#### teams

**Team organization and leadership structure.**

**Schema:**
```typescript
{
  name: string,
  description?: string,
  leaderId: string,         // User ID of team leader
  coLeaders: string[],      // Array of co-leader user IDs
  members: string[],        // Array of member user IDs
  memberCount: number,
  isActive: boolean,
  
  // Team Statistics
  totalPoints: number,
  monthlyGoal?: number,
  achievements: string[],
  
  // Configuration
  settings: {
    allowSelfJoin: boolean,
    maxMembers: number,
    autoPromote: boolean
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### teamGoals

**Team-level goals and objectives.**

**Schema:**
```typescript
{
  teamId: string,
  title: string,
  description: string,
  type: 'sales' | 'activity' | 'custom',
  target: number,
  current: number,
  unit: string,             // 'policies', 'calls', 'points'
  
  // Timeline
  startDate: Timestamp,
  endDate: Timestamp,
  
  // Status
  status: 'active' | 'completed' | 'paused',
  priority: 'low' | 'medium' | 'high',
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### memberGoals

**Individual goals within team objectives.**

**Schema:**
```typescript
{
  teamGoalId: string,       // Reference to team goal
  memberId: string,         // User ID
  target: number,
  current: number,
  
  // Progress tracking
  progress: number,         // Percentage (0-100)
  lastUpdated: Timestamp,
  
  status: 'active' | 'completed' | 'overdue'
}
```

### Activity & Performance Collections

#### activities

**General activity logging for performance tracking.**

**Schema:**
```typescript
{
  userId: string,
  type: 'call' | 'meeting' | 'email' | 'follow-up' | 'presentation',
  description: string,
  points: number,
  
  // Context
  clientName?: string,
  outcome?: string,
  notes?: string,
  
  timestamp: Timestamp,
  source: 'manual' | 'auto' | 'import'
}
```

**Indexes:** `userId ASC, timestamp DESC`

#### sales

**Sales and policy tracking.**

**Schema:**
```typescript
{
  userId: string,
  teamId?: string,
  
  // Sale Details
  type: 'auto' | 'home' | 'life' | 'commercial',
  premium: number,
  commission?: number,
  
  // Client Information
  clientName: string,
  policyNumber?: string,
  
  // Tracking
  points: number,
  bonusPoints: number,
  
  timestamp: Timestamp,
  month: string,            // YYYY-MM format
  status: 'pending' | 'confirmed' | 'cancelled'
}
```

**Indexes:** 
- `userId ASC, timestamp DESC`
- `teamId ASC, timestamp DESC`

#### dailyIntentions

**Daily goal-setting and intention tracking.**

**Schema:**
```typescript
{
  userId: string,
  date: string,             // YYYY-MM-DD format
  
  // Intentions
  intentions: string[],     // Array of daily goals
  focusArea: string,
  expectedCalls: number,
  expectedMeetings: number,
  
  // Progress
  completedIntentions: number,
  actualCalls: number,
  actualMeetings: number,
  
  // Reflection
  reflection?: string,
  mood: 1 | 2 | 3 | 4 | 5,  // Mood rating
  energy: 1 | 2 | 3 | 4 | 5, // Energy rating
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexes:** `userId ASC, createdAt DESC`

#### nightlyWraps

**End-of-day reflection and summary.**

**Schema:**
```typescript
{
  userId: string,
  date: string,             // YYYY-MM-DD format
  
  // Accomplishments
  wins: string[],
  challenges: string[],
  learnings: string[],
  
  // Metrics
  callsMade: number,
  meetingsHeld: number,
  salesClosed: number,
  pointsEarned: number,
  
  // Tomorrow's prep
  tomorrowFocus: string,
  priorityTasks: string[],
  
  // Ratings
  dayRating: 1 | 2 | 3 | 4 | 5,
  mood: 1 | 2 | 3 | 4 | 5,
  
  createdAt: Timestamp
}
```

**Indexes:** `userId ASC, createdAt DESC`

### Gamification Collections

#### achievements

**Achievement definitions and requirements.**

**Schema:**
```typescript
{
  id: string,
  name: string,
  description: string,
  category: 'sales' | 'activity' | 'streak' | 'team' | 'milestone',
  
  // Requirements
  requirements: {
    type: 'sales_count' | 'points_total' | 'streak_days' | 'team_rank',
    target: number,
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'
  },
  
  // Rewards
  points: number,
  badge?: string,
  tier: 'bronze' | 'silver' | 'gold' | 'platinum',
  
  // Display
  icon: string,
  color: string,
  isSecret: boolean,        // Hidden until unlocked
  
  createdAt: Timestamp
}
```

**Access Control:** Admin only for create/update/delete

#### badges

**Badge definitions and visual assets.**

**Schema:**
```typescript
{
  id: string,
  name: string,
  description: string,
  category: string,
  
  // Visual
  icon: string,
  image?: string,           // URL to badge image
  color: string,
  
  // Rarity
  tier: 'common' | 'rare' | 'epic' | 'legendary',
  earnedCount: number,      // How many users have this badge
  
  createdAt: Timestamp
}
```

### Notification Collections

#### notifications

**In-app notifications and alerts.**

**Schema:**
```typescript
{
  recipientId: string,
  senderId?: string,
  
  // Content
  type: 'achievement' | 'mention' | 'team_update' | 'system',
  title: string,
  message: string,
  data?: Record<string, any>, // Additional payload
  
  // Behavior
  priority: 'low' | 'normal' | 'high',
  actionUrl?: string,
  actionLabel?: string,
  
  // Status
  isRead: boolean,
  readAt?: Timestamp,
  
  createdAt: Timestamp,
  expiresAt?: Timestamp
}
```

**Access Control:**
- Read: Recipient or sender only
- Create: Any authenticated user
- Update: Recipient only (for marking as read)
- Delete: Recipient only

### System Collections

#### config

**System-wide configuration settings.**

**Access Control:** Read: All authenticated users, Write: Admin only

#### settings

**Application settings and feature flags.**

**Access Control:** Read: All authenticated users, Write: Admin only

#### audit

**Audit logging for security and compliance.**

**Schema:**
```typescript
{
  userId: string,
  action: string,
  resource: string,
  details: Record<string, any>,
  ipAddress?: string,
  userAgent?: string,
  
  timestamp: Timestamp
}
```

**Access Control:** 
- Read: Admin only
- Create: Any authenticated user (automatic)
- Update/Delete: Never allowed

## Security Rules

Firebase Security Rules provide fine-grained access control for Firestore collections. Rules are defined in `firestore.rules` and deployed with `firebase deploy --only firestore:rules`.

### Core Security Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Check if user owns the resource
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

// Check if user has admin privileges
function isGod() {
  return isAuthenticated() && 
    request.auth.token.email == 'kristian.suson@gmail.com';
}

// Check team membership
function isTeamMember(teamId) {
  return isAuthenticated() && 
    exists(/databases/$(database)/documents/teams/$(teamId)) &&
    request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
}

// Check team leadership
function isTeamLeader(teamId) {
  return isAuthenticated() && 
    exists(/databases/$(database)/documents/teams/$(teamId)) &&
    request.auth.uid == get(/databases/$(database)/documents/teams/$(teamId)).data.leaderId;
}
```

### Collection Access Patterns

#### User Data Collections
- **members/users**: Read (all), Write (owner/admin)
- **userStats**: Read (all), Write (owner/admin)

#### Team Collections
- **teams**: Read (all), Write (team leader/admin)
- **teamGoals**: Read (all), Write (team leadership/admin)
- **memberGoals**: Read (all), Write (owner/team leadership/admin)

#### Activity Collections
- **activities/sales**: Read (all), Write (owner/admin)
- **dailyIntentions/nightlyWraps**: Read (all), Write (owner/admin)

#### System Collections
- **config/settings**: Read (all), Write (admin only)
- **achievements/badges**: Read (all), Write (admin only)
- **audit**: Read (admin only), Write (system only)

### Rate Limiting Collection

The `rateLimits` collection is protected and only accessible by Cloud Functions:

```javascript
match /rateLimits/{limitId} {
  allow read: if false;
  allow write: if false;
}
```

## Database Indexes

Firestore indexes optimize query performance. Current indexes are defined in `firestore.indexes.json`.

### Performance-Critical Indexes

#### User Activity Queries
```json
{
  "collectionGroup": "activities",
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "timestamp", "order": "DESCENDING"}
  ]
}
```

#### Sales Tracking
```json
{
  "collectionGroup": "sales",
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "timestamp", "order": "DESCENDING"}
  ]
}
```

#### Team Leaderboards
```json
{
  "collectionGroup": "members",
  "fields": [
    {"fieldPath": "teamId", "order": "ASCENDING"},
    {"fieldPath": "seasonPoints", "order": "DESCENDING"}
  ]
}
```

#### Daily Workflows
```json
{
  "collectionGroup": "dailyIntentions",
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

**Deployment:** `firebase deploy --only firestore:indexes`

## Rate Limiting

Rate limiting protects against abuse and ensures fair resource usage.

### Authentication Rate Limits

- **Window:** 15 minutes
- **Attempts:** 5 per email address
- **Scope:** Authentication attempts (login, register, password reset)
- **Storage:** `rateLimits` collection
- **Cleanup:** Automatic hourly cleanup via Cloud Function

### Implementation

```javascript
// Check rate limit before authentication
const rateLimitCheck = await checkRateLimit({
  email: userEmail,
  action: 'login'
})

if (!rateLimitCheck.data.allowed) {
  throw new Error(`Too many attempts. Try again in ${rateLimitCheck.data.timeUntilReset} minutes.`)
}

// Clear rate limit on successful auth
await clearRateLimit()
```

## Error Handling

### Cloud Function Errors

All Cloud Functions use structured error handling with appropriate HTTP status codes:

```typescript
// Standard error response
{
  code: 'unauthenticated' | 'permission-denied' | 'invalid-argument' | 'internal',
  message: string,
  details?: any
}
```

### Common Error Codes

- **`unauthenticated`** - User not logged in
- **`permission-denied`** - Insufficient privileges
- **`invalid-argument`** - Invalid or missing parameters
- **`internal`** - Server-side error
- **`resource-exhausted`** - Rate limit exceeded

### Client Error Handling

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions'

try {
  const result = await httpsCallable(functions, 'functionName')(params)
  // Handle success
} catch (error) {
  switch (error.code) {
    case 'unauthenticated':
      // Redirect to login
      break
    case 'permission-denied':
      // Show access denied message
      break
    case 'invalid-argument':
      // Show validation errors
      break
    default:
      // Show generic error
      console.error('Function error:', error)
  }
}
```

## Client SDK Usage

### Firebase Configuration

Client-side Firebase is configured in `src/services/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuration validation
function validateFirebaseConfig(config) {
  const requiredFields = ['apiKey', 'authDomain', 'projectId']
  const missingFields = requiredFields.filter(field => !config[field])
  
  if (missingFields.length > 0) {
    throw new Error(`Missing Firebase config: ${missingFields.join(', ')}`)
  }
}

// Initialize with environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
}

validateFirebaseConfig(firebaseConfig)
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

### Common Usage Patterns

#### Authentication

```javascript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/src/services/firebase'

// Login
const login = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`)
  }
}

// Register
const register = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // processNewUser Cloud Function automatically creates user profile
    return result.user
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`)
  }
}
```

#### Firestore Queries

```javascript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

// Get user's recent activities
const getUserActivities = async (userId, limitCount = 10) => {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Get team leaderboard
const getTeamLeaderboard = async (teamId) => {
  const q = query(
    collection(db, 'members'),
    where('teamId', '==', teamId),
    orderBy('seasonPoints', 'desc'),
    limit(20)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}
```

#### Real-time Updates

```javascript
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '@/src/services/firebase'

// Listen to user profile changes
const subscribeToUser = (userId, callback) => {
  const userRef = doc(db, 'members', userId)
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data()
      })
    }
  })
}

// Usage in React component
useEffect(() => {
  if (user?.uid) {
    const unsubscribe = subscribeToUser(user.uid, (userData) => {
      setUserProfile(userData)
    })
    
    return () => unsubscribe()
  }
}, [user])
```

### Performance Best Practices

1. **Use Indexes** - Ensure all queries have corresponding indexes
2. **Limit Results** - Always use `.limit()` for large collections
3. **Cache Data** - Implement client-side caching for frequently accessed data
4. **Batch Operations** - Use batch writes for multiple document updates
5. **Optimize Listeners** - Unsubscribe from real-time listeners when components unmount

---

*This API documentation is automatically updated with each deployment. For the latest changes and additions, refer to the Firebase Console and function deployment logs.*