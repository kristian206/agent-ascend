import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Washington state data
const WASHINGTON_CITIES = [
  'Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 
  'Kent', 'Everett', 'Renton', 'Yakima', 'Federal Way',
  'Spokane Valley', 'Bellingham', 'Kennewick', 'Auburn', 'Pasco',
  'Marysville', 'Lakewood', 'Redmond', 'Shoreline', 'Richland',
  'Kirkland', 'Burien', 'Sammamish', 'Olympia', 'Lacey'
];

const WASHINGTON_ZIPS = [
  '98101', '98102', '98103', '98104', '98105', '98106', '98107', '98108',
  '98109', '98110', '98111', '98112', '98113', '98114', '98115', '98116',
  '98117', '98118', '98119', '98121', '98122', '98124', '98125', '98126'
];

// Name pools with more diversity
const FIRST_NAMES = [
  'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Thomas',
  'Christopher', 'Daniel', 'Matthew', 'Donald', 'Anthony', 'Paul', 'Mark',
  'George', 'Steven', 'Kenneth', 'Andrew', 'Joshua', 'Kevin', 'Brian',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
  'Jessica', 'Sarah', 'Karen', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna',
  'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Emily', 'Kimberly',
  'Deborah', 'Amy', 'Angela', 'Ashley', 'Brenda', 'Emma', 'Samantha'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
  'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

// Team names
const TEAM_NAMES = [
  'Pacific Pioneers',
  'Emerald Elite',
  'Sound Strikers', 
  'Cascade Champions',
  'Rainier Rangers',
  'Olympic Titans',
  'Puget Power',
  'Evergreen Eagles',
  'Seattle Storm',
  'Northwest Navigators'
];

// Team banners (using available SVGs)
const TEAM_BANNERS = [
  '/images/ui/ribbon.svg',
  '/images/ui/frame-9slice.svg',
  '/images/ui/scallop.svg',
  '/images/ui/cta-bg.svg',
  '/images/ui/ribbon.svg',
  '/images/ui/frame-9slice.svg',
  '/images/ui/scallop.svg',
  '/images/ui/cta-bg.svg',
  '/images/ui/ribbon.svg',
  '/images/ui/frame-9slice.svg'
];

// Motivational phrases for intentions
const MORNING_INTENTIONS = [
  'Focus on customer satisfaction and exceed expectations',
  'Build stronger relationships with clients today',
  'Master product knowledge and share insights with the team',
  'Practice active listening in every conversation',
  'Set a personal record for quality interactions',
  'Help a teammate succeed and grow together',
  'Bring positive energy to every meeting',
  'Turn challenges into opportunities for growth',
  'Be present and mindful in each moment',
  'Celebrate small wins throughout the day',
  'Learn something new from every interaction',
  'Make a positive impact on someone\'s day',
  'Stay focused on solutions, not problems',
  'Embrace challenges as growth opportunities',
  'Lead by example and inspire others'
];

const EVENING_REFLECTIONS = [
  'Grateful for the connections made today',
  'Learned something new from every interaction',
  'Proud of overcoming today\'s challenges',
  'Tomorrow I\'ll apply what I learned today',
  'Teamwork made the difference today',
  'Every conversation was an opportunity to help',
  'Consistency is building momentum',
  'Small steps led to big achievements',
  'Grateful for the support of my team',
  'Ready to make tomorrow even better',
  'Today\'s efforts will pay off tomorrow',
  'Celebrated wins with the team',
  'Pushed through and finished strong',
  'Made progress on long-term goals',
  'Invested in relationships that matter'
];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName, lastName, index) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@agencymaxplus.bot`;
}

function generatePhoneNumber() {
  const areaCode = getRandomElement(['206', '253', '425', '360', '509']);
  return `${areaCode}-${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`;
}

// Generate random stats based on role
function generateUserStats(role) {
  const baseMultiplier = role === 'leader' ? 1.8 : 
                        role === 'co-leader' ? 1.5 : 
                        role === 'senior' ? 1.3 : 1;
  
  return {
    totalSales: Math.floor(getRandomInt(50, 300) * baseMultiplier),
    totalRevenue: Math.floor(getRandomInt(50000, 300000) * baseMultiplier),
    totalCommission: Math.floor(getRandomInt(5000, 30000) * baseMultiplier),
    monthlyGoal: getRandomInt(20, 100),
    monthlyProgress: getRandomInt(30, 150),
    streak: getRandomInt(1, 180),
    level: Math.floor(getRandomInt(5, 40) * baseMultiplier),
    xp: Math.floor(getRandomInt(500, 30000) * baseMultiplier),
    points: Math.floor(getRandomInt(500, 8000) * baseMultiplier),
    todayPoints: getRandomInt(50, 400),
    weeklyPoints: getRandomInt(1000, 4000),
    monthlyPoints: getRandomInt(4000, 16000),
    leadsConverted: Math.floor(getRandomInt(20, 150) * baseMultiplier),
    conversionRate: getRandomInt(25, 75),
    avgDealSize: getRandomInt(1000, 4000),
    customerSatisfaction: getRandomInt(85, 99),
    callsToday: getRandomInt(10, 40),
    emailsToday: getRandomInt(20, 80),
    meetingsToday: getRandomInt(2, 8)
  };
}

// Generate activity timestamps for today
function generateTodayTimestamps() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timestamps = [];
  
  // Morning intention (8-10 AM)
  const morningHour = getRandomInt(8, 9);
  const morningMinute = getRandomInt(0, 59);
  const morningTime = new Date(today);
  morningTime.setHours(morningHour, morningMinute);
  timestamps.push({ type: 'morning', time: Timestamp.fromDate(morningTime) });
  
  // Activities throughout the day (10 AM - 6 PM)
  const activityCount = getRandomInt(4, 8);
  for (let i = 0; i < activityCount; i++) {
    const hour = getRandomInt(10, 17);
    const minute = getRandomInt(0, 59);
    const activityTime = new Date(today);
    activityTime.setHours(hour, minute);
    timestamps.push({ type: 'activity', time: Timestamp.fromDate(activityTime) });
  }
  
  // Evening reflection (6-8 PM)
  const eveningHour = getRandomInt(18, 19);
  const eveningMinute = getRandomInt(0, 59);
  const eveningTime = new Date(today);
  eveningTime.setHours(eveningHour, eveningMinute);
  timestamps.push({ type: 'evening', time: Timestamp.fromDate(eveningTime) });
  
  return timestamps;
}

// Main seeding function
async function seedBotUsers() {
  console.log('🚀 Starting bot user generation for Agency Max Plus...');
  console.log('📍 Location: Washington State');
  console.log('🕐 Activity Hours: 8 AM - 8 PM');
  
  const users = [];
  const teams = [];
  
  // Create teams first
  console.log('\n📋 Creating 10 teams...');
  for (let i = 0; i < 10; i++) {
    const teamData = {
      name: TEAM_NAMES[i],
      description: `Elite ${TEAM_NAMES[i]} - Achieving excellence together in Washington`,
      banner: TEAM_BANNERS[i],
      memberCount: 5,
      totalPoints: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      averageLevel: 0,
      location: 'Washington',
      createdAt: serverTimestamp(),
      isActive: true
    };
    
    try {
      const teamRef = await addDoc(collection(db, 'teams'), teamData);
      teams.push({ id: teamRef.id, ...teamData });
      console.log(`✅ Created team: ${teamData.name}`);
    } catch (error) {
      console.error(`❌ Error creating team ${teamData.name}:`, error.message);
    }
  }
  
  // Assign roles (10 leaders, 10 co-leaders, 10 seniors, 20 members)
  const roles = [];
  for (let i = 0; i < 10; i++) roles.push('leader');
  for (let i = 0; i < 10; i++) roles.push('co-leader');
  for (let i = 0; i < 10; i++) roles.push('senior');
  for (let i = 0; i < 20; i++) roles.push('member');
  
  // Track used names to avoid duplicates
  const usedNames = new Set();
  
  // Create 50 users
  console.log('\n👥 Creating 50 bot users...');
  for (let i = 0; i < 50; i++) {
    let firstName, lastName, fullName;
    
    // Ensure unique names
    do {
      firstName = getRandomElement(FIRST_NAMES);
      lastName = getRandomElement(LAST_NAMES);
      fullName = `${firstName} ${lastName}`;
    } while (usedNames.has(fullName));
    
    usedNames.add(fullName);
    
    const email = generateEmail(firstName, lastName, i + 1);
    const password = 'BotUser123!@#';
    const role = roles[i];
    const teamIndex = Math.floor(i / 5);
    const team = teams[teamIndex];
    
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Select avatar (cycle through 6 available)
      const avatarIndex = (i % 6) + 1;
      
      // Select 3 random unique badges
      const allBadges = ['star', 'trophy', 'shield'];
      const userBadges = [];
      for (let j = 0; j < 3; j++) {
        userBadges.push(`/images/badges/${allBadges[j]}.svg`);
      }
      
      // Create user profile
      const userData = {
        uid: uid,
        email: email,
        name: fullName,
        role: role,
        isLeader: role === 'leader',
        teamId: team.id,
        teamName: team.name,
        avatar: `/images/avatars/agent-0${avatarIndex}.svg`,
        banner: `/images/ui/${getRandomElement(['ribbon', 'frame-9slice', 'scallop'])}.svg`,
        badges: userBadges,
        phone: generatePhoneNumber(),
        city: getRandomElement(WASHINGTON_CITIES),
        state: 'WA',
        zipCode: getRandomElement(WASHINGTON_ZIPS),
        joinDate: serverTimestamp(),
        lastActive: serverTimestamp(),
        isBot: true,
        isActive: true,
        passwordNeedsUpdate: false,
        ...generateUserStats(role)
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', uid), userData);
      users.push({ uid, ...userData });
      
      console.log(`✅ User ${i + 1}/50: ${userData.name} (${role} - ${team.name})`);
      
      // Generate today's activities
      const timestamps = generateTodayTimestamps();
      
      // Create morning intention
      const morningTimestamp = timestamps.find(t => t.type === 'morning');
      const morningIntention = {
        userId: uid,
        userName: userData.name,
        teamId: team.id,
        type: 'morning',
        intention: getRandomElement(MORNING_INTENTIONS),
        goals: [
          `Connect with ${getRandomInt(5, 15)} potential clients`,
          `Complete ${getRandomInt(3, 8)} follow-up calls`,
          `Learn about new product features`
        ],
        gratitude: `Grateful for my ${team.name} team and the opportunities ahead`,
        timestamp: morningTimestamp.time,
        completed: true,
        points: getRandomInt(10, 50)
      };
      
      await addDoc(collection(db, 'intentions'), morningIntention);
      
      // Create evening reflection  
      const eveningTimestamp = timestamps.find(t => t.type === 'evening');
      const eveningReflection = {
        userId: uid,
        userName: userData.name,
        teamId: team.id,
        type: 'evening',
        reflection: getRandomElement(EVENING_REFLECTIONS),
        wins: [
          `Helped ${getRandomInt(3, 10)} customers today`,
          `Exceeded daily target by ${getRandomInt(10, 40)}%`,
          `Great collaboration with team members`
        ],
        learnings: 'Every interaction is an opportunity to make a positive impact',
        tomorrowFocus: 'Build on today\'s momentum and help more clients',
        timestamp: eveningTimestamp.time,
        completed: true,
        points: getRandomInt(10, 50)
      };
      
      await addDoc(collection(db, 'intentions'), eveningReflection);
      
      // Create sales records for the day
      const salesCount = getRandomInt(2, 5);
      const activityTimes = timestamps.filter(t => t.type === 'activity');
      
      for (let j = 0; j < salesCount && j < activityTimes.length; j++) {
        const products = {
          home: getRandomInt(0, 1),
          car: getRandomInt(0, 2),
          life: getRandomInt(0, 1),
          renters: getRandomInt(0, 1)
        };
        
        const commission = 
          products.home * 50 + 
          products.car * 50 + 
          products.life * 50 + 
          products.renters * 20;
        
        const saleData = {
          userId: uid,
          userName: userData.name,
          teamId: team.id,
          clientFirstName: getRandomElement(FIRST_NAMES),
          products: products,
          productsSummary: Object.entries(products)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => `${count} ${type}`)
            .join(', '),
          totalItems: Object.values(products).reduce((a, b) => a + b, 0),
          totalCommission: commission,
          totalRevenue: commission * 10,
          timestamp: activityTimes[j].time,
          month: new Date().toISOString().slice(0, 7),
          date: new Date().toISOString().split('T')[0]
        };
        
        if (saleData.totalItems > 0) {
          await addDoc(collection(db, 'sales'), saleData);
        }
      }
      
      // Create general activities
      const activityTypes = [
        { type: 'call', description: 'Client consultation call' },
        { type: 'email', description: 'Follow-up email sent' },
        { type: 'meeting', description: 'Strategy meeting completed' },
        { type: 'training', description: 'Product training session' },
        { type: 'follow-up', description: 'Customer check-in completed' }
      ];
      
      for (let k = 0; k < Math.min(3, activityTimes.length); k++) {
        const activityType = getRandomElement(activityTypes);
        const activity = {
          userId: uid,
          userName: userData.name,
          teamId: team.id,
          type: activityType.type,
          description: activityType.description,
          points: getRandomInt(5, 25),
          timestamp: activityTimes[k].time,
          completed: true
        };
        
        await addDoc(collection(db, 'activities'), activity);
      }
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User ${i + 1}: Email already exists, skipping...`);
      } else {
        console.error(`❌ Error creating user ${i + 1}:`, error.message);
      }
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Update team statistics
  console.log('\n📊 Calculating team statistics...');
  for (const team of teams) {
    const teamUsers = users.filter(u => u.teamId === team.id);
    const totalPoints = teamUsers.reduce((sum, u) => sum + (u.points || 0), 0);
    const weeklyPoints = teamUsers.reduce((sum, u) => sum + (u.weeklyPoints || 0), 0);
    const monthlyPoints = teamUsers.reduce((sum, u) => sum + (u.monthlyPoints || 0), 0);
    const averageLevel = Math.floor(teamUsers.reduce((sum, u) => sum + (u.level || 0), 0) / teamUsers.length);
    
    await setDoc(doc(db, 'teams', team.id), {
      totalPoints,
      weeklyPoints,
      monthlyPoints,
      averageLevel,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
    console.log(`✅ ${team.name}: ${totalPoints.toLocaleString()} points | Avg Level: ${averageLevel}`);
  }
  
  console.log('\n🎉 Bot user generation complete!');
  console.log('\n📈 Final Summary:');
  console.log(`✅ Users created: ${users.length}`);
  console.log(`✅ Teams created: ${teams.length}`);
  console.log(`✅ Leaders: 10`);
  console.log(`✅ Co-leaders: 10`);
  console.log(`✅ Seniors: 10`);
  console.log(`✅ Members: 20`);
  console.log('\n🌟 All users are active 8 AM - 8 PM PST');
  console.log('📍 All users are from Washington State');
  console.log('🎯 Morning intentions and evening reflections created');
  console.log('💼 Sales and activity data populated');
  console.log('🏆 Leaderboard ready with diverse stats');
  
  return { users, teams };
}

// Run the seeder
console.log('═'.repeat(60));
console.log('AGENCY MAX PLUS BOT USER SEEDER');
console.log('═'.repeat(60));

seedBotUsers()
  .then(result => {
    console.log('\n✨ Seeding completed successfully!');
    console.log('═'.repeat(60));
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Seeding failed:', error);
    console.log('═'.repeat(60));
    process.exit(1);
  });