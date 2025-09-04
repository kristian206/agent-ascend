# Developer Guide

Welcome to Agency Max Plus! This comprehensive guide will help you get up to speed quickly as a new developer on the team. Whether you're contributing to the codebase, fixing bugs, or adding new features, this guide covers everything you need to know.

## Table of Contents

- [Quick Start Checklist](#quick-start-checklist)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure & Conventions](#project-structure--conventions)
- [Development Workflow](#development-workflow)
- [Coding Standards & Best Practices](#coding-standards--best-practices)
- [Testing Guidelines](#testing-guidelines)
- [Debugging & Troubleshooting](#debugging--troubleshooting)
- [Common Development Tasks](#common-development-tasks)
- [Performance Optimization](#performance-optimization)
- [Security Guidelines](#security-guidelines)
- [Deployment Process](#deployment-process)

## Quick Start Checklist

Before diving into development, complete these essential setup steps:

### Prerequisites
- [ ] **Node.js 18+** installed ([Download here](https://nodejs.org/))
- [ ] **Git** configured with your GitHub account
- [ ] **VS Code** or preferred editor installed
- [ ] **Firebase CLI** installed: `npm install -g firebase-tools`
- [ ] Access to the Firebase project (request from team lead)
- [ ] Access to the GitHub repository

### Setup Steps
- [ ] Clone the repository: `git clone [repository-url]`
- [ ] Install dependencies: `npm install`
- [ ] Copy environment file: `cp .env.example .env.local`
- [ ] Configure Firebase credentials in `.env.local`
- [ ] Run development server: `npm run dev`
- [ ] Verify setup by accessing `http://localhost:3000`
- [ ] Run tests to ensure everything works: `npm test` (when available)

### Recommended VS Code Extensions
- [ ] **ES7+ React/Redux/React-Native snippets** - Code shortcuts
- [ ] **Tailwind CSS IntelliSense** - CSS class completion
- [ ] **Firebase Explorer** - Firebase project management
- [ ] **GitLens** - Enhanced Git capabilities
- [ ] **Prettier** - Code formatting
- [ ] **ESLint** - Code linting
- [ ] **Auto Rename Tag** - HTML/JSX tag renaming
- [ ] **Bracket Pair Colorizer** - Visual bracket matching

## Development Environment Setup

### Local Development Setup

#### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/yourusername/agency-max-plus.git
cd agency-max-plus

# Install dependencies
npm install

# Install global tools
npm install -g firebase-tools
```

#### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
code .env.local
```

**Required Environment Variables:**
```env
# Firebase Client (get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (get from Service Account)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### 3. Firebase Setup
```bash
# Login to Firebase
firebase login

# Select your project
firebase use your_project_id

# Deploy security rules (first time only)
firebase deploy --only firestore:rules
```

#### 4. Start Development
```bash
# Start the development server
npm run dev

# In another terminal, start functions (if developing backend)
cd functions && npm run serve
```

### Development Tools Setup

#### Git Configuration
```bash
# Set up your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set up useful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

#### VS Code Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "HTML"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## Project Structure & Conventions

### Directory Structure
```
agency-max-plus/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Protected routes
│   ├── (public)/          # Public routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── auth/         # Authentication
│   │   ├── dashboard/    # Dashboard widgets
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Base UI components
│   ├── lib/              # Utilities
│   │   ├── firebase.js   # Firebase config
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Helper functions
│   └── services/         # Business logic
├── functions/            # Firebase Functions
├── public/              # Static assets
├── scripts/             # Utility scripts
└── docs/                # Documentation
```

### Naming Conventions

#### Files and Directories
- **Components**: PascalCase (`UserAvatar.js`, `DashboardCard.js`)
- **Pages**: kebab-case (`daily-intentions`, `team-management`)
- **Utilities**: camelCase (`firebaseUtils.js`, `dateHelpers.js`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.js`)
- **Assets**: kebab-case (`user-avatar-placeholder.png`)

#### Code Conventions
```javascript
// Component names: PascalCase
function UserProfile({ user }) { }
export default UserProfile

// Function names: camelCase
function calculateUserScore(activities) { }

// Variable names: camelCase
const userActivities = []
const isLoggedIn = true

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3
const API_BASE_URL = 'https://api.example.com'

// CSS classes: kebab-case (Tailwind standard)
<div className="user-profile bg-blue-500 hover:bg-blue-600" />
```

### Import/Export Standards

#### Preferred Import Order
```javascript
// 1. React and Next.js imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { collection, query, where } from 'firebase/firestore'

// 3. Internal imports (absolute paths)
import { auth, db } from '@/src/services/firebase'
import UserAvatar from '@/src/components/common/UserAvatar'
import { formatDate } from '@/src/lib/utils'

// 4. Relative imports
import './ComponentName.css'
```

#### Export Patterns
```javascript
// Default export for main component
export default UserProfile

// Named exports for utilities
export { calculateScore, formatUserData }

// Re-exports from index files
export { default as UserProfile } from './UserProfile'
export { default as UserSettings } from './UserSettings'
```

## Development Workflow

### Git Workflow

We follow a **feature branch workflow** with pull requests:

#### 1. Starting New Work
```bash
# Ensure main branch is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/user-profile-enhancements
# or
git checkout -b fix/login-redirect-issue
# or
git checkout -b docs/api-documentation
```

#### 2. Branch Naming Conventions
- **Features**: `feature/description-of-feature`
- **Bug fixes**: `fix/description-of-bug`
- **Documentation**: `docs/what-documentation`
- **Refactoring**: `refactor/what-is-being-refactored`
- **Performance**: `perf/what-optimization`

#### 3. Making Changes
```bash
# Make your changes
# ... code, code, code ...

# Stage and commit changes
git add .
git commit -m "Add user profile avatar upload functionality

- Implement image upload component
- Add avatar preview functionality
- Integrate with Firebase Storage
- Add error handling for upload failures"

# Push to remote
git push origin feature/user-profile-enhancements
```

#### 4. Commit Message Format
Follow conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples**:
```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(dashboard): resolve infinite loading state"
git commit -m "docs(api): update Firestore schema documentation"
git commit -m "refactor(components): extract reusable modal component"
```

#### 5. Pull Request Process
1. **Create PR** on GitHub with descriptive title and description
2. **Add labels** (enhancement, bug, documentation, etc.)
3. **Request reviews** from team members
4. **Run CI checks** and ensure all tests pass
5. **Address feedback** and update PR as needed
6. **Merge** after approval (squash and merge preferred)

### Code Review Guidelines

#### For Authors
- **Self-review** your code before requesting review
- **Write clear PR descriptions** explaining what and why
- **Include screenshots** for UI changes
- **Add tests** for new functionality
- **Update documentation** if needed
- **Keep PRs focused** - one feature/fix per PR

#### For Reviewers
- **Be constructive** and respectful in feedback
- **Check functionality** beyond just code quality
- **Test the changes** locally if possible
- **Review security implications** especially for auth/data access
- **Verify performance impact** for large changes
- **Approve promptly** if changes look good

## Coding Standards & Best Practices

### React Best Practices

#### Component Structure
```javascript
// Good: Well-structured component
import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

/**
 * UserProfile component displays user information and allows editing
 * @param {Object} user - User object with profile data
 * @param {Function} onUpdate - Callback fired when user profile is updated
 */
function UserProfile({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Event handlers
  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])
  
  const handleSave = useCallback(async (userData) => {
    setLoading(true)
    try {
      await updateUserProfile(userData)
      onUpdate(userData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      // Handle error appropriately
    } finally {
      setLoading(false)
    }
  }, [onUpdate])
  
  // Effects
  useEffect(() => {
    // Side effects here
  }, [user])
  
  // Render
  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  )
}

UserProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export default UserProfile
```

#### Hooks Best Practices
```javascript
// Custom hooks for reusable logic
function useUserProfile(userId) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (!userId) return
    
    const unsubscribe = subscribeToUser(userId, {
      onData: (userData) => {
        setUser(userData)
        setLoading(false)
      },
      onError: (err) => {
        setError(err)
        setLoading(false)
      }
    })
    
    return unsubscribe
  }, [userId])
  
  return { user, loading, error }
}

// Usage in components
function UserDashboard({ userId }) {
  const { user, loading, error } = useUserProfile(userId)
  
  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />
  if (!user) return <UserNotFound />
  
  return <Dashboard user={user} />
}
```

#### State Management
```javascript
// Use local state for component-specific data
const [isOpen, setIsOpen] = useState(false)

// Use context for global application state
const { user, setUser } = useContext(UserContext)

// Use external state management (if needed) for complex state
import { useStore } from '@/src/store'
```

### Firebase Best Practices

#### Firestore Queries
```javascript
// Good: Efficient queries with proper indexing
const getUserActivities = async (userId, limit = 10) => {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limit)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Good: Real-time subscriptions with proper cleanup
useEffect(() => {
  if (!user?.uid) return
  
  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', user.uid),
    where('isRead', '==', false)
  )
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setUnreadNotifications(notifications)
  })
  
  return unsubscribe // Cleanup subscription
}, [user?.uid])
```

#### Authentication Patterns
```javascript
// Good: Proper auth state management
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    
    return unsubscribe
  }, [])
  
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`)
    }
  }
  
  const value = {
    user,
    login,
    logout: () => signOut(auth),
    loading
  }
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
```

### CSS/Styling Best Practices

#### Tailwind CSS Guidelines
```javascript
// Good: Semantic component classes
<div className="user-card glass rounded-xl p-6 shadow-lg">
  <div className="user-avatar w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
  </div>
</div>

// Good: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards.map(card => (
    <Card key={card.id} {...card} />
  ))}
</div>

// Good: Dark mode support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Dashboard
  </h1>
</div>
```

#### Custom CSS (when needed)
```css
/* Use CSS custom properties for design tokens */
:root {
  --brand-primary: #003DA5;
  --brand-secondary: #0050C8;
  --surface-glass: rgba(255, 255, 255, 0.1);
  --border-glass: rgba(255, 255, 255, 0.2);
}

/* Glass morphism utility classes */
.glass {
  background: var(--surface-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-glass);
}

/* Animation utilities */
.fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Testing Guidelines

While the current codebase doesn't have extensive tests yet, follow these guidelines when adding tests:

### Test Structure
```javascript
// UserProfile.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserProfile from './UserProfile'

// Mock Firebase
jest.mock('@/src/services/firebase', () => ({
  db: {},
  auth: {},
}))

describe('UserProfile', () => {
  const mockUser = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatars/john.jpg'
  }

  test('renders user information correctly', () => {
    render(<UserProfile user={mockUser} onUpdate={() => {}} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  test('handles edit mode toggle', async () => {
    render(<UserProfile user={mockUser} onUpdate={() => {}} />)
    
    const editButton = screen.getByText('Edit Profile')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })
  })
})
```

### Testing Firebase Integration
```javascript
// Use Firebase emulator for integration tests
import { useEmulator } from '@firebase/testing'

beforeAll(async () => {
  // Connect to Firestore emulator
  if (!emulator.apps.length) {
    const app = initializeTestApp({
      projectId: 'test-project',
      auth: { uid: 'test-user' }
    })
    db = app.firestore()
    auth = app.auth()
  }
})

afterAll(async () => {
  await clearFirestoreData({ projectId: 'test-project' })
})
```

## Debugging & Troubleshooting

### Development Debugging

#### Browser Developer Tools
```javascript
// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = true
  window.db = db
  window.auth = auth
}

// Debug logging utility
const debug = (category, ...args) => {
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log(`[${category}]`, ...args)
  }
}

// Usage
debug('AUTH', 'User logged in:', user)
debug('FIRESTORE', 'Query result:', data)
```

#### React Developer Tools
Install the React Developer Tools browser extension for:
- Component tree inspection
- Props and state debugging
- Performance profiling
- Hook debugging

#### Firebase Debugging
```javascript
// Enable Firestore debug logging
import { enableNetwork, disableNetwork } from 'firebase/firestore'

// Debug offline/online behavior
window.goOffline = () => disableNetwork(db)
window.goOnline = () => enableNetwork(db)

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user)
  if (user) {
    console.log('User claims:', user.accessToken)
  }
})
```

### Common Issues & Solutions

#### Firebase Connection Issues
```javascript
// Issue: "Firebase not initialized" error
// Solution: Check environment variables
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error('Missing Firebase configuration')
}

