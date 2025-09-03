# Deploy Firestore Indexes

## Indexes Created
The following indexes have been added to `firestore.indexes.json`:

### Critical Index (Fixes Current Error)
- **nightlyWraps**: userId + createdAt (DESC)
- **dailyIntentions**: userId + createdAt (DESC)

### Additional Indexes for Performance
- **sales**: userId + timestamp (DESC)
- **activities**: userId + timestamp (DESC)
- **checkins**: timestamp (DESC)
- **members**: teamId + seasonPoints (DESC)
- **members**: teamId + lifetimePoints (DESC)
- **monthlyTotals**: userId + month (DESC)

## Deployment Instructions

### Option 1: Firebase CLI (Recommended)
```bash
# Login to Firebase
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Option 2: Manual Creation via Console
1. Open Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Firestore Database → Indexes
4. Click "Create Index" and add:
   - Collection: `nightlyWraps`
   - Fields: 
     - userId (Ascending)
     - createdAt (Descending)
   - Query scope: Collection
5. Repeat for other collections

### Option 3: Use Error Link
When you see the index error in the browser console, Firebase provides a direct link to create the specific index. Click that link to automatically create it.

## Temporary Error Handling
While indexes are building (takes 2-5 minutes), the RecentActivity component includes error handling to gracefully handle missing indexes.

## Verification
After deployment, test that:
1. Dashboard loads without errors
2. Recent Activity shows all event types
3. No Firestore index errors in console

## Status
✅ Index configuration created
⏳ Awaiting manual deployment (Firebase login required)
✅ Error handling added to prevent crashes