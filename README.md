# Agent Ascend - Performance Gamification Platform

A modern performance management platform for insurance agents with intelligent gamification, team collaboration, and real-time coaching. Built with Next.js 13+, React, Firebase, and a premium "Liquid Glass" design system inspired by Apple's design language with Allstate brand colors.

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account (for backend services)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-ascend.git
cd agent-ascend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

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

## 🎯 Features

### Navigation & Discovery
- **Universal Command Palette** (⌘K): Search everything - leads, tasks, agents, actions
- **Smart Left Rail**: Collapsible sidebar with pinnable shortcuts
- **Global Search**: Context-aware search in the top bar
- **Floating Action Button**: Quick access to create new leads/tasks

### Dashboard Experience
- **Modular KPI Cards**: Real-time metrics with trend indicators
- **Work Queue**: Prioritized follow-ups and hot leads
- **Activity Feed**: Recent team and personal activities
- **Gamification Bar**: Streak counter, level progress, points, and rank

### Data Management
- **Advanced DataTable**: Sortable, filterable lists with inline actions
- **Inspector Drawer**: Preview and edit without leaving the list
- **Bulk Operations**: Select multiple items for batch actions
- **Column Preferences**: Personalized table views saved per user

### Performance Coaching
- **Real-time HUD**: Live performance metrics and suggestions
- **Contextual Tips**: AI-powered coaching based on current activity
- **Achievement System**: Badges, milestones, and rewards
- **Team Leaderboards**: Motivating competition with peers

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

## 📁 Project Structure

```
agent-ascend/
├── app/                    # Next.js 13+ app directory
│   ├── dashboard/         # Dashboard pages and layouts
│   ├── leads/            # Lead management pages
│   ├── globals.css       # Global styles
│   └── layout.js         # Root layout with providers
├── components/
│   ├── dashboard/        # Dashboard-specific components
│   ├── navigation/       # AppShell, TopBar, LeftRail
│   ├── theme/           # Theme provider and toggles
│   └── ui/              # Reusable UI components
├── styles/
│   ├── design-tokens.css # CSS variables
│   ├── utilities.css     # Utility classes
│   ├── accessibility.css # A11y utilities
│   └── themes.css        # Theme definitions
├── lib/
│   ├── firebase.js       # Firebase configuration
│   └── utils.js          # Helper functions
└── public/               # Static assets
```

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id

# Feature Flags
NEXT_PUBLIC_ENABLE_COACHING=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

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

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build image
docker build -t agent-ascend .

# Run container
docker run -p 3000:3000 agent-ascend
```

## 🛟 Troubleshooting

### Common Issues

**Glass effects not working**
- Check browser support for `backdrop-filter`
- Ensure GPU acceleration is enabled
- Try forcing hardware acceleration in CSS

**Theme not persisting**
- Verify localStorage is enabled
- Check browser privacy settings
- Clear cache and reload

**Firebase connection issues**
- Verify environment variables are set
- Check Firebase project settings
- Ensure proper authentication rules

### Debug Mode
Add `?debug=true` to URL for verbose console logging

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from Apple's Human Interface Guidelines
- Allstate brand colors and trust principles
- The Next.js and React communities

---

**Version**: 2.0.0 (Liquid Glass UI)  
**Last Updated**: December 2024  
**Status**: Production Ready