// DiceBear Avatar Service
// Provides free avatar generation using DiceBear API

const DICEBEAR_BASE_URL = 'https://api.dicebear.com/7.x'

// Available avatar styles with descriptions
export const AVATAR_STYLES = [
  { id: 'adventurer', name: 'Adventurer', description: 'Playful cartoon style' },
  { id: 'adventurer-neutral', name: 'Adventurer Neutral', description: 'Neutral expressions' },
  { id: 'avataaars', name: 'Avataaars', description: 'Classic avatar style' },
  { id: 'avataaars-neutral', name: 'Avataaars Neutral', description: 'Neutral avatar style' },
  { id: 'big-ears', name: 'Big Ears', description: 'Cute big-eared characters' },
  { id: 'big-ears-neutral', name: 'Big Ears Neutral', description: 'Neutral big-eared style' },
  { id: 'big-smile', name: 'Big Smile', description: 'Happy smiling avatars' },
  { id: 'bottts', name: 'Bottts', description: 'Robot avatars' },
  { id: 'bottts-neutral', name: 'Bottts Neutral', description: 'Neutral robot style' },
  { id: 'croodles', name: 'Croodles', description: 'Doodle-style avatars' },
  { id: 'croodles-neutral', name: 'Croodles Neutral', description: 'Neutral doodles' },
  { id: 'fun-emoji', name: 'Fun Emoji', description: 'Emoji-style faces' },
  { id: 'icons', name: 'Icons', description: 'Icon-based avatars' },
  { id: 'identicon', name: 'Identicon', description: 'Geometric patterns' },
  { id: 'initials', name: 'Initials', description: 'Text-based avatars' },
  { id: 'lorelei', name: 'Lorelei', description: 'Artistic portraits' },
  { id: 'lorelei-neutral', name: 'Lorelei Neutral', description: 'Neutral portraits' },
  { id: 'micah', name: 'Micah', description: 'Modern illustration style' },
  { id: 'miniavs', name: 'Miniavs', description: 'Minimalist avatars' },
  { id: 'notionists', name: 'Notionists', description: 'Notion-style avatars' },
  { id: 'notionists-neutral', name: 'Notionists Neutral', description: 'Neutral Notion style' },
  { id: 'open-peeps', name: 'Open Peeps', description: 'Hand-drawn people' },
  { id: 'personas', name: 'Personas', description: 'Persona illustrations' },
  { id: 'pixel-art', name: 'Pixel Art', description: '8-bit style avatars' },
  { id: 'pixel-art-neutral', name: 'Pixel Art Neutral', description: 'Neutral pixel art' },
  { id: 'rings', name: 'Rings', description: 'Abstract ring patterns' },
  { id: 'shapes', name: 'Shapes', description: 'Geometric shapes' },
  { id: 'thumbs', name: 'Thumbs', description: 'Thumbs up style' },
]

// Color themes for avatars
export const AVATAR_THEMES = {
  professional: ['4f46e5', '7c3aed', '2563eb', '0891b2', '059669'],
  warm: ['ef4444', 'f97316', 'f59e0b', 'eab308', 'ec4899'],
  cool: ['3b82f6', '06b6d4', '10b981', '14b8a6', '8b5cf6'],
  neutral: ['6b7280', '64748b', '71717a', '78716c', '57534e'],
  pastel: ['fbbf24', '60a5fa', '34d399', 'f87171', 'c084fc'],
}

/**
 * Generate avatar URL with DiceBear API
 * @param {string} style - Avatar style (e.g., 'avataaars', 'bottts')
 * @param {string} seed - Unique seed for consistent avatar generation
 * @param {Object} options - Additional options (size, backgroundColor, etc.)
 * @returns {string} Avatar URL
 */
