# Firestore Security Rules Documentation

## Overview
This document provides comprehensive documentation for the Agency Max Plus platform's Firestore security rules. The rules implement role-based access control (RBAC) with authentication requirements and team-based permissions.

## Rule Version
- **Version**: 2
- **Last Updated**: August 31, 2025
- **Deployed**: Successfully deployed to production

## Authentication Functions

### `isAuthenticated()`
Checks if a user is authenticated with Firebase Auth.
- **Returns**: `boolean`
- **Usage**: Base requirement for all protected resources

### `isOwner(userId)`
Verifies if the authenticated user owns the resource.
- **Parameters**: `userId` - The user ID to check ownership against
- **Returns**: `boolean`
- **Usage**: User profile updates, personal data modifications

### `isGod()`
Admin-level access for system administrators.
- **Parameters**: None
- **Returns**: `boolean`
- **Usage**: System-wide operations, data cleanup, admin functions
- **Note**: Currently checks for specific email address

## Team Management Functions

### `isTeamMember(teamId)`
Checks if the authenticated user is a member of a specific team.
- **Parameters**: `teamId` - The team ID to check membership
- **Returns**: `boolean`
- **Usage**: Team resource access

### `isTeamLeader(teamId)`
Verifies if the authenticated user is the leader of a team.
- **Parameters**: `teamId` - The team ID to check leadership
- **Returns**: `boolean`
- **Usage**: Team management operations

### `isTeamCoLeader(teamId)`
Checks if the authenticated user is a co-leader of a team.
- **Parameters**: `teamId` - The team ID to check co-leadership
- **Returns**: `boolean`
- **Usage**: Team management assistance

### `isTeamLeadership(teamId)`
Combined check for leader OR co-leader status.
- **Parameters**: `teamId` - The team ID to check
- **Returns**: `boolean`
- **Usage**: Team administration tasks

## Collection Rules

### User Profile Collections

#### `/users/{userId}`
Primary user profile data.
- **Read**: Any authenticated user
- **Create**: Only the user themselves
- **Update**: User themselves or admin
- **Delete**: Admin only

#### `/members/{userId}`
Extended user data including team associations.
- **Read**: Any authenticated user
- **Create**: Only the user themselves
- **Update**: User themselves or admin
- **Delete**: Admin only

### Team Management Collections

#### `/teams/{teamId}`
Team configuration and settings.
- **Read**: Any authenticated user
- **Create**: Authenticated user (becomes leader)
- **Update**: Team leader or admin
- **Delete**: Team leader or admin

#### `/teamGoals/{goalId}`
Team-wide goals and targets.
- **Read**: Any authenticated user
- **Create**: Any authenticated user
- **Update**: Team leadership or admin
- **Delete**: Admin only

#### `/memberGoals/{goalId}`
Individual member targets within team goals.
- **Read**: Any authenticated user
- **Create**: Any authenticated user
- **Update**: Goal owner, team leadership, or admin
- **Delete**: Admin only

#### `/goalProgress/{progressId}`
Progress tracking for goals.
- **Read**: Any authenticated user
- **Create**: Authenticated user (for their own progress)
- **Update**: Progress owner or admin
- **Delete**: Admin only

### Season & Competition Collections

#### `/seasons/{seasonId}`
Monthly competitive seasons.
- **Read**: Any authenticated user
- **Create/Update/Delete**: Admin only
- **Note**: System-managed collection

#### `/userSeasons/{userSeasonId}`
User's seasonal progress and rankings.
- **Read**: Any authenticated user
- **Create**: Any authenticated user
- **Update**: User themselves or admin
- **Delete**: Admin only

#### `/lifetimeProgression/{userId}`
Permanent progression tracking across seasons.
- **Read**: Any authenticated user
- **Create**: Only the user themselves
- **Update**: User themselves or admin
- **Delete**: Admin only

#### `/dailyActivities/{activityId}`
Daily point-earning activities.
- **Read**: Any authenticated user
- **Create**: Any authenticated user
- **Update**: Activity owner only
- **Delete**: Admin only

### Activity & Performance Collections

#### `/activities/{activityId}`
General activity tracking.
- **Read**: Any authenticated user
- **Create**: Authenticated user (for their activities)
- **Update**: Disabled (immutable records)
- **Delete**: Admin only

#### `/checkins/{checkinId}`
Daily check-in records.
- **Read**: Any authenticated user
- **Create**: Any authenticated user
- **Update**: Check-in owner (ID format: userId_date)
- **Delete**: Admin only

#### `/dailyIntentions/{intentionId}`
Morning intention setting.
- **Read**: Any authenticated user
- **Create**: User for their own intentions
- **Update**: Intention owner only
- **Delete**: Admin only

#### `/nightlyWraps/{wrapId}`
Evening reflection entries.
- **Read**: Any authenticated user
- **Create**: User for their own wraps
- **Update**: Wrap owner only
- **Delete**: Admin only

### Sales & Business Collections

#### `/sales/{saleId}`
Insurance policy sales records.
- **Read**: Any authenticated user
- **Create**: User for their own sales
- **Update**: Sale owner, their team leadership, or admin
- **Delete**: Admin only

