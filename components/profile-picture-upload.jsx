"use client"
import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X } from "lucide-react"

export default function ProfilePictureUpload({ currentImage, onImageChange, userName, size = "large" }) {
  const [preview, setPreview] = useState(currentImage || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-16 w-16",
    large: "h-24 w-24",
    xlarge: "h-32 w-32",
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleImageUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB")
      return
    }

    setIsUploading(true)

    try {
      // Create a canvas to resize the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 200x200 for smaller file size)
        const maxSize = 200
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        // Set canvas size and draw resized image
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with higher compression
        const base64String = canvas.toDataURL("image/jpeg", 0.6) // Reduced quality to 60%
        setPreview(base64String)
        onImageChange(base64String)
        setIsUploading(false)
      }

      img.onerror = () => {
        alert("Error loading image")
        setIsUploading(false)
      }

      // Read file as data URL
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error uploading image")
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview("")
    onImageChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={preview || "https://thumb.ac-illust.com/51/51e1c1fc6f50743937e62fca9b942694_t.jpeg"} alt={userName || "User"} />
          <AvatarFallback className="text-lg">{userName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>

        {/* Upload button overlay */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity"
          title="Upload profile picture"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="bg-transparent"
        >
          <Upload className="h-4 w-4 mr-2" />
          {preview ? "Change" : "Upload"}
        </Button>

        {preview && (
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage} className="bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile picture"
      />

      {/* Help text */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Upload a profile picture (JPG, PNG, GIF). Max size: 2MB
      </p>
    </div>
  )
}