// Issue: "Permission denied" errors
// Solution: Check Firestore security rules
// Verify user authentication status
// Check user role/permissions
```

#### Build/Development Issues
```bash
# Issue: "Module not found" errors
# Solution: Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install

# Issue: Port already in use
# Solution: Kill process or use different port
npx kill-port 3000
# or
npm run dev -- --port 3001
```

#### Performance Issues
```javascript
// Issue: Slow page loads
// Solution: Use React Profiler
import { Profiler } from 'react'

function App() {
  const onRenderCallback = (id, phase, actualDuration) => {
    console.log('Render timing:', { id, phase, actualDuration })
  }
  
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourApp />
    </Profiler>
  )
}
```

## Common Development Tasks

### Adding a New Page
```bash
# 1. Create page file
touch app/new-feature/page.js

# 2. Create page component
cat > app/new-feature/page.js << EOF
import { auth } from '@/src/services/firebase'
import NewFeatureClient from './NewFeatureClient'

export const metadata = {
  title: 'New Feature - Agency Max Plus',
  description: 'Description of new feature'
}

export default function NewFeaturePage() {
  return <NewFeatureClient />
}
EOF

# 3. Create client component if needed
touch app/new-feature/NewFeatureClient.js
```

### Adding a New Component
```bash
# 1. Create component directory
mkdir src/components/feature-name

