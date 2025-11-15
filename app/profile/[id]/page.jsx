"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import QuoteCard from "@/components/quote-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Quote, ArrowLeft } from "lucide-react"
import Link from "next/link"
import UserAvatar from "@/components/user-avatar"
import FollowButton from "@/components/follow-button"
import FollowersModal from "@/components/followers-modal"

export default function PublicProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const userId = params.id

  const [profileData, setProfileData] = useState(null)
  const [userQuotes, setUserQuotes] = useState([])
  const [userStats, setUserStats] = useState({
    totalQuotes: 0,
    totalLikes: 0,
    totalComments: 0,
    joinedDate: null,
  })
  const [followStats, setFollowStats] = useState({
    followersCount: 0,
    followingCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [followersModalOpen, setFollowersModalOpen] = useState(false)
  const [followingModalOpen, setFollowingModalOpen] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchUserData()
      fetchFollowStats()
    }
  }, [userId])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)

      // Fetch user profile
      const profileResponse = await fetch(`/api/users/${userId}/profile`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfileData(profileData)
      }

      // Fetch user's quotes
      const quotesResponse = await fetch(`/api/users/${userId}/quotes`)
      if (quotesResponse.ok) {
        const quotesData = await quotesResponse.json()
        setUserQuotes(quotesData.quotes)
      }

      // Fetch user stats
      const statsResponse = await fetch(`/api/users/${userId}/stats`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setUserStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFollowStats = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/follow-status`)
      if (response.ok) {
        const data = await response.json()
        setFollowStats({
          followersCount: data.followersCount,
          followingCount: data.followingCount,
        })
      }
    } catch (error) {
      console.error("Error fetching follow stats:", error)
    }
  }

  const handleLike = async (quoteId) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/like`, {
        method: "POST",
      })
      if (response.ok) {
        fetchUserData() // Refresh data
      }
    } catch (error) {
      console.error("Error liking quote:", error)
    }
  }

  const handleComment = async (quoteId, commentText) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
      })
      if (response.ok) {
        fetchUserData() // Refresh data
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <p className="text-gray-600">Create your account to visit other's profile</p>
            <Link href="/quotes">
              <Button className="mt-4">Back to Quotes</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <UserAvatar
                userId={userId}
                userName={profileData.name}
                userImage={profileData.profilePicture}
                size="xlarge"
              />

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-gray-600">{profileData.email}</p>
                    {profileData.bio && <p className="text-gray-700 mt-2">{profileData.bio}</p>}
                    {profileData.role === "admin" && (
                      <Badge variant="secondary" className="mt-2">
                        Admin
                      </Badge>
                    )}
                  </div>

                  <FollowButton userId={userId} className="mt-4 md:mt-0" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="text-center p-2">
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalQuotes}</div>
                    <div className="text-sm text-gray-600">Quotes</div>
                  </div>
                  <button
                    onClick={() => setFollowersModalOpen(true)}
                    className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="text-2xl font-bold text-purple-600">{followStats.followersCount}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </button>
                  <button
                    onClick={() => setFollowingModalOpen(true)}
                    className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="text-2xl font-bold text-orange-600">{followStats.followingCount}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* User's Quotes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center">
              <Quote className="h-5 w-5 mr-2" />
              Quotes ({userQuotes.length})
            </h2>
          </CardHeader>
          <CardContent>
            {userQuotes.length === 0 ? (
              <div className="text-center py-12">
                <Quote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
                <p className="text-gray-600">This user hasn't shared any quotes yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {userQuotes.map((quote) => (
                  <QuoteCard
                    key={quote._id}
                    quote={quote}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={() => {}} // Public profile can't delete
                    onEdit={() => {}} // Public profile can't edit
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Followers Modal */}
        <FollowersModal
          userId={userId}
          type="followers"
          isOpen={followersModalOpen}
          onClose={() => setFollowersModalOpen(false)}
        />

        {/* Following Modal */}
        <FollowersModal
          userId={userId}
          type="following"
          isOpen={followingModalOpen}
          onClose={() => setFollowingModalOpen(false)}
        />
      </div>
    </div>
  )
}
