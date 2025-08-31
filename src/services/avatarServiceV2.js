/**
 * Avatar Service V2 - Bulletproof Avatar System
 * 
 * Features:
 * - Multiple API sources with fallbacks
 * - Local avatar gallery
 * - Caching system
 * - Retry mechanisms
 * - Error handling
 * - Preview functionality
 * 
 * Fallback Order:
 * 1. DiceBear API (if available)
 * 2. UI Avatars API
 * 3. RoboHash API
 * 4. Local avatar files
 * 5. Generated initials
 */

// Avatar API configurations
const AVATAR_APIS = {
  dicebear: {
    name: 'DiceBear',
    baseUrl: 'https://api.dicebear.com/7.x',
    styles: ['avataaars', 'bottts', 'identicon', 'initials', 'lorelei', 'micah', 'personas', 'pixel-art'],
    testUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    buildUrl: (style, seed, size = 200) => 
      `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=${size}`,
    corsProxy: false
  },
  uiAvatars: {
    name: 'UI Avatars',
    baseUrl: 'https://ui-avatars.com/api',
    testUrl: 'https://ui-avatars.com/api/?name=Test&size=200',
    buildUrl: (name, options = {}) => {
      const params = new URLSearchParams({
        name: name || 'User',
        size: options.size || 200,
        background: options.background || '0D8ABC',
        color: options.color || 'fff',
        bold: options.bold || true,
        format: 'svg'
      })
      return `https://ui-avatars.com/api/?${params.toString()}`
    },
    corsProxy: false
  },
  robohash: {
    name: 'RoboHash',
    baseUrl: 'https://robohash.org',
    testUrl: 'https://robohash.org/test.png?size=200x200',
    buildUrl: (seed, options = {}) => {
      const set = options.set || 'set1' // set1=robots, set2=monsters, set3=heads
      const size = options.size || 200
      return `https://robohash.org/${seed}.png?size=${size}x${size}&set=${set}`
    },
    corsProxy: false
  },
  gravatar: {
    name: 'Gravatar',
    baseUrl: 'https://www.gravatar.com/avatar',
    buildUrl: (email, size = 200) => {
      const hash = email ? MD5(email.toLowerCase().trim()) : 'default'
      return `https://www.gravatar.com/avatar/${hash}?d=retro&s=${size}`
    },
    corsProxy: false
  }
}

// Local avatar files
const LOCAL_AVATARS = [
  { id: 'agent-01', name: 'Agent 1', path: '/images/avatars/agent-01.svg', type: 'local' },
  { id: 'agent-02', name: 'Agent 2', path: '/images/avatars/agent-02.svg', type: 'local' },
  { id: 'agent-03', name: 'Agent 3', path: '/images/avatars/agent-03.svg', type: 'local' },
  { id: 'agent-04', name: 'Agent 4', path: '/images/avatars/agent-04.svg', type: 'local' },
  { id: 'agent-05', name: 'Agent 5', path: '/images/avatars/agent-05.svg', type: 'local' },
  { id: 'agent-06', name: 'Agent 6', path: '/images/avatars/agent-06.svg', type: 'local' },
  // Placeholder avatars
  { id: 'default-male', name: 'Default Male', path: '/images/avatars/default-male.svg', type: 'local' },
  { id: 'default-female', name: 'Default Female', path: '/images/avatars/default-female.svg', type: 'local' },
  { id: 'default-neutral', name: 'Default Neutral', path: '/images/avatars/default-neutral.svg', type: 'local' },
]

// Preset color themes for avatars
const COLOR_THEMES = {
  professional: ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669'],
  warm: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#ec4899'],
  cool: ['#3b82f6', '#06b6d4', '#10b981', '#14b8a6', '#8b5cf6'],
  neutral: ['#6b7280', '#64748b', '#71717a', '#78716c', '#57534e'],
  pastel: ['#fbbf24', '#60a5fa', '#34d399', '#f87171', '#c084fc'],
}

// Cache for avatar URLs and availability
const avatarCache = new Map()
const apiStatusCache = new Map()

/**
 * Simple MD5 hash function for Gravatar
 */
function MD5(string) {
  // Simple hash function for demo - in production use crypto library
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0')
}

/**
 * Test if an API is accessible
 */
