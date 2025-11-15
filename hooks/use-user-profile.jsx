"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useUserProfile(userId = null) {
  const { data: session } = useSession()
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const targetUserId = userId || session?.user?.id

  useEffect(() => {
    if (!targetUserId) {
      setIsLoading(false)
      return
    }

    fetchProfileData()
  }, [targetUserId])

  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/users/${targetUserId}/profile`)

      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      } else {
        throw new Error("Failed to fetch profile data")
      }
    } catch (err) {
      console.error("Error fetching profile data:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = () => {
    fetchProfileData()
  }

  return {
    profileData,
    isLoading,
    error,
    refreshProfile,
  }
}