export function generateAvatarUrl(style, seed, options = {}) {
  const {
    size = 200,
    backgroundColor = 'transparent',
    backgroundType = 'solid',
    radius = 0,
  } = options

  // Build query parameters
  const params = new URLSearchParams({
    seed: seed || Math.random().toString(36).substring(7),
    size: size,
    backgroundColor: backgroundColor,
    backgroundType: backgroundType,
  })

  if (radius > 0) {
    params.append('radius', radius)
  }

  return `${DICEBEAR_BASE_URL}/${style}/svg?${params.toString()}`
}

/**
 * Generate multiple avatar options for a user to choose from
 * @param {string} userName - User's name to use as base seed
 * @param {string} style - Avatar style
 * @param {number} count - Number of variations to generate
 * @returns {Array} Array of avatar URLs
 */
export function generateAvatarVariations(userName, style, count = 6) {
  const variations = []
  const baseSeed = userName || 'user'
  
  for (let i = 0; i < count; i++) {
    const seed = `${baseSeed}-${i}-${Date.now()}`
    variations.push({
      id: `${style}-${i}`,
      url: generateAvatarUrl(style, seed),
      seed: seed,
      style: style,
    })
  }
  
  return variations
}

/**
 * Generate a random avatar
 * @param {Object} options - Generation options
 * @returns {Object} Avatar data with URL and metadata
 */
export function generateRandomAvatar(options = {}) {
  const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)]
  const randomSeed = Math.random().toString(36).substring(7)
  
  return {
    style: randomStyle.id,
    seed: randomSeed,
    url: generateAvatarUrl(randomStyle.id, randomSeed, options),
    name: randomStyle.name,
  }
}

/**
 * Generate avatar from user initials (fallback option)
 * @param {string} name - User's name
 * @param {Object} options - Style options
 * @returns {string} Avatar URL
 */
export function generateInitialsAvatar(name, options = {}) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  return generateAvatarUrl('initials', initials, {
    ...options,
    backgroundColor: options.backgroundColor || AVATAR_THEMES.professional[0],
  })
}

/**
 * Get avatar URL for a specific seed and style
 * Useful for regenerating the same avatar
 * @param {string} avatarData - Stored avatar data (style:seed format)
 * @param {Object} options - Display options
 * @returns {string} Avatar URL
 */
export function getStoredAvatar(avatarData, options = {}) {
  if (!avatarData || !avatarData.includes(':')) {
    return null
  }
  
  const [style, seed] = avatarData.split(':')
  return generateAvatarUrl(style, seed, options)
}

/**
 * Format avatar data for storage
 * @param {string} style - Avatar style
 * @param {string} seed - Avatar seed
 * @returns {string} Formatted string for database storage
 */
export function formatAvatarData(style, seed) {
  return `${style}:${seed}`
}

/**
 * Parse stored avatar data
 * @param {string} avatarData - Stored avatar data
 * @returns {Object} Parsed avatar data
 */
export function parseAvatarData(avatarData) {
  if (!avatarData || !avatarData.includes(':')) {
    return null
  }
  
  const [style, seed] = avatarData.split(':')
  return {
    style,
    seed,
    url: generateAvatarUrl(style, seed),
  }
}

// Pre-generate some avatar combinations for quick selection
export function getPresetAvatars() {
  const presets = []
  const popularStyles = ['avataaars', 'bottts', 'big-smile', 'lorelei', 'micah', 'personas']
  
  popularStyles.forEach(style => {
    for (let i = 0; i < 5; i++) {
      const seed = `preset-${style}-${i}`
      presets.push({
        id: `${style}-${i}`,
        style: style,
        seed: seed,
        url: generateAvatarUrl(style, seed),
        name: AVATAR_STYLES.find(s => s.id === style)?.name || style,
      })
    }
  })
  
  return presets
}

export default {
  AVATAR_STYLES,
  AVATAR_THEMES,
  generateAvatarUrl,
  generateAvatarVariations,
  generateRandomAvatar,
  generateInitialsAvatar,
  getStoredAvatar,
  formatAvatarData,
  parseAvatarData,
  getPresetAvatars,
}