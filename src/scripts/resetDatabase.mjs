import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

const auth = getAuth(app)
const db = getFirestore(app)

async function deleteAllUsers() {
  console.log('🗑️ Starting user cleanup...')
  
  try {
    // Get all users
    const listUsersResult = await auth.listUsers(1000)
    const users = listUsersResult.users
    
    console.log(`Found ${users.length} users to delete`)
    
    // Delete each user
    for (const user of users) {
      try {
        await auth.deleteUser(user.uid)
        console.log(`✅ Deleted user: ${user.email || user.uid}`)
      } catch (error) {
        console.error(`❌ Error deleting user ${user.email}:`, error.message)
      }
    }
    
    console.log('✅ All users deleted from Authentication')
  } catch (error) {
    console.error('❌ Error listing users:', error)
  }
}

async function deleteCollection(collectionName, batchSize = 100) {
  const collectionRef = db.collection(collectionName)
  const query = collectionRef.limit(batchSize)
  
  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject)
  })
  
  async function deleteQueryBatch(query, resolve) {
    const snapshot = await query.get()
    
    if (snapshot.size === 0) {
      resolve()
      return
    }
    
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    console.log(`  Deleted ${snapshot.size} documents from ${collectionName}`)
    
    // Recurse on the next process tick
    process.nextTick(() => {
      deleteQueryBatch(query, resolve)
    })
  }
}

async function deleteAllCollections() {
  console.log('\n🗑️ Starting Firestore cleanup...')
  
  const collections = [
    'users',
    'teams', 
    'sales',
    'activities',
    'notifications',
    'dailyIntentions',
    'nightlyWraps',
    'teamActivities',
    'achievements',
    'badges',
    'leaderboard',
    'monthlyTotals',
    'userStats',
    'teamStats'
  ]
  
  for (const collection of collections) {
    console.log(`Deleting collection: ${collection}`)
    await deleteCollection(collection)
    console.log(`✅ Collection ${collection} deleted`)
  }
  
  console.log('✅ All Firestore collections cleaned')
}

async function createAdminAccount() {
  console.log('\n👤 Creating admin account...')
  
  try {
    // Create the admin user in Authentication
    const userRecord = await auth.createUser({
      email: 'kristian.suson@gmail.com',
      password: 'AdminPassword123!', // You should change this immediately after first login
      displayName: 'Kristian',
      emailVerified: true
    })
    
    console.log('✅ Admin auth account created:', userRecord.uid)
    
    // Set custom claims for admin
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      godMode: true,
      role: 'super_admin'
    })
    
    console.log('✅ Admin claims set')
    
    // Create the admin user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: 'kristian.suson@gmail.com',
      name: 'Kristian',
      firstName: 'Kristian',
      lastName: 'Suson',
      state: 'WA',
      location: 'Washington',
      role: 'super_admin',
      isAdmin: true,
      godMode: true,
      permissions: {
        canViewAllUsers: true,
        canEditAllUsers: true,
        canDeleteUsers: true,
        canManageTeams: true,
        canViewAnalytics: true,
        canManageSystem: true,
        canViewAllData: true,
        canExportData: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      profileComplete: true,
      onboardingComplete: true,
      
      // Initialize stats
      points: 0,
      level: 1,
      streak: 0,
      totalSales: 0,
      rank: 1,
      achievements: [],
      badges: [],
      
      // Admin metadata
      accountType: 'admin',
      createdBy: 'system',
      isSuperAdmin: true
    })
    
    console.log('✅ Admin Firestore document created')
    
    // Create admin settings document
    await db.collection('settings').doc('admin').set({
      superAdmins: [userRecord.uid],
      adminEmails: ['kristian.suson@gmail.com'],
      systemInitialized: true,
      initDate: new Date(),
      lastReset: new Date(),
      features: {
        userManagement: true,
        teamManagement: true,
        salesTracking: true,
        gamification: true,
        notifications: true,
        analytics: true,
        adminPanel: true
      }
    })
    
    console.log('✅ Admin settings configured')
    
    return userRecord
  } catch (error) {
    console.error('❌ Error creating admin account:', error)
    throw error
  }
}

async function initializeSystemData() {
  console.log('\n⚙️ Initializing system data...')
  
  // Create default badges
  const badges = [
    { id: 'first_sale', name: 'First Sale', description: 'Made your first sale', icon: 'trophy' },
    { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: 'fire' },
    { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: 'star' },
    { id: 'sales_10', name: 'Rising Star', description: '10 total sales', icon: 'rocket' },
    { id: 'sales_50', name: 'Sales Pro', description: '50 total sales', icon: 'crown' },
    { id: 'sales_100', name: 'Century Club', description: '100 total sales', icon: 'diamond' },
    { id: 'team_leader', name: 'Team Leader', description: 'Leading a team', icon: 'users' }
  ]
  
  for (const badge of badges) {
    await db.collection('badges').doc(badge.id).set({
      ...badge,
      createdAt: new Date(),
      active: true
    })
  }
  
  console.log('✅ System badges initialized')
  
  // Create system configuration
  await db.collection('config').doc('system').set({
    version: '1.5.0',
    appName: 'Agency Max+',
    initialized: true,
    maintenanceMode: false,
    features: {
      registration: true,
      teamCreation: true,
      salesLogging: true,
      leaderboard: true,
      achievements: true,
      notifications: true
    },
    limits: {
      maxTeamSize: 50,
      maxTeamsPerUser: 3,
      maxSalesPerDay: 100
    },
    gamification: {
      pointsPerSale: 10,
      streakBonus: 5,
      levelUpThreshold: 100
    }
  })
  
  console.log('✅ System configuration set')
}

async function resetDatabase() {
  console.log('🚀 Starting complete database reset...')
  console.log('⚠️  This will delete ALL existing data!')
  console.log('=======================================\n')
  
  try {
    // Step 1: Delete all users from Authentication
    await deleteAllUsers()
    
    // Step 2: Delete all Firestore collections
    await deleteAllCollections()
    
    // Step 3: Create admin account
    const admin = await createAdminAccount()
    
    // Step 4: Initialize system data
    await initializeSystemData()
    
    console.log('\n=======================================')
    console.log('✅ Database reset complete!')
    console.log('\n📋 Admin Account Details:')
    console.log('Email: kristian.suson@gmail.com')
    console.log('Password: AdminPassword123!')
    console.log('UID:', admin.uid)
    console.log('\n⚠️  IMPORTANT: Change your password after first login!')
    console.log('=======================================\n')
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Database reset failed:', error)
    process.exit(1)
  }
}

// Add confirmation prompt
console.log('⚠️  WARNING: This will DELETE all users and data!')
console.log('Only the admin account kristian.suson@gmail.com will remain.')
console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...')

setTimeout(() => {
  resetDatabase()
}, 5000)