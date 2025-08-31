// Firebase Cloud Functions for Server-Side Role Management
// Deploy with: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK
admin.initializeApp();

// Set custom claims for user roles
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to set roles'
    );
  }

  // Check if the requesting user is a god (admin)
  const callerUid = context.auth.uid;
  const callerToken = await admin.auth().getUser(callerUid);
  
  if (!callerToken.customClaims || callerToken.customClaims.role !== 'god') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set user roles'
    );
  }

  const { uid, role } = data;
  
  // Validate inputs
  if (!uid || !role) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing uid or role'
    );
  }

  // Validate role
  const validRoles = ['member', 'leader', 'god'];
  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid role. Must be member, leader, or god'
    );
  }

  try {
    // Set custom user claims
    await admin.auth().setCustomUserClaims(uid, { role });
    
    // Update Firestore document
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .update({ 
        role,
        roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        roleUpdatedBy: callerUid
      });

    return { 
      success: true, 
      message: `Role ${role} set for user ${uid}` 
    };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to set user role'
    );
  }
});

// Automatically set role on user creation
exports.processNewUser = functions.auth.user().onCreate(async (user) => {
  try {
    // Check if this is the god account
    const role = user.email === 'kristian.suson@gmail.com' ? 'god' : 'member';
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, { role });
    
    // Generate unique 6-digit user ID
    const userId = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create user document in Firestore
    const userData = {
      userId,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      role,
      xp: 0,
      level: 1,
      streak: 0,
      lifetimePoints: 0,
      monthPoints: 0,
      weekPoints: 0,
      achievements: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Create in both collections for compatibility
    await admin.firestore().collection('users').doc(user.uid).set(userData);
    await admin.firestore().collection('members').doc(user.uid).set(userData);
    
    console.log(`New user created: ${user.email} with role: ${role}`);
    return null;
  } catch (error) {
    console.error('Error processing new user:', error);
    return null;
  }
});

// Verify user role (callable function)
exports.verifyUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const user = await admin.auth().getUser(context.auth.uid);
    const role = user.customClaims ? user.customClaims.role : 'member';
    
    return {
      uid: context.auth.uid,
      email: user.email,
      role,
      isGod: role === 'god',
      isLeader: role === 'leader' || role === 'god',
      isMember: true
    };
  } catch (error) {
    console.error('Error verifying user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to verify user role'
    );
  }
});

// Rate limiting for authentication attempts
exports.checkRateLimit = functions.https.onCall(async (data, context) => {
  const { email, action } = data;
  
  if (!email || !action) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing email or action'
    );
  }

  const rateLimitRef = admin.firestore()
    .collection('rateLimits')
    .doc(email);

  try {
    const doc = await rateLimitRef.get();
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    if (!doc.exists) {
      // First attempt
      await rateLimitRef.set({
        attempts: [now],
        lastAttempt: now
      });
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    const data = doc.data();
    const recentAttempts = data.attempts.filter(
      timestamp => now - timestamp < windowMs
    );

    if (recentAttempts.length >= maxAttempts) {
      const timeUntilReset = Math.ceil(
        (recentAttempts[0] + windowMs - now) / 1000 / 60
      );
      return { 
        allowed: false, 
        remaining: 0,
        timeUntilReset 
      };
    }

    // Add new attempt
    recentAttempts.push(now);
    await rateLimitRef.update({
      attempts: recentAttempts,
      lastAttempt: now
    });

    return { 
      allowed: true, 
      remaining: maxAttempts - recentAttempts.length 
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to check rate limit'
    );
  }
});

// Clear rate limit on successful login
exports.clearRateLimit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const email = context.auth.token.email;
  
  try {
    await admin.firestore()
      .collection('rateLimits')
      .doc(email)
      .delete();
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing rate limit:', error);
    return { success: false };
  }
});

// Scheduled function to clean up old rate limit records
exports.cleanupRateLimits = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    try {
      const snapshot = await admin.firestore()
        .collection('rateLimits')
        .get();
      
      const batch = admin.firestore().batch();
      let deleteCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.lastAttempt && now - data.lastAttempt > windowMs) {
          batch.delete(doc.ref);
          deleteCount++;
        }
      });
      
      if (deleteCount > 0) {
        await batch.commit();
        console.log(`Cleaned up ${deleteCount} expired rate limit records`);
      }
      
      return null;
    } catch (error) {
      console.error('Error cleaning up rate limits:', error);
      return null;
    }
  });