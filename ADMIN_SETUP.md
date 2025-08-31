# Admin Setup & Database Reset Guide

## ⚠️ WARNING
This process will **DELETE ALL EXISTING DATA** from your Firebase database including:
- All user accounts
- All teams
- All sales records
- All activities and notifications
- All game data and achievements

## Prerequisites

1. **Firebase Admin SDK Credentials**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded JSON file

2. **Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase Admin SDK credentials:
     ```
     FIREBASE_CLIENT_EMAIL=your-service-account-email
     FIREBASE_PRIVATE_KEY="your-private-key-here"
     ```

## Installation

1. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

## Database Reset Process

### Step 1: Run the Reset Script

```bash
npm run reset:db
```

Or directly:
```bash
node scripts/resetDatabase.js
```

This script will:
1. Delete all users from Firebase Authentication
2. Delete all Firestore collections
3. Create a single admin account for Kristian
4. Initialize system data and badges

### Step 2: Admin Account Details

After reset, you'll have one admin account:

```
Email: kristian.suson@gmail.com
Password: AdminPassword123!
Location: Washington
Privileges: Full Admin / God Mode
```

**⚠️ IMPORTANT: Change your password immediately after first login!**

## Admin Panel Features

### Access the Admin Panel

1. Log in with your admin account
2. Navigate to `/admin/panel` or click "Admin" in the navigation menu
3. The Admin link only appears for users with admin privileges

### Admin Capabilities

**User Management:**
- View all registered users
- Delete individual users
- Bulk delete multiple users
- Export user data to JSON
- Search and filter users
- View user statistics

**Team Management:**
- View all teams
- Delete teams
- View team statistics
- Manage team memberships

**System Overview:**
- Total users count
- Total teams count
- Total sales across platform
- Active users today

**Data Export:**
- Export all platform data to JSON
- Includes users, teams, and statistics
- Timestamped exports for record keeping

## Security Features

### Admin Privileges
The admin account has the following permissions:
- `isAdmin: true` - Basic admin flag
- `godMode: true` - Full system access
- `role: 'super_admin'` - Highest role level

### Protected Routes
The admin panel checks for these permissions:
1. User must be authenticated
2. User must have one of: `isAdmin`, `godMode`, or `role === 'super_admin'`
3. Non-admins are redirected to dashboard

### Custom Claims
Firebase custom claims are set for additional security:
```javascript
{
  admin: true,
  godMode: true,
  role: 'super_admin'
}
```

## Manual Database Cleanup (Alternative)

If you prefer to clean the database manually:

### Using Firebase Console

1. **Delete Users:**
   - Go to Authentication → Users
   - Select all users
   - Click "Delete accounts"

2. **Delete Firestore Data:**
   - Go to Firestore Database
   - Delete each collection manually:
     - users
     - teams
     - sales
     - activities
     - notifications
     - etc.

3. **Create Admin Account:**
   - Go to Authentication → Add user
   - Email: kristian.suson@gmail.com
   - Set a secure password

4. **Set Admin Privileges:**
   - Create a document in Firestore:
   - Collection: `users`
   - Document ID: (use the UID from authentication)
   - Add fields:
     ```json
     {
       "email": "kristian.suson@gmail.com",
       "name": "Kristian",
       "isAdmin": true,
       "godMode": true,
       "role": "super_admin",
       "state": "WA",
       "location": "Washington"
     }
     ```

## Troubleshooting

### Script Won't Run
- Ensure Firebase Admin SDK is installed: `npm install firebase-admin`
- Check that your service account credentials are correct
- Verify the private key format (should include newlines)

### Permission Denied
- Make sure your service account has proper permissions
- The service account needs "Firebase Admin" role

### Admin Panel Not Accessible
- Verify the user document has `isAdmin: true`
- Check browser console for errors
- Ensure you're logged in with the admin account

## Post-Setup Checklist

- [ ] Change admin password from default
- [ ] Test admin panel access
- [ ] Verify all old data is deleted
- [ ] Test user creation works
- [ ] Test team creation works
- [ ] Verify admin can delete users/teams
- [ ] Export data to verify export function
- [ ] Set up regular backups

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console logs
3. Verify environment variables are set correctly
4. Ensure all dependencies are installed

---

**Last Updated:** August 30, 2025
**Version:** 1.5.0
**Project:** Agency Max +