# 2. Create component file
cat > src/components/feature-name/FeatureName.js << EOF
'use client'
import { useState } from 'react'

export default function FeatureName({ prop1, prop2 }) {
  const [state, setState] = useState(null)
  
  return (
    <div className="feature-name">
      {/* Component content */}
    </div>
  )
}
EOF

# 3. Create index file for clean imports
cat > src/components/feature-name/index.js << EOF
export { default } from './FeatureName'
EOF
```

### Adding Firebase Functions
```bash
# 1. Navigate to functions directory
cd functions

# 2. Add function to index.js
cat >> index.js << EOF

// New function
exports.newFunction = functions.https.onCall(async (data, context) => {
  // Validate authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }
  
  try {
    // Function logic here
    return { success: true, result: data }
  } catch (error) {
    console.error('Function error:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Function execution failed'
    )
  }
})
EOF

# 3. Deploy function
firebase deploy --only functions:newFunction
```

### Database Schema Changes
```javascript
// 1. Plan the migration
// - Identify affected collections
// - Plan backward compatibility
// - Consider data volume

// 2. Write migration script
const migrateUserProfiles = async () => {
  const batch = writeBatch(db)
  
  const snapshot = await getDocs(collection(db, 'members'))
  
  snapshot.docs.forEach(doc => {
    const docRef = doc.ref
    batch.update(docRef, {
      newField: 'defaultValue',
      updatedAt: serverTimestamp()
    })
  })
  
  await batch.commit()
  console.log('Migration completed')
}

