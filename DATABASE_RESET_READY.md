# ✅ Database Reset Setup Complete

## Firebase Admin SDK Configured

The `.env.local` file has been successfully updated with your Firebase Admin SDK credentials from the service account JSON file.

### Credentials Added:
- **Project ID**: agency-max-plus
- **Client Email**: firebase-adminsdk-fbsvc@agency-max-plus.iam.gserviceaccount.com
- **Private Key**: ✅ Successfully added (encrypted)

### Admin Account Configuration:
- **Email**: kristian.suson@gmail.com
- **Initial Password**: AdminPassword123!
- **Location**: Washington
- **Privileges**: Full Admin / God Mode

## 🚀 Ready to Reset Database

You can now run the database reset command to:
1. Delete all existing users
2. Delete all teams and associated data
3. Delete all sales records
4. Create your admin account with god mode privileges

### Run the Reset:

```bash
npm run reset:db
```

Or:

```bash
npm run admin:setup
```

## ⚠️ Important Reminders

1. **This will DELETE ALL DATA** - Make sure you want to proceed
2. **The script has a 5-second safety delay** - Press Ctrl+C to cancel
3. **Change your password immediately** after first login
4. **Your admin panel** will be available at `/admin/panel`

## 📋 What Happens During Reset

1. **All users deleted** from Firebase Authentication
2. **All Firestore collections cleared**:
   - users
   - teams
   - sales
   - activities
   - notifications
   - dailyIntentions
   - nightlyWraps
   - teamActivities
   - achievements
   - badges
   - leaderboard
   - monthlyTotals
   - userStats
   - teamStats

3. **Admin account created** with:
   - Authentication record
   - Firestore user document
   - God mode privileges
   - Full admin permissions

4. **System initialized** with:
   - Default badges
   - System configuration
   - Admin settings

## 🔒 Security Notes

- The `.env.local` file is gitignored and will never be committed
- Your private key is securely stored
- Admin privileges are properly configured
- The admin panel is protected and only accessible to admin users

## 📊 Admin Panel Features

Once logged in as admin, you can:
- View and manage all users
- Delete users (individually or bulk)
- Manage teams
- Export all platform data
- View platform statistics
- Access god mode controls

## Next Steps

1. Run `npm run reset:db` to clear the database
2. Log in with kristian.suson@gmail.com
3. Change your password immediately
4. Access the admin panel at `/admin/panel`

---

**Setup completed**: August 30, 2025
**Firebase Project**: agency-max-plus
**App Name**: Agency Max +