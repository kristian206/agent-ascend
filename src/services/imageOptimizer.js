/**
 * Image Optimization Service
 * Handles all image uploads and optimizations for the platform
 */

export const IMAGE_CONFIGS = {
  avatar: {
    sizes: [
      { width: 32, suffix: 'xs' },   // Small UI elements
      { width: 64, suffix: 'sm' },   // List views
      { width: 128, suffix: 'md' },  // Profile cards
      { width: 256, suffix: 'lg' },  // Profile page
    ],
    quality: 85,
    formats: ['webp', 'png']
  },
  banner: {
    sizes: [
      { width: 640, height: 160, suffix: 'sm' },   // Mobile
      { width: 1280, height: 320, suffix: 'md' },  // Tablet
      { width: 1920, height: 480, suffix: 'lg' },  // Desktop
    ],
    quality: 85,
    formats: ['webp', 'jpeg']
  },
  badge: {
    sizes: [
      { width: 32, suffix: 'xs' },
      { width: 64, suffix: 'sm' },
      { width: 128, suffix: 'md' },
    ],
    quality: 90,
    formats: ['webp', 'png']
  },
  achievement: {
    sizes: [
      { width: 64, suffix: 'sm' },
      { width: 128, suffix: 'md' },
      { width: 256, suffix: 'lg' },
    ],
    quality: 90,
    formats: ['webp', 'png']
  }
}

/**
 * Client-side image optimization before upload
 * Compresses and resizes images in the browser
 */
export async function optimizeImageClient(file, type = 'avatar', maxSizeMB = 5) {
  return new Promise((resolve, reject) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'))
      return
    }

    // Check file size
    const sizeMB = file.size / 1024 / 1024
    if (sizeMB > maxSizeMB) {
      reject(new Error(`Image must be less than ${maxSizeMB}MB`))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const config = IMAGE_CONFIGS[type]
        const optimized = []

        // Get the largest size for this type
        const targetSize = config.sizes[config.sizes.length - 1]
        
        // Create canvas for optimization
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Calculate dimensions maintaining aspect ratio
        let { width, height } = calculateDimensions(
          img.width, 
          img.height, 
          targetSize.width, 
          targetSize.height
        )
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            resolve({
              original: file,
              optimized: blob,
              dataUrl: canvas.toDataURL('image/jpeg', config.quality / 100),
              dimensions: { width, height },
              sizeBefore: file.size,
              sizeAfter: blob.size,
              reduction: ((file.size - blob.size) / file.size * 100).toFixed(1)
            })
          },
          'image/jpeg',
          config.quality / 100
        )
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
function calculateDimensions(srcWidth, srcHeight, maxWidth, maxHeight) {
  if (!maxHeight) {
    // Square crop for avatars
    const size = Math.min(srcWidth, srcHeight, maxWidth)
    return { width: size, height: size }
  }
  
  // Maintain aspect ratio for banners
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio)
  }
}

/**
 * Generate optimized image URLs
 */
export function getOptimizedImageUrl(baseUrl, type = 'avatar', size = 'md') {
  if (!baseUrl) return null
  
  // If it's already an optimized URL, return it
  if (baseUrl.includes('-xs') || baseUrl.includes('-sm') || 
      baseUrl.includes('-md') || baseUrl.includes('-lg')) {
    return baseUrl
  }
  
  // Generate optimized URL
  const extension = baseUrl.split('.').pop()
  const baseName = baseUrl.replace(`.${extension}`, '')
  
  // Check if browser supports WebP
  const supportsWebP = typeof window !== 'undefined' && 
    document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
  
  if (supportsWebP) {
    return `${baseName}-${size}.webp`
  }
  
  return `${baseName}-${size}.${extension}`
}

/**
 * Create responsive image srcset
 */
export function createSrcSet(baseUrl, type = 'avatar') {
  const config = IMAGE_CONFIGS[type]
  const srcset = []
  
  config.sizes.forEach(size => {
    const url = getOptimizedImageUrl(baseUrl, type, size.suffix)
    srcset.push(`${url} ${size.width}w`)
  })
  
  return srcset.join(', ')
}

/**
 * Validate image file
 */
export function validateImageFile(file, type = 'avatar') {
  const errors = []
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    errors.push('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
  }
  
  // Check file size
  const maxSizes = {
    avatar: 5,
    banner: 10,
    badge: 2,
    achievement: 3
  }
  
  const maxSizeMB = maxSizes[type] || 5
  const sizeMB = file.size / 1024 / 1024
  
  if (sizeMB > maxSizeMB) {
    errors.push(`Image must be less than ${maxSizeMB}MB (current: ${sizeMB.toFixed(1)}MB)`)
  }
  
  return errors
}

/**
 * Process uploaded image and generate all sizes
 */
export async function processUploadedImage(file, type = 'avatar', userId) {
  try {
    // Validate file
    const errors = validateImageFile(file, type)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }
    
    // Optimize image client-side
    const optimized = await optimizeImageClient(file, type)
    
    // Generate filename
    const timestamp = Date.now()
    const filename = `${userId}_${type}_${timestamp}`
    
    // Return processed data
    return {
      success: true,
      filename,
      optimized,
      metadata: {
        originalSize: file.size,
        optimizedSize: optimized.sizeAfter,
        reduction: optimized.reduction,
        dimensions: optimized.dimensions,
        type: file.type
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Default images for avatars and banners
 */
export const DEFAULT_IMAGES = {
  avatar: '/images/avatars/default-avatar.svg',
  banner: '/images/banners/default-banner.svg',
  badge: '/images/badges/default-badge.svg'
}

/**
 * Get image URL with fallback
 */
export function getImageUrl(url, type = 'avatar', size = 'md') {
  if (!url) {
    return DEFAULT_IMAGES[type] || DEFAULT_IMAGES.avatar
  }
  
  return getOptimizedImageUrl(url, type, size)
}