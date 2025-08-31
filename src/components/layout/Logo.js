'use client'
import { useState } from 'react'

export default function Logo({ 
  size = 'md', 
  variant = 'transparent', 
  className = '',
  alt = 'Agency Max+' 
}) {
  const [imageError, setImageError] = useState(false)
  
  // Size mappings
  const sizeMap = {
    nav: 'nav',    // 40px - for navigation bar
    xs: 'xs',      // 64px
    sm: 'sm',      // 128px
    md: 'md',      // 256px
    lg: 'lg',      // 512px
    full: ''       // Full size
  }
  
  const suffix = sizeMap[size] || 'md'
  const baseName = variant === 'transparent' 
    ? 'agency-max-plus-transparent' 
    : 'agency-max-plus'
  
  // Build image paths
  const webpPath = suffix 
    ? `/images/logo/${baseName}-${suffix}.webp`
    : `/images/logo/${baseName}.webp`
  
  const pngPath = suffix
    ? `/images/logo/${baseName}-${suffix}.png`
    : `/images/logo/${baseName}.png`
  
  const fallbackPath = `/images/logo/${baseName}-compressed.png`
  
  // Size classes
  const sizeClasses = {
    nav: 'w-10 h-10',
    xs: 'w-16 h-16',
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-128 h-128',
    full: 'w-full h-auto'
  }
  
  const sizeClass = sizeClasses[size] || sizeClasses.md
  
  return (
    <picture className={`inline-block ${className}`}>
      {/* WebP for modern browsers */}
      {!imageError && (
        <source srcSet={webpPath} type="image/webp" />
      )}
      
      {/* PNG fallback */}
      <img
        src={imageError ? fallbackPath : pngPath}
        alt={alt}
        className={`${sizeClass} object-contain`}
        onError={() => {
          if (!imageError) {
            setImageError(true)
          }
        }}
        loading="lazy"
      />
    </picture>
  )
}