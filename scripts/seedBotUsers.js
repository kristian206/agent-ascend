import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
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

// Name pools
const FIRST_NAMES = [
  'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Thomas',
  'Christopher', 'Daniel', 'Matthew', 'Donald', 'Anthony', 'Paul', 'Mark',
  'George', 'Steven', 'Kenneth', 'Andrew', 'Joshua', 'Kevin', 'Brian',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
  'Jessica', 'Sarah', 'Karen', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna',
  'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly',
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
  'Celebrate small wins throughout the day'
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
  'Ready to make tomorrow even better'
];

// Badge types
const BADGE_TYPES = [
  'star', 'trophy', 'shield', 'star', 'trophy', 'shield'
];

// Avatar indices
const AVATAR_COUNT = 6;

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName, lastName) {
  const num = getRandomInt(1, 999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@agentascend.demo`;
}

function generatePhoneNumber() {
  const areaCode = getRandomElement(['206', '253', '425', '360', '509']);
  return `${areaCode}-${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`;
}

// Generate random stats
function generateUserStats(role) {
  const baseMultiplier = role === 'leader' ? 1.5 : 
                        role === 'co-leader' ? 1.3 : 
                        role === 'senior' ? 1.2 : 1;
  
  return {
    totalSales: Math.floor(getRandomInt(50, 500) * baseMultiplier),
    totalRevenue: Math.floor(getRandomInt(50000, 500000) * baseMultiplier),
    totalCommission: Math.floor(getRandomInt(5000, 50000) * baseMultiplier),
    monthlyGoal: getRandomInt(10, 100),
    monthlyProgress: getRandomInt(20, 120),
    streak: getRandomInt(1, 365),
    level: Math.floor(getRandomInt(1, 50) * baseMultiplier),
    xp: Math.floor(getRandomInt(100, 50000) * baseMultiplier),
    points: Math.floor(getRandomInt(100, 10000) * baseMultiplier),
    todayPoints: getRandomInt(0, 500),
    weeklyPoints: getRandomInt(500, 5000),
    monthlyPoints: getRandomInt(2000, 20000),
    leadsConverted: Math.floor(getRandomInt(10, 200) * baseMultiplier),
    conversionRate: getRandomInt(15, 85),
    avgDealSize: getRandomInt(500, 5000),
    customerSatisfaction: getRandomInt(80, 100),
    callsToday: getRandomInt(5, 50),
    emailsToday: getRandomInt(10, 100),
    meetingsToday: getRandomInt(1, 10)
  };
}

// Generate activity timestamps for today
function generateTodayTimestamps() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timestamps = [];
  
  // Morning intention (8-10 AM)
  const morningHour = getRandomInt(8, 10);
  const morningMinute = getRandomInt(0, 59);
  const morningTime = new Date(today);
  morningTime.setHours(morningHour, morningMinute);
  timestamps.push({ type: 'morning', time: Timestamp.fromDate(morningTime) });
  
  // Activities throughout the day (10 AM - 6 PM)
  const activityCount = getRandomInt(3, 8);
  for (let i = 0; i < activityCount; i++) {
    const hour = getRandomInt(10, 18);
    const minute = getRandomInt(0, 59);
    const activityTime = new Date(today);
    activityTime.setHours(hour, minute);
    timestamps.push({ type: 'activity', time: Timestamp.fromDate(activityTime) });
  }
  
  // Evening reflection (6-8 PM)
  const eveningHour = getRandomInt(18, 20);
  const eveningMinute = getRandomInt(0, 59);
  const eveningTime = new Date(today);
  eveningTime.setHours(eveningHour, eveningMinute);
  timestamps.push({ type: 'evening', time: Timestamp.fromDate(eveningTime) });
  
  return timestamps;
}

// Main seeding function
async function seedBotUsers() {
  console.log('🚀 Starting bot user generation...');
  
  const users = [];
  const teams = [];
  
  // Create teams first
  console.log('\n📋 Creating teams...');
  for (let i = 0; i < 10; i++) {
    const teamData = {
      name: TEAM_NAMES[i],
      description: `Elite ${TEAM_NAMES[i]} - Achieving excellence together`,
      banner: `/images/ui/ribbon.svg`,
      memberCount: 5,
      totalPoints: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      createdAt: serverTimestamp(),
      isActive: true
    };
    
    const teamRef = await addDoc(collection(db, 'teams'), teamData);
    teams.push({ id: teamRef.id, ...teamData });
    console.log(`✅ Created team: ${teamData.name}`);
  }
  
  // Assign roles
  const roles = [];
  for (let i = 0; i < 10; i++) roles.push('leader');
  for (let i = 0; i < 10; i++) roles.push('co-leader');
  for (let i = 0; i < 10; i++) roles.push('senior');
  for (let i = 0; i < 20; i++) roles.push('member');
  
  // Create 50 users
  console.log('\n👥 Creating bot users...');
  for (let i = 0; i < 50; i++) {
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const email = generateEmail(firstName, lastName);
    const password = 'BotUser123!@#';
    const role = roles[i];
    const teamIndex = Math.floor(i / 5);
    const team = teams[teamIndex];
    
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Create user profile
      const userData = {
        uid: uid,
        email: email,
        name: `${firstName} ${lastName}`,
        role: role,
        teamId: team.id,
        teamName: team.name,
        avatar: `/images/avatars/agent-0${(i % AVATAR_COUNT) + 1}.svg`,
        banner: `/images/ui/frame-9slice.svg`,
        badges: [
          `/images/badges/${BADGE_TYPES[i % 3]}.svg`,
          `/images/badges/${BADGE_TYPES[(i + 1) % 3]}.svg`,
          `/images/badges/${BADGE_TYPES[(i + 2) % 3]}.svg`
        ],
        phone: generatePhoneNumber(),
        city: getRandomElement(WASHINGTON_CITIES),
        state: 'WA',
        zipCode: getRandomElement(WASHINGTON_ZIPS),
        joinDate: serverTimestamp(),
        lastActive: serverTimestamp(),
        isBot: true,
        ...generateUserStats(role)
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', uid), userData);
      users.push({ uid, ...userData });
      
      console.log(`✅ Created user ${i + 1}/50: ${userData.name} (${role} - ${team.name})`);
      
      // Create morning intention
      const timestamps = generateTodayTimestamps();
      const morningTimestamp = timestamps.find(t => t.type === 'morning');
      
      const morningIntention = {
        userId: uid,
        userName: userData.name,
        teamId: team.id,
        type: 'morning',
        intention: getRandomElement(MORNING_INTENTIONS),
        goals: [
          `Connect with ${getRandomInt(5, 15)} clients`,
          `Complete ${getRandomInt(3, 8)} follow-ups`,
          `Learn one new product feature`
        ],
        gratitude: 'Grateful for my team and the opportunities ahead',
        timestamp: morningTimestamp.time,
        completed: true
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
          `Closed ${getRandomInt(1, 5)} deals`,
          `Helped ${getRandomInt(2, 8)} customers`,
          `Exceeded daily goal by ${getRandomInt(10, 50)}%`
        ],
        learnings: 'Every interaction is a chance to make a difference',
        tomorrowFocus: 'Build on today\'s momentum',
        timestamp: eveningTimestamp.time,
        completed: true
      };
      
      await addDoc(collection(db, 'intentions'), eveningReflection);
      
      // Create some sales records
      const salesCount = getRandomInt(1, 5);
      for (let j = 0; j < salesCount; j++) {
        const activityTime = timestamps.filter(t => t.type === 'activity')[j];
        if (!activityTime) continue;
        
        const saleData = {
          userId: uid,
          userName: userData.name,
          teamId: team.id,
          clientFirstName: getRandomElement(FIRST_NAMES),
          products: {
            home: getRandomInt(0, 2),
            car: getRandomInt(0, 2),
            life: getRandomInt(0, 1)
          },
          totalCommission: getRandomInt(50, 500),
          totalRevenue: getRandomInt(500, 5000),
          timestamp: activityTime.time,
          month: new Date().toISOString().slice(0, 7),
          date: new Date().toISOString().split('T')[0]
        };
        
        await addDoc(collection(db, 'sales'), saleData);
      }
      
      // Create some activities
      const activityTypes = ['call', 'email', 'meeting', 'follow-up', 'training'];
      const activityTimes = timestamps.filter(t => t.type === 'activity');
      
      for (const activityTime of activityTimes) {
        const activity = {
          userId: uid,
          userName: userData.name,
          teamId: team.id,
          type: getRandomElement(activityTypes),
          description: `Completed ${getRandomElement(activityTypes)} activity`,
          points: getRandomInt(10, 100),
          timestamp: activityTime.time
        };
        
        await addDoc(collection(db, 'activities'), activity);
      }
      
    } catch (error) {
      console.error(`❌ Error creating user ${i + 1}:`, error.message);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Update team stats
  console.log('\n📊 Updating team statistics...');
  for (const team of teams) {
    const teamUsers = users.filter(u => u.teamId === team.id);
    const totalPoints = teamUsers.reduce((sum, u) => sum + (u.points || 0), 0);
    const weeklyPoints = teamUsers.reduce((sum, u) => sum + (u.weeklyPoints || 0), 0);
    const monthlyPoints = teamUsers.reduce((sum, u) => sum + (u.monthlyPoints || 0), 0);
    
    await setDoc(doc(db, 'teams', team.id), {
      totalPoints,
      weeklyPoints,
      monthlyPoints
    }, { merge: true });
    
    console.log(`✅ Updated ${team.name}: ${totalPoints} total points`);
  }
  
  console.log('\n🎉 Bot user generation complete!');
  console.log(`Created ${users.length} users across ${teams.length} teams`);
  
  return { users, teams };
}

// Run the seeder
seedBotUsers()
  .then(result => {
    console.log('\n📈 Summary:');
    console.log(`- Users created: ${result.users.length}`);
    console.log(`- Teams created: ${result.teams.length}`);
    console.log(`- Leaders: 10`);
    console.log(`- Co-leaders: 10`);
    console.log(`- Seniors: 10`);
    console.log(`- Members: 20`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });