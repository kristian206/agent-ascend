import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Image optimization configurations
const IMAGE_CONFIGS = {
  avatars: {
    dir: 'public/images/avatars',
    sizes: [32, 64, 128, 256],
    formats: ['webp', 'png']
  },
  badges: {
    dir: 'public/images/badges',
    sizes: [32, 64, 128],
    formats: ['webp', 'png']
  },
  banners: {
    dir: 'public/images/banners',
    sizes: [640, 1280, 1920],
    formats: ['webp', 'jpeg']
  },
  icons: {
    dir: 'public/images/icons',
    sizes: [24, 32, 48, 64],
    formats: ['webp', 'png']
  },
  ui: {
    dir: 'public/images/ui',
    sizes: [32, 64, 128],
    formats: ['webp', 'png']
  },
  frames: {
    dir: 'public/images/frames',
    sizes: [128, 256],
    formats: ['webp', 'png']
  }
}

async function optimizeImage(inputPath, outputDir, filename, config) {
  const stats = {
    original: 0,
    optimized: [],
    savings: 0
  }
  
  try {
    // Get original file size
    const originalStats = await fs.stat(inputPath)
    stats.original = originalStats.size
    
    // Read the image
    const imageBuffer = await fs.readFile(inputPath)
    
    // Process each size
    for (const size of config.sizes) {
      for (const format of config.formats) {
        const suffix = config.sizes.length > 1 ? `-${size}` : ''
        const outputFilename = `${filename}${suffix}.${format}`
        const outputPath = path.join(outputDir, outputFilename)
        
        try {
          let pipeline = sharp(imageBuffer)
            .resize(size, size, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
          
          // Apply format-specific optimizations
          if (format === 'webp') {
            pipeline = pipeline.webp({ quality: 85, effort: 6 })
          } else if (format === 'jpeg') {
            pipeline = pipeline.jpeg({ quality: 85, progressive: true })
          } else if (format === 'png') {
            pipeline = pipeline.png({ 
              quality: 90, 
              compressionLevel: 9,
              adaptiveFiltering: true
            })
          }
          
          await pipeline.toFile(outputPath)
          
          const newStats = await fs.stat(outputPath)
          stats.optimized.push({
            file: outputFilename,
            size: newStats.size
          })
        } catch (err) {
          console.error(`  Error creating ${outputFilename}:`, err.message)
        }
      }
    }
    
    // Calculate total savings
    const totalOptimizedSize = stats.optimized.reduce((sum, item) => sum + item.size, 0)
    stats.savings = ((stats.original - totalOptimizedSize / stats.optimized.length) / stats.original * 100).toFixed(1)
    
    return stats
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message)
    return null
  }
}

async function optimizeDirectory(config, categoryName) {
  const dirPath = path.join(__dirname, '..', config.dir)
  
  console.log(`\n📁 Optimizing ${categoryName}...`)
  console.log(`Directory: ${config.dir}`)
  
  try {
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true })
    
    // Get all image files
    const files = await fs.readdir(dirPath)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'].includes(ext) &&
             !file.includes('-xs') && 
             !file.includes('-sm') && 
             !file.includes('-md') && 
             !file.includes('-lg') &&
             !file.includes('-32') &&
             !file.includes('-64') &&
             !file.includes('-128') &&
             !file.includes('-256')
    })
    
    if (imageFiles.length === 0) {
      console.log('  No images to optimize')
      return
    }
    
    console.log(`  Found ${imageFiles.length} images to optimize`)
    
    let totalOriginal = 0
    let totalOptimized = 0
    let successCount = 0
    
    for (const file of imageFiles) {
      const inputPath = path.join(dirPath, file)
      const filename = path.basename(file, path.extname(file))
      
      // Skip SVG files for now (they don't need raster optimization)
      if (path.extname(file).toLowerCase() === '.svg') {
        console.log(`  ⏭️  Skipping SVG: ${file}`)
        continue
      }
      
      console.log(`  Processing: ${file}`)
      const stats = await optimizeImage(inputPath, dirPath, filename, config)
      
      if (stats) {
        totalOriginal += stats.original
        stats.optimized.forEach(item => {
          totalOptimized += item.size
        })
        successCount++
        console.log(`    ✅ Created ${stats.optimized.length} versions, saved ${stats.savings}%`)
      }
    }
    
    if (successCount > 0) {
      const totalSavings = ((totalOriginal - totalOptimized / successCount) / totalOriginal * 100).toFixed(1)
      console.log(`  📊 Total: ${successCount} images optimized, average savings: ${totalSavings}%`)
    }
  } catch (error) {
    console.error(`Error processing directory ${config.dir}:`, error.message)
  }
}

async function optimizeAllImages() {
  console.log('🖼️ Starting comprehensive image optimization...')
  console.log('This will optimize all images in the project\n')
  
  // Process each category
  for (const [category, config] of Object.entries(IMAGE_CONFIGS)) {
    await optimizeDirectory(config, category)
  }
  
  console.log('\n✨ Image optimization complete!')
  console.log('\nOptimized images are now available in multiple sizes and formats:')
  console.log('  • WebP format for modern browsers (smaller file size)')
  console.log('  • PNG/JPEG fallback for older browsers')
  console.log('  • Multiple sizes for responsive loading')
  console.log('\nUsage example:')
  console.log('  <picture>')
  console.log('    <source srcSet="/images/badges/badge-64.webp" type="image/webp" />')
  console.log('    <img src="/images/badges/badge-64.png" alt="Badge" />')
  console.log('  </picture>')
}

// Run the optimization
optimizeAllImages().catch(console.error)