#### `/monthlyTotals/{totalId}`
Aggregated monthly sales data.
- **Read**: Any authenticated user
- **Create/Update**: Any authenticated user
- **Delete**: Admin only
- **Note**: Used for performance optimization

### Notification & Communication

#### `/notifications/{notificationId}`
User notifications and alerts.
- **Read**: Recipient or sender only
- **Create**: Any authenticated user
- **Update**: Recipient only
- **Delete**: Recipient only

### Leaderboard & Stats

#### `/leaderboard/{entry}`
Competition rankings.
- **Read**: Any authenticated user
- **Create**: User for their own entry
- **Update**: Entry owner only
- **Delete**: Disabled

#### `/userStats/{userId}`
Aggregated user statistics.
- **Read**: Any authenticated user
- **Create**: User themselves only
- **Update**: User themselves or admin
- **Delete**: Disabled

#### `/teamStats/{teamId}`
Aggregated team statistics.
- **Read**: Any authenticated user
- **Create/Update**: Any authenticated user
- **Delete**: Disabled

### System Collections

#### `/config/{document}`
System configuration.
- **Read**: Any authenticated user
- **Write**: Admin only

#### `/settings/{document}`
Application settings.
- **Read**: Any authenticated user
- **Write**: Admin only

#### `/audit/{logId}`
Audit trail for sensitive operations.
- **Read**: Admin only
- **Create**: Any authenticated user
- **Update/Delete**: Disabled (immutable)

#### `/rateLimits/{limitId}`
Rate limiting data.
- **Read/Write**: Disabled (Cloud Functions only)

## Security Patterns

### 1. Authentication Required
All collections require authentication for any operation except the catch-all deny rule.

### 2. Owner-Based Access
Most personal data follows the pattern:
- Users can read widely (transparency)
- Users can only modify their own data
- Admins have override capabilities

### 3. Team Hierarchy
Team resources respect the leadership hierarchy:
- Leaders have full control
- Co-leaders have management capabilities
- Members have read access with limited write

### 4. Immutable Records
Certain collections (activities, audit logs) are write-once to maintain data integrity.

### 5. Admin Override
Admin access (`isGod()`) provides system-wide capabilities for maintenance and support.

## Common Error Scenarios

### Permission Denied Errors

1. **Not Authenticated**
   - Solution: Ensure user is logged in
   - Affected: All collections

2. **Not Owner**
   - Solution: Users can only modify their own data
   - Affected: User profiles, personal records

3. **Not Team Leader**
   - Solution: Request team leader to make changes
   - Affected: Team settings, team goals

4. **Missing Collection Rules**
   - Solution: Collection added to rules
   - Affected: New features/collections

## Best Practices

1. **Always authenticate users** before any Firestore operation
2. **Handle permission errors gracefully** with user-friendly messages
3. **Use error handler utility** for consistent error handling
4. **Test new features** with different user roles
5. **Document new collections** when adding features

## Testing Checklist

- [ ] User can create and update their own profile
- [ ] User can view other users' profiles
- [ ] User cannot modify other users' profiles
- [ ] Team leader can modify team settings
- [ ] Team member cannot modify team settings
- [ ] User can log their own sales
- [ ] User can view team members' sales
- [ ] Season data updates correctly
- [ ] Daily activities track properly
- [ ] Notifications are properly scoped

## Deployment Process

1. Update `firestore.rules` file
2. Test rules locally with emulator
3. Deploy with: `firebase deploy --only firestore:rules`
4. Verify deployment in Firebase Console
5. Test critical paths in production

## Troubleshooting

### Common Issues

1. **"Permission denied" on read**
   - Check if user is authenticated
   - Verify collection exists in rules

2. **"Permission denied" on write**
   - Confirm user owns the resource
   - Check team leadership for team resources

3. **New feature not working**
   - Ensure collection is added to rules
   - Deploy rules after changes

### Debug Commands

```bash
# Check current rules
firebase firestore:rules:get

# Deploy rules
firebase deploy --only firestore:rules

# Test with emulator
firebase emulators:start --only firestore
```

## Migration Notes

### Recent Changes (August 31, 2025)

1. **Added Season Collections**
   - `seasons`, `userSeasons`, `lifetimeProgression`
   - Support for monthly competitive seasons

2. **Added Goal Management**
   - `teamGoals`, `memberGoals`, `goalProgress`
   - Granular team goal tracking

3. **Added Activity Tracking**
   - `dailyActivities`
   - Point system integration

4. **Enhanced Error Handling**
   - Comprehensive error messages
   - User-friendly notifications

## Support

For issues or questions regarding Firestore rules:
1. Check this documentation
2. Review error messages in console
3. Contact system administrator
4. File issue in project repository

## Backup Rules Location

Backup copies of rules are stored:
- Primary: `/firestore.rules`
- Backup: `/firestore.rules.backup`
- Version Control: Git repository

---

*This documentation is maintained alongside the Firestore rules and should be updated whenever rules change.*