"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"

export default function FollowButtonDebug({ userId, className = "" }) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    if (session && userId) {
      testAPI()
    }
  }, [session, userId])

  const testAPI = async () => {
    try {
      setError("")
      setDebugInfo(`Testing API with userId: ${userId}`)

      // First test if the API endpoint exists
      const testResponse = await fetch(`/api/users/${userId}/follow-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("API Test Response:", testResponse)
      console.log("Response status:", testResponse.status)
      console.log("Response headers:", testResponse.headers)

      const responseText = await testResponse.text()
      console.log("Response text:", responseText)

      setDebugInfo(`Status: ${testResponse.status}, Response: ${responseText.substring(0, 200)}...`)

      if (testResponse.ok) {
        try {
          const data = JSON.parse(responseText)
          setIsFollowing(data.isFollowing || false)
          setIsOwnProfile(data.isOwnProfile || false)
          setFollowersCount(data.followersCount || 0)
        } catch (parseError) {
          console.error("JSON parse error:", parseError)
          setError(`JSON parse error: ${parseError.message}`)
        }
      } else {
        setError(`API Error: ${testResponse.status} - ${responseText}`)
      }
    } catch (error) {
      console.error("Network error:", error)
      setError(`Network error: ${error.message}`)
      setDebugInfo(`Network error: ${error.message}`)
    }
  }

  const handleFollow = async () => {
    if (!session || isOwnProfile) return

    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting to follow/unfollow user:", userId)

      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Follow response status:", response.status)
      const responseText = await response.text()
      console.log("Follow response text:", responseText)

      if (response.ok) {
        try {
          const data = JSON.parse(responseText)
          setIsFollowing(data.isFollowing)
          if (data.action === "followed") {
            setFollowersCount((prev) => prev + 1)
          } else {
            setFollowersCount((prev) => Math.max(0, prev - 1))
          }
        } catch (parseError) {
          setError(`JSON parse error: ${parseError.message}`)
        }
      } else {
        setError(`Follow API Error: ${response.status} - ${responseText}`)
      }
    } catch (error) {
      console.error("Follow network error:", error)
      setError(`Follow network error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button if not logged in or if it's own profile
  if (!session || isOwnProfile) {
    return <div className="text-xs text-gray-500">{!session ? "Not logged in" : "Own profile"}</div>
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        onClick={handleFollow}
        disabled={isLoading}
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        className="flex items-center space-x-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserMinus className="h-4 w-4" />
            <span>Unfollow</span>
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            <span>Follow</span>
          </>
        )}
      </Button>

      {/* Debug info */}
      <div className="text-xs text-gray-500 max-w-xs">
        <div>User ID: {userId}</div>
        <div>Followers: {followersCount}</div>
        {debugInfo && <div>Debug: {debugInfo}</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
      </div>
    </div>
  )
}