// 3. Test in development first
// 4. Run in production during low usage
```

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
ANALYZE=true npm run build

# Use bundle analyzer
npm install --save-dev @next/bundle-analyzer
```

### Code Splitting
```javascript
// Lazy load components
import { lazy, Suspense } from 'react'
import LoadingSkeleton from '@/src/components/ui/LoadingSkeleton'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function MyPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HeavyComponent />
    </Suspense>
  )
}

// Dynamic imports for libraries
const handleExport = async () => {
  const { exportData } = await import('./exportUtils')
  exportData(data)
}
```

### Image Optimization
```javascript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/user-avatar.jpg"
  alt="User Avatar"
  width={200}
  height={200}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Database Query Optimization
```javascript
// Good: Use compound queries with proper indexes
const getTeamLeaderboard = (teamId) => {
  return query(
    collection(db, 'members'),
    where('teamId', '==', teamId),
    orderBy('seasonPoints', 'desc'),
    limit(10)
  )
}

// Good: Use pagination for large datasets
const getPaginatedActivities = (userId, lastDoc, limit = 20) => {
  let q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limit)
  )
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc))
  }
  
  return q
}
```

## Security Guidelines

### Authentication Security
```javascript
// Always verify user authentication
const requireAuth = (user) => {
  if (!user) {
    throw new Error('Authentication required')
  }
}

// Check user permissions before sensitive operations
const requireRole = (user, requiredRole) => {
  if (!user || user.role !== requiredRole) {
    throw new Error('Insufficient permissions')
  }
}

// Example usage
const updateUserProfile = async (userId, updates, currentUser) => {
  requireAuth(currentUser)
  
  if (userId !== currentUser.uid && currentUser.role !== 'god') {
    throw new Error('Can only update own profile')
  }
  
  // Proceed with update
}
```

### Data Validation
```javascript
// Validate all user inputs
const validateUserData = (data) => {
  const errors = {}
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Valid email required'
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors)
  }
}

// Sanitize data before database operations
const sanitizeUserInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}
```

### Secure Firebase Rules
```javascript
// Example secure rule
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /members/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'god');
    }
  }
}
```

## Deployment Process

### Environment Setup
- **Development**: Local development with emulators
- **Staging**: Preview deployments for testing
- **Production**: Live application serving users

### Deployment Checklist
- [ ] Run tests locally
- [ ] Check build succeeds: `npm run build`
- [ ] Review environment variables
- [ ] Update Firebase rules if needed
- [ ] Deploy Firebase functions if changed
- [ ] Create pull request
- [ ] Get code review approval
- [ ] Merge to main branch
- [ ] Verify deployment successful
- [ ] Test critical functionality

### Manual Deployment Commands
```bash
# Deploy everything
npm run build
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Rollback Procedures
```bash
# View previous deployments
firebase hosting:releases

# Rollback to previous version
firebase hosting:rollback
```

---

## Getting Help

### Internal Resources
- **README.md** - Project overview and setup
- **COMPONENTS.md** - Component library documentation  
- **API_DOCUMENTATION.md** - API and Firebase reference
- **ARCHITECTURE.md** - System design and architecture

### External Resources
- **Next.js Documentation** - https://nextjs.org/docs
- **React Documentation** - https://react.dev
- **Firebase Documentation** - https://firebase.google.com/docs
- **Tailwind CSS** - https://tailwindcss.com/docs

### Team Communication
- **Code Reviews** - GitHub Pull Requests
- **Questions** - Team Slack channel or GitHub Discussions
- **Bug Reports** - GitHub Issues
- **Feature Requests** - GitHub Issues with enhancement label

### Office Hours
- **Team Lead Available**: [Days/Times]
- **Code Review Sessions**: [Schedule]
- **Architecture Discussions**: [Schedule]

---

*This developer guide is a living document. Please contribute improvements and keep it updated as the codebase evolves!*