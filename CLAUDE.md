# Agency Max Plus - Optimized Development Environment

## Claude Code Optimization Settings
- Always use the 4-step workflow: RESEARCH → PLAN → IMPLEMENT → FINALIZE
- Apply progressive thinking levels: think → think hard → think harder → ultrathink
- Maintain context awareness and project understanding
- Use verification at each step before proceeding

## 4-Step Agent System
1. RESEARCH AGENT: Deep analysis before any coding
2. PLANNING AGENT: Detailed implementation strategy  
3. IMPLEMENTATION AGENT: Precise code execution
4. FINALIZATION AGENT: Testing, docs, and PR preparation

## Development Standards for Agency Max Plus
- Next.js 14+ with App Router and RSC (Server Components)
- TypeScript strict mode with proper error handling
- Focus on performance: <250KB initial JS, <150KB largest chunk
- People-first, goal-driven feature development
- Private, encrypted user data handling
- Integration with RingCentral call data and sales tracking

## Coding Best Practices
- Server Components over Client Components when possible
- Dynamic imports for heavy client code
- Proper caching with Next.js APIs
- Image optimization with next/image
- Font optimization with next/font
- Script loading strategies for third-party code

## Context Recovery Protocol
If conversation is compacted or context is lost:
1. Read this CLAUDE.md file completely
2. Reactivate 4-step agent workflow
3. Understand Agency Max Plus project scope
4. Confirm readiness with: "Context loaded. 4-step agents active. Ready for Agency Max Plus development."

## Project Overview
Agency Max Plus is a performance management platform for insurance agents featuring:
- **Journal System**: Daily reflection and goal tracking
- **Goal Intelligence**: Real-time progress monitoring with rally mode
- **Team Connection**: Anonymous team comparisons and energy tracking
- **Call-to-Sale Analytics**: Efficiency tracking without quote data
- **Predictive Coaching**: Smart recommendations based on patterns

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

---
*Last Updated: Current Session*
*Project: Agency Max Plus*
*Version: 1.0.0*