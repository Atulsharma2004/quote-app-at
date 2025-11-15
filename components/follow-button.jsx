"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"

export default function FollowButton({ userId, className = "" }) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)

  useEffect(() => {
    if (session && userId) {
      fetchFollowStatus()
    }
  }, [session, userId])

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/follow-status`)

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
        setIsOwnProfile(data.isOwnProfile)
        setFollowersCount(data.followersCount)
      } else {
        console.error("Follow status error:", response.status)
      }
    } catch (error) {
      console.error("Error fetching follow status:", error)
    }
  }

  const handleFollow = async () => {
    if (!session || isOwnProfile) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)

        // Update followers count
        if (data.action === "followed") {
          setFollowersCount((prev) => prev + 1)
        } else {
          setFollowersCount((prev) => Math.max(0, prev - 1))
        }
      } else {
        console.error("Follow error:", response.status)
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button if not logged in or if it's own profile
  if (!session || isOwnProfile) {
    return null
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={`flex items-center space-x-2 ${className}`}
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
  )
}
