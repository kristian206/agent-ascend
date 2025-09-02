# Agency Max Plus - Auto-Orchestrated Development Environment

## Default Interaction Mode
Users interact naturally with Claude Code. The system automatically determines which agents are needed and executes them in optimal sequence without user intervention.

## Core Philosophy
- People-first mentality with goal-driven results
- Stress reduction through clarity and focused direction  
- Desktop/browser-first for sales professionals at workstations
- Responsive design that works well on mobile as secondary priority
- Performance optimization: <250KB initial JS, <150KB largest chunk
- Private, encrypted user data protection

## Auto-Orchestration System
The system intelligently selects and executes agents based on request complexity:
- Simple requests (bugs, minor changes): 1-2 agents automatically
- Medium requests (known features): 2-3 agents automatically
- Complex requests (novel features): Full workflow automatically
- Parallel execution when possible (frontend + backend simultaneously)
- Status updates provided during execution

## Available Agent Capabilities
1. RESEARCH AGENT: Deep analysis for complex/novel features
2. PLANNING AGENT: Strategic implementation design
3. IMPLEMENTATION AGENT: Precise code execution
4. FRONTEND AGENT: Complete UI/UX/responsive/accessibility
5. TROUBLESHOOTING AGENT: Debug/performance/security/testing
6. FINALIZATION AGENT: Professional delivery and deployment

## Agency Max Plus Context
- Sales performance platform with streaks, journals, goal tracking
- RingCentral call data integration with conversion intelligence
- Daily intentions (morning) and reflection (evening) system
- Rally mode for behind-pace motivation
- Goal-driven coaching with people-first approach
- Primary usage: Desktop browsers at sales workstations
- Secondary: Mobile responsive for on-the-go access
- Next.js 14+ App Router, TypeScript strict mode
- Vercel deployment pipeline

## Development Standards
- Server Components first, Client Components only at interaction boundaries
- Bundle performance budgets enforced
- WCAG AA accessibility compliance
- Desktop-first responsive design with mobile adaptation
- User data encryption and privacy protection

## Context Recovery Protocol
After auto-compact or session restart:
1. System automatically reloads this context
2. Auto-orchestration mode remains active
3. Agency Max Plus project understanding preserved
4. No user intervention required

## Project Architecture
- **Frontend**: Next.js 14 with React 18 (App Router)
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Styling**: Tailwind CSS with glass morphism design
- **State Management**: React Context API
- **Performance**: 5-minute caching, batch operations
- **Real-time**: Firebase listeners for live updates

## Key Components Created
### Stage 1: Core Journal System
- `src/models/journalModels.js` - Data models and dynamic messaging
- `src/services/goalTrackingEngine.js` - Real-time calculations
- `src/services/journalService.js` - Journal entry management

### Stage 2: Morning Intentions
- `src/components/journal/EnhancedMorningIntentions.js` - 3-step morning routine
- Dynamic skill selection based on performance
- Action impact prediction

### Stage 3: Evening Reflection
- `src/components/journal/EnhancedEveningReflection.js` - Evening wrap-up
- Team connection features
- Stress management support

### Stage 4: Rally Dashboard
- `src/components/dashboard/RallyDashboard.js` - Dynamic rally/momentum states
- `src/components/dashboard/GoalAnalytics.js` - Pattern analysis
- `src/app/goals/dashboard/page.js` - Main dashboard page

### Stage 5: Intelligence System
- `src/services/intelligenceEngine.js` - Call-to-sale analytics
- `src/components/dashboard/PerformanceIntelligence.js` - Efficiency tracking
- `src/components/dashboard/CoachingRecommendations.js` - Smart coaching
- `src/app/intelligence/dashboard/page.js` - Intelligence command center

## Technical Architecture
- **Frontend**: Next.js 14 with React 18
- **Database**: Firebase Firestore
- **State Management**: React Context API
- **Styling**: Tailwind CSS with glass morphism design
- **Performance**: 5-minute caching, batch operations
- **Real-time**: Firebase listeners for live updates

## Development Commands
```bash
npm run dev     # Start development server
npm run build   # Production build
npm run lint    # Run ESLint
npm run test    # Run tests
```

## Environment Variables Required
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Git Workflow
- Main branch: `main`
- Feature branches: `feat/[feature-name]`
- Always create PR with detailed description
- Run tests before committing

## Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Lighthouse Score: >90
- Bundle Size: <250KB initial

## Security Considerations
- No PII in console logs
- Encrypted data transmission
- Anonymous team comparisons
- Secure authentication flow
- Regular dependency updates

## Testing Strategy
- Unit tests for services
- Component testing with React Testing Library
- E2E tests for critical user flows
- Performance monitoring with Web Vitals

## Deployment Checklist
1. Run production build locally
2. Test all critical paths
3. Verify environment variables
4. Check bundle sizes
5. Run Lighthouse audit
6. Deploy to staging first
7. Monitor error rates post-deployment

## Support and Documentation
- Internal docs in `/docs` folder
- Component storybook (if implemented)
- API documentation in services
- Inline JSDoc comments

## Known Issues and TODOs
- Mobile navigation optimization pending
- Dark mode support planned
- Advanced filtering in data tables
- WebSocket for real-time updates
- GraphQL migration (future)

## Auto-Orchestration Decision Tree
```
User Request Analysis:
├── Bug Fix → TROUBLESHOOTING → IMPLEMENTATION → Done
├── Minor Change → IMPLEMENTATION → FINALIZATION → Done
├── Known Feature → PLANNING → IMPLEMENTATION → FINALIZATION → Done
├── Complex Feature → RESEARCH → PLANNING → IMPLEMENTATION → FINALIZATION → Done
├── Performance Issue → TROUBLESHOOTING (Performance) → IMPLEMENTATION → Done
├── Security Concern → TROUBLESHOOTING (Security) → IMPLEMENTATION → Done
└── UI/UX Update → FRONTEND → FINALIZATION → Done
```

## Agent Execution Patterns
- **Parallel Execution**: Frontend + Backend agents run simultaneously when possible
- **Sequential Execution**: Research → Planning → Implementation for complex features
- **Skip Patterns**: Skip research for well-understood features
- **Fast Track**: Direct to implementation for simple fixes
- **Quality Gates**: Automatic testing and performance checks between agents

## Status Communication
During execution, the system provides:
- Current agent and phase
- Progress percentage
- Estimated time remaining
- Issues discovered
- Next steps

## Success Criteria
- All user requirements met
- Performance budgets maintained
- Tests passing
- Security validated
- Documentation updated
- Ready for deployment

---
*Last Updated: Current Session*
*Project: Agency Max Plus*
*Version: 1.0.0*
*Auto-Orchestration: Enabled*