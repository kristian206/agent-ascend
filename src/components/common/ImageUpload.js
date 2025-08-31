'use client'
import { useState, useRef } from 'react'
import { Upload, X, Loader, Check } from 'lucide-react'
import { optimizeImageClient, validateImageFile } from '@/src/services/imageOptimizer'

export default function ImageUpload({ 
  type = 'avatar',
  currentImage = null,
  onUpload,
  className = '',
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5
}) {
  const [preview, setPreview] = useState(currentImage)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  
  const handleFile = async (file) => {
    if (!file) return
    
    // Reset states
    setError(null)
    setStats(null)
    
    // Validate file
    const errors = validateImageFile(file, type)
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }
    
    setUploading(true)
    
    try {
      // Optimize image client-side
      const optimized = await optimizeImageClient(file, type, maxSizeMB)
      
      // Show preview
      setPreview(optimized.dataUrl)
      
      // Show optimization stats
      setStats({
        before: (file.size / 1024).toFixed(1),
        after: (optimized.sizeAfter / 1024).toFixed(1),
        reduction: optimized.reduction
      })
      
      // Call parent handler with optimized image
      if (onUpload) {
        await onUpload(optimized)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }
  
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }
  
  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }
  
  const clearImage = () => {
    setPreview(null)
    setStats(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Different styles for avatar vs banner
  const containerStyles = {
    avatar: 'w-32 h-32 rounded-full',
    banner: 'w-full h-48 rounded-xl',
    badge: 'w-24 h-24 rounded-lg',
    achievement: 'w-32 h-32 rounded-xl'
  }
  
  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Upload Area */}
      <div
        className={`
          relative overflow-hidden
          ${containerStyles[type] || containerStyles.avatar}
          ${dragActive ? 'ring-4 ring-blue-400' : 'ring-2 ring-gray-300'}
          ${preview ? '' : 'border-2 border-dashed border-gray-300'}
          bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />
        
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearImage()
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            {uploading ? (
              <Loader className="w-8 h-8 text-gray-300 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-xs text-gray-400 text-center">
                  Click or drag to upload
                </span>
                <span className="text-xs text-gray-300 mt-1">
                  Max {maxSizeMB}MB
                </span>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Optimization Stats */}
      {stats && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Optimized!</span>
          </div>
          <div className="mt-1 text-xs text-green-600">
            {stats.before}KB → {stats.after}KB ({stats.reduction}% smaller)
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {/* Help Text */}
      <p className="mt-2 text-xs text-gray-400">
        {type === 'avatar' && 'Recommended: Square image, at least 256x256px'}
        {type === 'banner' && 'Recommended: 1920x480px or 4:1 aspect ratio'}
        {type === 'badge' && 'Recommended: Square image with transparent background'}
      </p>
    </div>
  )
}