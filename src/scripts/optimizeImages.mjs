import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function optimizeLogos() {
  console.log('🖼️ Starting logo optimization...\n')
  
  const logoDir = path.join(__dirname, '../public/images/logo')
  const desktopDir = path.join(__dirname, '../../Desktop')
  
  // Logo files to optimize
  const logos = [
    {
      source: path.join(desktopDir, 'Agency Max Plus.png'),
      name: 'agency-max-plus'
    },
    {
      source: path.join(desktopDir, 'Agency Max Plus - Transparent.png'),
      name: 'agency-max-plus-transparent'
    }
  ]
  
  // Ensure logo directory exists
  await fs.mkdir(logoDir, { recursive: true })
  
  for (const logo of logos) {
    try {
      console.log(`Processing: ${path.basename(logo.source)}`)
      const sourceBuffer = await fs.readFile(logo.source)
      const originalSize = sourceBuffer.length / 1024 / 1024
      console.log(`  Original size: ${originalSize.toFixed(2)} MB`)
      
      // 1. Create optimized PNG versions (multiple sizes)
      const sizes = [
        { width: 512, suffix: 'lg' },
        { width: 256, suffix: 'md' },
        { width: 128, suffix: 'sm' },
        { width: 64, suffix: 'xs' },
        { width: 40, suffix: 'nav' } // For navigation bar
      ]
      
      for (const size of sizes) {
        const outputPath = path.join(logoDir, `${logo.name}-${size.suffix}.png`)
        
        await sharp(sourceBuffer)
          .resize(size.width, size.width, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png({ 
            quality: 90,
            compressionLevel: 9,
            adaptiveFiltering: true,
            force: true
          })
          .toFile(outputPath)
        
        const stats = await fs.stat(outputPath)
        const newSize = stats.size / 1024
        console.log(`  ✅ PNG ${size.suffix} (${size.width}px): ${newSize.toFixed(1)} KB`)
      }
      
      // 2. Create WebP versions for modern browsers
      for (const size of sizes) {
        const outputPath = path.join(logoDir, `${logo.name}-${size.suffix}.webp`)
        
        await sharp(sourceBuffer)
          .resize(size.width, size.width, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .webp({ 
            quality: 85,
            effort: 6
          })
          .toFile(outputPath)
        
        const stats = await fs.stat(outputPath)
        const newSize = stats.size / 1024
        console.log(`  ✅ WebP ${size.suffix} (${size.width}px): ${newSize.toFixed(1)} KB`)
      }
      
      // 3. Create a highly compressed version for fast loading
      const compressedPath = path.join(logoDir, `${logo.name}-compressed.png`)
      await sharp(sourceBuffer)
        .resize(256, 256, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ 
          quality: 80,
          compressionLevel: 9,
          palette: true,
          colors: 256
        })
        .toFile(compressedPath)
      
      const compressedStats = await fs.stat(compressedPath)
      const compressedSize = compressedStats.size / 1024
      console.log(`  ✅ Compressed PNG: ${compressedSize.toFixed(1)} KB`)
      
      // 4. Keep one full-size optimized version
      const fullPath = path.join(logoDir, `${logo.name}.png`)
      await sharp(sourceBuffer)
        .png({ 
          quality: 85,
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toFile(fullPath)
      
      const fullStats = await fs.stat(fullPath)
      const fullSize = fullStats.size / 1024 / 1024
      console.log(`  ✅ Full optimized: ${fullSize.toFixed(2)} MB`)
      
      // Calculate savings
      const savings = ((originalSize - fullSize) / originalSize * 100).toFixed(1)
      console.log(`  💰 Saved ${savings}% on full-size version\n`)
      
    } catch (error) {
      console.error(`  ❌ Error processing ${logo.source}:`, error.message)
    }
  }
  
  // Also optimize the existing logo in the project
  try {
    const existingLogo = path.join(logoDir, 'agency-max-plus.png')
    const existingStats = await fs.stat(existingLogo).catch(() => null)
    
    if (existingStats) {
      console.log('Optimizing existing logo in project...')
      const existingBuffer = await fs.readFile(existingLogo)
      const originalSize = existingStats.size / 1024 / 1024
      console.log(`  Original size: ${originalSize.toFixed(2)} MB`)
      
      // Optimize in place
      await sharp(existingBuffer)
        .resize(256, 256, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ 
          quality: 85,
          compressionLevel: 9
        })
        .toFile(existingLogo + '.tmp')
      
      await fs.rename(existingLogo + '.tmp', existingLogo)
      
      const newStats = await fs.stat(existingLogo)
      const newSize = newStats.size / 1024
      console.log(`  ✅ Optimized to: ${newSize.toFixed(1)} KB\n`)
    }
  } catch (error) {
    console.error('Error optimizing existing logo:', error.message)
  }
  
  console.log('✨ Logo optimization complete!')
  console.log('\nUsage in your app:')
  console.log('  Navigation: agency-max-plus-nav.webp (40px)')
  console.log('  Login page: agency-max-plus-md.webp (256px)')
  console.log('  Profile: agency-max-plus-lg.webp (512px)')
  console.log('  Fallback PNG: agency-max-plus-[size].png')
}

optimizeLogos().catch(console.error)