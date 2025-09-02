# Agent Ascend Naming Conventions

## CRITICAL CLARIFICATION: Users vs Members

### Definitions
- **User**: A person/account using the platform
- **Member**: One of four ROLES that a user can have

### User Roles
Users can have one of these roles:
1. `member` - Basic user role
2. `senior` - Senior team member
3. `co-leader` - Team co-leader
4. `leader` - Team leader

### Database Structure

#### Collections
- `members` - Stores USER accounts (historical naming, kept for compatibility)
- `teams` - Team information
- `sales` - Sales records
- `checkins` - Daily check-ins
- `notifications` - User notifications

#### Important Note on 'members' Collection
The `members` collection name is a historical artifact. It actually stores USER data, not role-specific data. We maintain this name for backward compatibility, but internally we use proper naming:

```javascript
// Collection name (kept for compatibility)
const userRef = doc(db, 'members', userId)

// But we use proper variable names
const userData = userDoc.data()  // NOT memberData
const userPoints = userData.points  // NOT memberPoints
```

### Naming Conventions

#### Variables
```javascript
// CORRECT
const user = auth.currentUser
const userId = user.uid
const userData = await getUserData(userId)
const userRole = userData.role  // 'member' | 'senior' | 'co-leader' | 'leader'
const userPoints = userData.points
const userName = userData.name

// INCORRECT
const member = auth.currentUser  // Wrong - this is a user, not specifically a member
const memberData = await getUserData()  // Wrong - this is user data
const memberPoints = userData.points  // Wrong - these are user points
```

#### Functions
```javascript
// CORRECT
function getUserData(userId) { }
function updateUserPoints(userId, points) { }
function getUserRole(userId) { }
function isUserLeader(userId) { }

// INCORRECT  
function getMemberData(userId) { }  // Wrong - getting user data, not member-specific
function updateMemberPoints() { }  // Wrong - updating user points
```

#### Components
```javascript
// CORRECT
<UserProfile />
<UserBanner />
<UserSettings />

// ONLY use "Member" when specifically about the role
<MemberRoleIndicator />  // Shows if user has 'member' role
<TeamMembersList />  // List of users in a team
```

### Role Checking
```javascript
// Check if user has basic member role
const isMemberRole = userData.role === 'member'

// Check if user is on a team
const isTeamMember = userData.teamId !== null

// Check leadership
const isLeader = userData.role === 'leader'
const isCoLeader = userData.role === 'co-leader'
const hasLeadershipRole = ['leader', 'co-leader'].includes(userData.role)
```

### Summary
- **User** = account/person
- **Member** = a specific role type
- The `members` collection stores USERS (kept for compatibility)
- Always use "user" in variable/function names unless specifically referring to the member role
- Document any legacy naming with comments