async function testAPI(apiConfig) {
  const cacheKey = `api_status_${apiConfig.name}`
  
  // Check cache first (5 minute TTL)
  if (apiStatusCache.has(cacheKey)) {
    const cached = apiStatusCache.get(cacheKey)
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.status
    }
  }

  try {
    if (!apiConfig.testUrl) return true
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(apiConfig.testUrl, {
      method: 'HEAD',
      mode: 'no-cors', // Bypass CORS for testing
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    // For no-cors mode, we can't read the response, so we assume success if no error
    const status = true
    apiStatusCache.set(cacheKey, { status, timestamp: Date.now() })
    return status
  } catch (error) {
    console.warn(`API ${apiConfig.name} test failed:`, error.message)
    const status = false
    apiStatusCache.set(cacheKey, { status, timestamp: Date.now() })
    return status
  }
}

/**
 * Generate avatar URL with fallbacks
 */
export async function generateAvatarUrl(options = {}) {
  const {
    type = 'auto', // 'auto', 'dicebear', 'uiAvatars', 'robohash', 'local', 'initials'
    seed = Math.random().toString(36).substring(7),
    name = 'User',
    size = 200,
    style = 'avataaars',
    background = '0D8ABC',
    color = 'fff',
    useCache = true
  } = options

  // Check cache
  const cacheKey = `${type}_${seed}_${name}_${size}_${style}`
  if (useCache && avatarCache.has(cacheKey)) {
    return avatarCache.get(cacheKey)
  }

  let avatarUrl = null

  // Try specified type or auto-detect
  if (type === 'auto') {
    // Try APIs in order of preference
    if (await testAPI(AVATAR_APIS.dicebear)) {
      avatarUrl = AVATAR_APIS.dicebear.buildUrl(style, seed, size)
    } else if (await testAPI(AVATAR_APIS.uiAvatars)) {
      avatarUrl = AVATAR_APIS.uiAvatars.buildUrl(name, { size, background, color })
    } else if (await testAPI(AVATAR_APIS.robohash)) {
      avatarUrl = AVATAR_APIS.robohash.buildUrl(seed, { size })
    } else {
      // Fallback to initials
      avatarUrl = generateInitialsDataUrl(name, { size, background, color })
    }
  } else if (type === 'dicebear') {
    avatarUrl = AVATAR_APIS.dicebear.buildUrl(style, seed, size)
  } else if (type === 'uiAvatars') {
    avatarUrl = AVATAR_APIS.uiAvatars.buildUrl(name, { size, background, color })
  } else if (type === 'robohash') {
    avatarUrl = AVATAR_APIS.robohash.buildUrl(seed, { size })
  } else if (type === 'local') {
    const localAvatar = LOCAL_AVATARS.find(a => a.id === seed)
    avatarUrl = localAvatar ? localAvatar.path : LOCAL_AVATARS[0].path
  } else if (type === 'initials') {
    avatarUrl = generateInitialsDataUrl(name, { size, background, color })
  }

  // Cache the result
  if (useCache && avatarUrl) {
    avatarCache.set(cacheKey, avatarUrl)
  }

  return avatarUrl
}

/**
 * Generate initials avatar as data URL (works offline)
 */
export function generateInitialsDataUrl(name = 'User', options = {}) {
  const {
    size = 200,
    background = '#0D8ABC',
    color = '#ffffff',
    fontSize = size * 0.4,
    fontFamily = 'Arial, sans-serif'
  } = options

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${background}"/>
      <text x="50%" y="50%" dy=".1em" fill="${color}" 
            font-family="${fontFamily}" font-size="${fontSize}" font-weight="600" 
            text-anchor="middle" dominant-baseline="middle">
        ${initials}
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Generate multiple avatar options for selection
 */
export async function generateAvatarOptions(userName = 'User', count = 20) {
  const options = []
  const timestamp = Date.now()

  // Add local avatars first (always available)
  LOCAL_AVATARS.slice(0, 6).forEach((avatar, index) => {
    options.push({
      id: `local_${avatar.id}`,
      type: 'local',
      url: avatar.path,
      name: avatar.name,
      source: 'Local File',
      available: true
    })
  })

  // Try DiceBear styles
  if (await testAPI(AVATAR_APIS.dicebear)) {
    const dicebearStyles = ['avataaars', 'bottts', 'identicon', 'lorelei', 'micah', 'personas']
    for (let i = 0; i < Math.min(6, dicebearStyles.length); i++) {
      const style = dicebearStyles[i]
      const seed = `${userName}_${timestamp}_${i}`
      options.push({
        id: `dicebear_${style}_${i}`,
        type: 'dicebear',
        url: AVATAR_APIS.dicebear.buildUrl(style, seed, 200),
        name: `DiceBear ${style}`,
        source: 'DiceBear API',
        style: style,
        seed: seed,
        available: true
      })
    }
  }

  // Try UI Avatars with different backgrounds
  if (await testAPI(AVATAR_APIS.uiAvatars)) {
    const backgrounds = ['0D8ABC', '7C3AED', '10B981', 'F59E0B', 'EF4444']
    for (let i = 0; i < Math.min(4, backgrounds.length); i++) {
      options.push({
        id: `uiavatars_${i}`,
        type: 'uiAvatars',
        url: AVATAR_APIS.uiAvatars.buildUrl(userName, { 
          background: backgrounds[i],
          size: 200 
        }),
        name: `Initials Style ${i + 1}`,
        source: 'UI Avatars API',
        background: backgrounds[i],
        available: true
      })
    }
  }

  // Try RoboHash with different sets
  if (await testAPI(AVATAR_APIS.robohash)) {
    const sets = ['set1', 'set2', 'set3', 'set4']
    const setNames = ['Robot', 'Monster', 'Head', 'Cat']
    for (let i = 0; i < Math.min(4, sets.length); i++) {
      const seed = `${userName}_${timestamp}_${i}`
      options.push({
        id: `robohash_${i}`,
        type: 'robohash',
        url: AVATAR_APIS.robohash.buildUrl(seed, { set: sets[i], size: 200 }),
        name: `${setNames[i]} Avatar`,
        source: 'RoboHash API',
        set: sets[i],
        seed: seed,
        available: true
      })
    }
  }

  // Always add initials fallbacks
  const fallbackColors = ['#4f46e5', '#059669', '#dc2626', '#f59e0b']
  fallbackColors.forEach((bg, i) => {
    options.push({
      id: `initials_${i}`,
      type: 'initials',
      url: generateInitialsDataUrl(userName, { background: bg, size: 200 }),
      name: `Initials ${i + 1}`,
      source: 'Generated',
      background: bg,
      available: true
    })
  })

  return options
}

/**
 * Validate and load avatar with retry mechanism
 */
export async function loadAvatarWithRetry(url, maxRetries = 3, retryDelay = 1000) {
  let lastError = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Create image element to test loading
      const img = new Image()
      
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(url)
        img.onerror = () => reject(new Error(`Failed to load avatar from ${url}`))
        
        // Set timeout for loading
        setTimeout(() => reject(new Error('Avatar load timeout')), 5000)
      })

      img.src = url
      return await loadPromise
    } catch (error) {
      lastError = error
      console.warn(`Avatar load attempt ${attempt + 1} failed:`, error.message)
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw lastError || new Error('Failed to load avatar after retries')
}

