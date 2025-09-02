# Agency Max Plus - Single-Approval Autonomous Agent System

## WORKFLOW EXECUTION MODE: AUTONOMOUS WITH SINGLE APPROVAL

### MANDATORY WORKFLOW SEQUENCE
1. **USER COMMAND**: User provides instruction
2. **ORCHESTRATOR PLANNING**: Creates comprehensive plan
3. **AGENT CONSULTATION**: Agents review and discuss plan
4. **ARBITRATION**: Orchestrator resolves disputes with final authority
5. **USER APPROVAL**: Single approval checkpoint - plan presented to user
6. **USER REVIEW**: User approves or requests corrections
7. **AUTONOMOUS EXECUTION**: Upon approval, complete execution without interruption

### COMMUNICATION RULES
- **CONCISE**: No pleasantries, greetings, or filler text
- **DIRECT**: State facts and actions only
- **EFFICIENT**: Minimal tokens, maximum clarity
- **NO CONFIRMATIONS**: Zero intermediate prompts during execution

## Auto-Orchestration System
### Execution Authority
- **Orchestrator**: Full arbitration authority over agent disputes
- **Agents**: Autonomous execution within assigned scope
- **User**: Single approval point after planning phase only
- **Interruptions**: PROHIBITED during execution phase

### Agent Coordination
- **Consultation Phase**: 30-second window for agent input
- **Dispute Resolution**: Orchestrator decision is final
- **Parallel Execution**: Enabled for independent tasks
- **Handoffs**: Automatic without confirmation

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