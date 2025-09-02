# Firestore Rules Deployment Guide

## Quick Fix for Development (Firebase Console)

1. Go to https://console.firebase.google.com/
2. Select your project: **sales-thermometer**
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. For immediate testing, replace the rules with this temporary version:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY DEVELOPMENT RULES - REPLACE WITH PRODUCTION RULES
    // Allow authenticated users to read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click **Publish** to apply the rules immediately

## Deploy Production Rules via Firebase CLI

### Prerequisites
```bash
npm install -g firebase-tools
```

### Deploy Rules
```bash
cd agent-ascend
firebase login
firebase deploy --only firestore:rules
```

## Production Rules Summary

The `firestore.rules` file in this project includes proper security for:

### Collections with Rules:
- **users/{userId}** - User profiles (read: all authenticated, write: owner only)
- **members/{userId}** - Extended user data (read: all authenticated, write: owner only)
- **sales/{saleId}** - Sales records (read: all authenticated, create: owner only)
- **checkins/{checkinId}** - Daily check-ins (read: all authenticated, write: owner only)
- **teams/{teamId}** - Team data (read: all authenticated, write: team leaders)
- **dailyIntentions/{intentionId}** - Morning intentions (read: all authenticated, write: owner)
- **nightlyWraps/{wrapId}** - Evening wraps (read: all authenticated, write: owner)

### Key Security Features:
1. **Authentication Required** - All operations require user to be logged in
2. **Owner-Only Writes** - Users can only modify their own data
3. **Team Hierarchy** - Team leaders have elevated permissions for team data
4. **God Mode** - Admin account (kristian.suson@gmail.com) has full access

## Common Permission Errors and Solutions

### Error: "Missing or insufficient permissions"

**Causes:**
1. Rules not deployed to Firebase
2. User not authenticated
3. Trying to access data before user document exists

**Solutions:**
1. Deploy rules using Firebase CLI or Console
2. Ensure user is logged in before data access
3. Create user document immediately after authentication

## Testing Rules Locally

```bash
# Start Firebase emulators
firebase emulators:start --only firestore

# Your app will automatically use emulated Firestore if available
```

## Current Rules Status

✅ **Rules File Exists**: `firestore.rules` (11,875 bytes)
✅ **Backup Available**: `firestore.rules.backup`
✅ **Collections Covered**: All major collections have rules
⚠️ **Deployment Required**: Rules must be deployed to take effect

## Next Steps

1. **For Immediate Testing**: Use the temporary development rules in Firebase Console
2. **For Production**: Deploy the actual rules file using Firebase CLI
3. **Monitor**: Check Firebase Console > Firestore > Usage tab for permission denials