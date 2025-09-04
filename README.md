# Agency Max Plus

> A modern performance management platform for insurance agents with intelligent gamification, team collaboration, and real-time coaching.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Agency Max Plus** is a comprehensive performance gamification platform designed specifically for insurance agents. It combines modern web technologies with behavioral psychology to create an engaging environment that motivates agents, tracks performance, and builds stronger teams through intelligent gamification and real-time coaching.

## 🎨 Design Principles

### Liquid Glass Design System
Our UI implements a sophisticated glass morphism design with these core principles:

- **Translucent Surfaces**: Multi-layered glass effects with backdrop blur create depth and hierarchy
- **Progressive Disclosure**: Essential information upfront, details revealed on interaction
- **Single-Purpose Components**: Each card/widget focuses on one primary metric or action
- **Adaptive Density**: Toggle between spacious and condensed layouts based on user preference
- **Trustworthy Palette**: Deep Allstate blues (#003DA5) with airy, breathable surfaces

### Visual Language
- **Glass Effects**: Layered translucent surfaces with subtle borders and shadows
- **Micro-interactions**: Subtle hover states, smooth transitions, and responsive feedback
- **Typography**: Clean hierarchical system from display headings to body text
- **Accessibility First**: WCAG AA compliant colors, clear focus states, reduce-motion support

## Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router and server components
- **React 19.1.1** - Latest React with concurrent features and improved performance
- **Tailwind CSS 3.4.17** - Utility-first CSS framework with JIT compilation
- **Lucide React 0.542.0** - Beautiful & consistent icon library

### Backend & Services
- **Firebase 12.2.1** - Complete backend-as-a-service platform
  - Authentication - Secure user management with email/password and social logins
  - Firestore - NoSQL document database with real-time synchronization
  - Cloud Storage - File storage for avatars, images, and documents
  - Cloud Functions - Serverless functions for complex business logic
- **Firebase Admin SDK 11.11.1** - Server-side Firebase operations

### Development & Build Tools
- **TypeScript 5.x** - Type safety and enhanced developer experience
- **ESLint 9.x** - Code linting and quality enforcement
- **PostCSS 8.5.6** - CSS processing and optimization
- **Sharp 0.34.3** - High-performance image processing

### Design System
- **Liquid Glass UI** - Premium glass morphism design inspired by Apple's design language
- **Allstate Brand Colors** - Professional color palette aligned with brand guidelines
- **Responsive Design** - Mobile-first approach with desktop optimization

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm** or **yarn** - Package manager (npm comes with Node.js)
- **Git** - Version control system
- **Firebase Account** - [Create at firebase.google.com](https://firebase.google.com/)
- **Code Editor** - VS Code recommended with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Firebase Explorer (optional)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/agency-max-plus.git
cd agency-max-plus
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
# See "Environment Variables" section below for detailed configuration
```

### 4. Configure Firebase

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password method)
3. Create a Firestore database in production mode
4. Enable Storage for file uploads
5. Deploy Firestore rules: `npm run deploy:rules`
6. (Optional) Set up Firebase Functions for server-side features

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 6. Initial Setup

1. Create your first admin account through the signup flow
2. Run database setup: `npm run admin:setup`
3. (Optional) Seed test data: `npm run seed:bots`

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking (if TypeScript)
npm run type-check
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

### Core Platform Features
- **Performance Dashboard** - Real-time KPI tracking with customizable widgets
- **Gamification System** - Points, levels, streaks, and achievement badges
- **Team Leaderboards** - Competitive rankings with various metrics
- **Goal Setting & Tracking** - Personal and team objectives with progress monitoring
- **Activity Logging** - Easy sales and activity entry with bulk operations
- **User Profiles** - Customizable avatars, banners, and personal branding

### Engagement & Motivation
- **Daily Intentions** - Goal-setting workflow to start each day focused
- **Achievement Wall** - Showcase of earned badges and milestones
- **Micro-celebrations** - Instant feedback and recognition for accomplishments
- **Peer Recognition** - Team members can cheer and celebrate each other
- **Progress Visualization** - Charts and graphs showing performance trends

### Administrative Tools
- **Admin Panel** - Comprehensive management dashboard for administrators
- **User Management** - Create, edit, and manage agent accounts
- **Team Organization** - Group agents into teams with leaders
- **Season Management** - Time-bounded competitions and challenges
- **Performance Analytics** - Deep insights into team and individual metrics

### Technical Features
- **Real-time Updates** - Live data synchronization across all users
- **Offline Support** - Continue working even without internet connection
- **Mobile Responsive** - Optimized experience on all devices
- **Dark/Light Theme** - User preference-based theme switching
- **Accessibility** - WCAG AA compliant design and interactions

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘N` / `Ctrl+N` | Create new lead/task |
| `⌘B` / `Ctrl+B` | Toggle sidebar |
| `⌘/` / `Ctrl+/` | Show keyboard shortcuts |
| `Escape` | Close modals/drawers |
| `⌘D` / `Ctrl+D` | Toggle density mode |

## 🔧 Extending Command Palette Actions

The Command Palette is the central hub for all actions. To add new commands:

### 1. Define Your Action

Create a new action in `components/navigation/CommandPalette.js`:

```javascript
const customActions = [
  {
    id: 'custom-action',
    name: 'My Custom Action',
    icon: '🎯',
    shortcut: ['⌘', 'Y'],
    category: 'Actions',
    action: () => {
      // Your action logic here
      console.log('Custom action triggered!')
    }
  }
]
```

### 2. Add to Action Categories

Update the `actions` array in the CommandPalette component:

```javascript
const actions = [
  ...navigationActions,
  ...quickActions,
  ...customActions, // Add your custom actions
  ...searchResults
]
```

### 3. Implement Action Handler

For complex actions, create a dedicated handler:

```javascript
// utils/commandActions.js
export const handleCustomAction = async (params) => {
  // Complex logic here
  await performAction(params)
  // Update UI, show notifications, etc.
}
```

### 4. Register Keyboard Shortcut (Optional)

Add global keyboard shortcuts in `hooks/useKeyboardShortcuts.js`:

```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
      e.preventDefault()
      handleCustomAction()
    }
  }
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

## 🎨 Theme Customization

### Light/Dark Mode
The platform supports both light and dark themes with automatic system preference detection:

```javascript
// Toggle theme programmatically
import { useTheme } from '@/components/theme/ThemeProvider'

const { theme, setTheme } = useTheme()
setTheme('dark') // 'light', 'dark', or 'system'
```

### UI Version Toggle
Switch between Classic and Modern UI versions:
- Add `?ui=v1` for Classic view
- Add `?ui=v2` for Modern view (default)
- Use the toggle in the top navigation bar

### Custom Theme Colors
Modify design tokens in `styles/design-tokens.css`:

```css
:root {
  --brand-500: #003DA5;  /* Your primary brand color */
  --brand-600: #002D75;  /* Darker variant */
  --brand-400: #0050C8;  /* Lighter variant */
}
```

## Project Structure

```
agency-max-plus/
├── app/                          # Next.js 15+ App Router
│   ├── achievement-wall/        # Achievement showcase page
│   ├── admin/                   # Admin panel and management
│   ├── dashboard/               # Main dashboard (v1 & v2)
│   ├── daily-intentions/        # Daily goal setting
│   ├── design-system/           # UI component showcase
│   ├── journal/                 # Activity logging
│   ├── leaderboard/            # Team rankings
│   ├── onboarding/             # New user setup
│   ├── performance/            # Performance analytics
│   ├── profile/                # User profile management
│   ├── team/                   # Team management
│   ├── globals.css             # Global CSS styles
│   ├── layout.js               # Root layout with providers
│   └── page.js                 # Landing/login page
├── src/                         # Source code
│   ├── components/             # Reusable React components
│   │   ├── auth/              # Authentication components
│   │   ├── banner/            # User banner & customization
│   │   ├── common/            # Shared UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── forms/             # Form components & validation
│   │   ├── gamification/      # Points, badges, achievements
│   │   ├── leaderboard/       # Ranking & competition UI
│   │   ├── navigation/        # Navigation & menu components
│   │   └── ui/                # Base UI components library
│   ├── lib/                    # Utilities and configurations
│   │   ├── firebase/          # Firebase client & admin setup
│   │   ├── utils/             # Helper functions
│   │   └── hooks/             # Custom React hooks
│   └── styles/                 # CSS and styling
├── functions/                   # Firebase Cloud Functions
├── public/                     # Static assets
│   ├── avatars/               # User avatar images
│   ├── badges/                # Achievement badge images
│   └── icons/                 # App icons and logos
├── scripts/                    # Utility scripts
│   ├── seedBotUsers.mjs       # Test data generation
│   ├── resetDatabase.mjs      # Database setup
│   └── optimizeImages.mjs     # Image optimization
├── docs/                       # Documentation
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Database indexes
├── firebase.json              # Firebase configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

## Environment Variables

The application requires several environment variables for proper configuration. Copy `.env.example` to `.env.local` and configure the following:

### Firebase Client Configuration (Required)
These are safe to expose to the client and are prefixed with `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdefghijklmnop
```

### Firebase Admin Configuration (Server-Side)
Required for server-side operations and Cloud Functions:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----\n"
```

### Optional Configuration

```env
# Feature Flags
NEXT_PUBLIC_ENABLE_COACHING=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS=false
```

### Getting Firebase Credentials

1. **Client Configuration**: Firebase Console → Project Settings → General → Your apps
2. **Admin Configuration**: Firebase Console → Project Settings → Service Accounts → Generate new private key

> **Security Note**: Never commit actual credentials to version control. The `.env.local` file is already included in `.gitignore`.

## Available Scripts

The application comes with several utility scripts for development and maintenance:

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build production bundle
npm run start           # Start production server
npm run lint            # Run ESLint code quality checks

# Database Management
npm run admin:setup     # Initialize database with admin settings
npm run seed:bots       # Populate database with test bot users
npm run reset:db        # Reset database to clean state

# Asset Optimization
npm run optimize:images # Optimize all images in the project
npm run optimize:logo   # Specifically optimize logo assets

# Git Helpers
npm run branch:create   # Create and switch to new branch
npm run branch:switch   # Switch to existing branch
npm run commit         # Add all changes and commit
npm run push           # Push current branch to origin
npm run status         # Check git status
```

## Testing

Currently, the application includes manual testing workflows and integration with Firebase services:

### Manual Testing
- Use the design system page (`/design-system`) to test UI components
- Test pages are available for specific features:
  - `/test-avatars` - Avatar system testing
  - `/test-notifications` - Notification testing
  - `/test-points` - Points system testing
  - `/test-realtime` - Real-time updates testing
  - `/test-sales` - Sales logging testing

### Future Testing Implementation
Consider adding these testing frameworks:
- **Jest** for unit testing
- **Cypress** or **Playwright** for E2E testing
- **React Testing Library** for component testing

## 📊 Performance Optimization

### Built-in Optimizations
- **Code Splitting**: Automatic route-based splitting with Next.js
- **Image Optimization**: Next/Image component with lazy loading
- **Font Optimization**: Next/Font for optimal web font loading
- **CSS-in-JS**: Tailwind CSS with JIT compilation

### Monitoring
- Lighthouse CI integration for performance budgets
- Real User Monitoring (RUM) with Web Vitals
- Error tracking with Sentry (optional)

## Deployment

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments and serverless functions.

```bash
# Install Vercel CLI
npm i -g vercel

# Login to your Vercel account
vercel login

# Deploy to preview (automatic for pull requests)
vercel

# Deploy to production
vercel --prod
```

#### Environment Variables Setup
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all environment variables from your `.env.local`
4. Ensure production variables are properly configured

### Manual Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Test the production build locally**
   ```bash
   npm run start
   ```

3. **Deploy Firebase resources** (if using Cloud Functions)
   ```bash
   firebase deploy --only functions
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

### Other Deployment Options

#### Netlify
```bash
# Build command
npm run build

# Publish directory
.next
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional Hosting
After running `npm run build`, deploy the `.next` folder and static assets to your hosting provider.

## Troubleshooting

### Common Issues

#### Build/Development Issues

**"Module not found" errors**
```bash
# Clear Next.js cache and node_modules
rm -rf .next node_modules package-lock.json
npm install
```

**Environment variables not loading**
- Ensure `.env.local` exists in the root directory
- Check that variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Restart the development server after adding new variables

**TypeScript errors**
```bash
# Regenerate TypeScript types
npm run build
```

#### Firebase Issues

**Authentication not working**
- Verify Firebase configuration in console
- Check that Authentication is enabled for your project
- Ensure proper environment variables are set
- Check browser console for detailed error messages

**Firestore permissions errors**
- Deploy security rules: `firebase deploy --only firestore:rules`
- Check that user is authenticated before accessing data
- Verify rules match your data structure

**Functions not deploying**
```bash
# Check functions directory and index.js
cd functions && npm install
firebase deploy --only functions
```

#### UI/Performance Issues

**Glass effects not rendering**
- Check browser support for `backdrop-filter` CSS property
- Ensure hardware acceleration is enabled in browser settings
- Test on different browsers/devices

**Slow performance**
- Check browser dev tools for performance bottlenecks
- Verify images are optimized (run `npm run optimize:images`)
- Monitor bundle size and consider code splitting

**Theme not persisting**
- Check that localStorage is enabled in browser
- Clear browser cache and cookies
- Verify ThemeProvider is properly configured

### Debug Tools

**Enable debug mode**
Add `?debug=true` to any URL for verbose console logging

**Performance monitoring**
Set `NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS=true` in environment variables

**Firebase debugging**
```javascript
// Enable Firestore debug logging
firebase.firestore.setLogLevel('debug')
```

### Getting Help

1. Check the [GitHub Issues](https://github.com/yourusername/agency-max-plus/issues)
2. Review Firebase Console logs for backend issues
3. Use browser dev tools Network tab for API call debugging
4. Check Vercel deployment logs for production issues

## Documentation

- **[COMPONENTS.md](COMPONENTS.md)** - Comprehensive component library documentation
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Firebase functions and API reference
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and technical architecture
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Onboarding guide for new developers

## Resources & References

### Framework Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs) - React framework and App Router
- [React 19 Documentation](https://react.dev/) - Component library and hooks
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework

### Backend Services
- [Firebase Documentation](https://firebase.google.com/docs) - Authentication, Firestore, Functions
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Design & Accessibility
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [Allstate Brand Guidelines](https://www.allstate.com) - Brand colors and design principles

### Development Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system and configuration
- [ESLint Documentation](https://eslint.org/docs/user-guide/) - Code linting and quality
- [Vercel Documentation](https://vercel.com/docs) - Deployment and hosting

## Contributing

We welcome contributions from the community! To contribute:

1. **Fork the repository** and create a feature branch
2. **Follow the coding standards** outlined in [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
3. **Add tests** for new features and ensure all tests pass
4. **Update documentation** for any API or component changes
5. **Submit a pull request** with a clear description of changes

### Development Guidelines
- Follow the existing code style and naming conventions
- Write meaningful commit messages
- Update relevant documentation
- Test across different browsers and devices

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/agency-max-plus/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/yourusername/agency-max-plus/discussions)
- **Email Support**: support@agency-max-plus.com

## Acknowledgments

This project was built with inspiration and support from:

- **Apple's Human Interface Guidelines** - Design philosophy and user experience principles
- **Allstate Corporation** - Brand identity, color palette, and trust-focused design approach
- **Next.js Team** - Outstanding React framework and development experience
- **Firebase Team** - Robust backend-as-a-service platform
- **Tailwind CSS Team** - Utility-first CSS framework
- **Open Source Community** - Countless contributors to the libraries and tools we use

---

<div align="center">

**Agency Max Plus** • Version 1.5.0 • Built with ❤️ for insurance agents

[Website](https://agency-max-plus.vercel.app) • [Documentation](docs/) • [GitHub](https://github.com/yourusername/agency-max-plus)

*Last Updated: September 2024*

</div>