/**
 * Get cached avatar or generate new one
 */
export async function getAvatar(userId, userName = 'User', preferredType = 'auto') {
  const cacheKey = `user_avatar_${userId}`
  
  // Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const data = JSON.parse(cached)
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) { // 24 hour cache
        return data.url
      }
    }
  } catch (error) {
    console.warn('Cache read error:', error)
  }

  // Generate new avatar
  const url = await generateAvatarUrl({
    type: preferredType,
    seed: userId,
    name: userName
  })

  // Cache the result
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      url,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.warn('Cache write error:', error)
  }

  return url
}

/**
 * Clear avatar cache
 */
export function clearAvatarCache() {
  avatarCache.clear()
  apiStatusCache.clear()
  
  // Clear localStorage cache
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('user_avatar_')) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * Get API status report
 */
export async function getAvatarSystemStatus() {
  const status = {
    apis: {},
    localAvatars: LOCAL_AVATARS.length,
    cacheSize: avatarCache.size,
    timestamp: Date.now()
  }

  for (const [key, api] of Object.entries(AVATAR_APIS)) {
    if (api.testUrl) {
      status.apis[key] = {
        name: api.name,
        available: await testAPI(api),
        url: api.baseUrl
      }
    }
  }

  return status
}

// Export constants only (functions are already exported inline)
export {
  LOCAL_AVATARS,
  COLOR_THEMES,
  AVATAR_APIS
}