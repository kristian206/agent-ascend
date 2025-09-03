# Deployment Guide for Agency Ascent

## Vercel Deployment

### Prerequisites

1. Vercel account linked to your GitHub repository
2. Firebase project with Firestore and Authentication enabled
3. Firebase service account credentials (for server-side features)

### Environment Variables Setup

#### Required Variables (Client-Side)

These variables are required for the app to function:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

#### Optional Variables (Server-Side Features)

These enable server components and server-side rendering:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Getting Firebase Admin Credentials

1. Go to Firebase Console
2. Select your project
3. Navigate to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the required values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### Adding Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable from `.env.example`
4. For `FIREBASE_PRIVATE_KEY`:
   - Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Paste it as-is (Vercel will handle newlines)

### Build Configuration

The app is configured to build successfully even without Firebase Admin SDK credentials:

- **With Admin SDK**: Full server-side rendering, faster initial loads
- **Without Admin SDK**: Client-side authentication only, still fully functional

### Deployment Steps

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin master
   ```

2. Vercel will automatically deploy on push

3. Monitor the build logs in Vercel dashboard

### Troubleshooting

#### Build Fails with Firebase Admin Error

**Error**: "Service account object must contain a string 'project_id' property"

**Solution**: 
- Add the Firebase Admin environment variables in Vercel
- Or continue without them (app will use client-side auth only)

#### Authentication Not Working

**Error**: Users cannot log in

**Solution**:
- Verify `NEXT_PUBLIC_FIREBASE_*` variables are set correctly
- Check Firebase Authentication is enabled
- Verify authorized domains in Firebase Console include your Vercel URL

#### Firestore Index Errors

**Error**: "The query requires an index"

**Solution**:
```bash
firebase deploy --only firestore:indexes
```

### Performance Optimization

The app includes several optimizations:

- 5-minute query caching
- Batch Firebase operations
- Dynamic imports for code splitting
- Server components (when Firebase Admin is configured)
- Optimistic UI updates

### Security Notes

- Never commit `.env.local` to version control
- Keep Firebase Admin credentials secure
- Use Vercel's environment variable encryption
- Regularly rotate service account keys

### Monitoring

After deployment:

1. Check Vercel Functions logs for server-side errors
2. Monitor Firebase Usage & Billing
3. Set up Firebase Performance Monitoring
4. Enable Vercel Analytics for user metrics

### Rollback Procedure

If deployment fails:

1. In Vercel dashboard, go to Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"
4. Investigate and fix the issue before redeploying