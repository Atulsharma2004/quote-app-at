"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { X } from "lucide-react"

export default function UserAvatar({
  userId,
  userName,
  userImage,
  size = "medium",
  className = "",
  showFallback = true,
}) {
  const [profileImage, setProfileImage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false) // Modal state

  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10",
    xlarge: "h-16 w-16",
  }

  useEffect(() => {
    // If userImage is "custom" or we don't have an image but have userId, fetch it
    if ((userImage === "custom" || (!userImage && userId)) && !isLoading) {
      fetchUserImage()
    } else if (userImage && userImage !== "custom") {
      setProfileImage(userImage)
    }
  }, [userId, userImage])

  const fetchUserImage = async () => {
    if (isLoading || !userId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}/profile`)

      if (response.ok) {
        const data = await response.json()
        setProfileImage(data.profilePicture || "")
      }
    } catch (error) {
      console.error("Error fetching user image:", error)
      setProfileImage("") // Set to empty string on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage
        src={profileImage || "https://thumb.ac-illust.com/51/51e1c1fc6f50743937e62fca9b942694_t.jpeg"}
        alt={userName || "User"}
        loading="lazy"
        onClick={() => setShowModal(true)} // Open modal on click
        onError={() => setProfileImage("")} // Handle image load errors
      />
      <AvatarFallback>
        {showFallback ? (
          userName?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
    {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-10">
          <div className="relative bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={profileImage || "https://thumb.ac-illust.com/51/51e1c1fc6f50743937e62fca9b942694_t.jpeg"}
              alt={userName || "User"}
              className="max-w-[130vw] max-h-[120vh] rounded-lg object-contain"
            />
            <div className="mt-2 text-center font-semibold">{userName}</div>
          </div>
        </div>
      )}
    </>
  )
}
