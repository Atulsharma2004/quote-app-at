"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, User } from "lucide-react"
import Link from "next/link"
import FollowButton from "@/components/follow-button"

export default function FollowersModal({ userId, type, isOpen, onClose }) {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      console.log("Modal opened for:", { userId, type, isOpen })
      fetchUsers()
    }
  }, [isOpen, userId, type])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const endpoint = type === "followers" ? "followers" : "following"
      console.log(`Fetching ${endpoint} for user:`, userId)

      const response = await fetch(`/api/users/${userId}/${endpoint}`)
      console.log(`${endpoint} response status:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`${endpoint} data received:`, data)

        // Make sure we're accessing the correct property
        const usersArray = data[endpoint] || []
        console.log(`${endpoint} users array:`, usersArray)

        setUsers(usersArray)
      } else {
        console.error(`Error fetching ${endpoint}:`, response.status)
        const errorData = await response.text()
        console.error(`Error details:`, errorData)
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold capitalize">
            {type} ({users.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading {type}...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No {type} yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center space-x-3 flex-1 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    onClick={onClose}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePicture || "https://thumb.ac-illust.com/51/51e1c1fc6f50743937e62fca9b942694_t.jpeg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      {user.bio && <p className="text-sm text-gray-500 truncate">{user.bio}</p>}
                    </div>
                  </Link>

                  {session && session.user.id !== user.id && <FollowButton userId={user.id} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
