"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import QuoteCard from "@/components/quote-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, Quote, Heart } from "lucide-react"
import Link from "next/link"
import EditQuoteModal from "@/components/edit-quote-modal"
import UserAvatar from "@/components/user-avatar"
import FollowersModal from "@/components/followers-modal"
import { useUserProfile } from "@/hooks/use-user-profile"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { profileData, isLoading: profileLoading, refreshProfile } = useUserProfile()
  const [userQuotes, setUserQuotes] = useState([])
  const [likedQuotes, setLikedQuotes] = useState([])
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
  const [editingQuote, setEditingQuote] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [followersModalOpen, setFollowersModalOpen] = useState(false)
  const [followingModalOpen, setFollowingModalOpen] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchUserData()
    fetchFollowStats()
  }, [session, status])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)

      // Fetch user's quotes
      const quotesResponse = await fetch(`/api/users/${session.user.id}/quotes`)
      if (quotesResponse.ok) {
        const quotesData = await quotesResponse.json()
        setUserQuotes(quotesData.quotes)
      }

      // Fetch user's liked quotes
      const likedResponse = await fetch(`/api/users/${session.user.id}/liked-quotes`)
      if (likedResponse.ok) {
        const likedData = await likedResponse.json()
        setLikedQuotes(likedData.quotes)
      }

      // Fetch user stats
      const statsResponse = await fetch(`/api/users/${session.user.id}/stats`)
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
      const response = await fetch(`/api/users/${session.user.id}/follow-status`)
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

  const handleDelete = async (quoteId) => {
    if (!confirm("Are you sure you want to delete this quote?")) return

    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchUserData() // Refresh data
      }
    } catch (error) {
      console.error("Error deleting quote:", error)
    }
  }

  const handleEdit = (quote) => {
    setEditingQuote(quote)
    setIsEditModalOpen(true)
  }

  const handleEditSave = () => {
    fetchUserData() // Refresh the data
    setIsEditModalOpen(false)
    setEditingQuote(null)
  }

  if (status === "loading" || isLoading || profileLoading) {
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

  if (!session) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <UserAvatar
                userId={session.user.id}
                userName={profileData?.name || session.user.name}
                userImage={profileData?.profilePicture || session.user.image}
                size="xlarge"
              />

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData?.name || session.user?.name}</h1>
                    <p className="text-gray-600">{session.user?.email}</p>
                    {profileData?.bio && <p className="text-gray-700 mt-2">{profileData.bio}</p>}
                    {session.user?.role === "admin" && (
                      <Badge variant="secondary" className="mt-2">
                        Admin
                      </Badge>
                    )}
                  </div>

                  <Link href="/settings">
                    <Button variant="outline" className="mt-4 md:mt-0 bg-transparent">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="text-center p-2">
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalQuotes}</div>
                    <div className="text-sm text-gray-600">Quotes</div>
                  </div>
                  {/* <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{userStats.totalLikes}</div>
                    <div className="text-sm text-gray-600">Likes Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{userStats.totalComments}</div>
                    <div className="text-sm text-gray-600">Comments</div>
                  </div> */}
                  <button
                    onClick={() => setFollowersModalOpen(true)}
                    className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors "
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

        {/* Tabs for different content */}
        <Tabs defaultValue="my-quotes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-quotes" className="flex items-center space-x-2">
              <Quote className="h-4 w-4" />
              <span>My Quotes ({userQuotes.length})</span>
            </TabsTrigger>
            <TabsTrigger value="liked-quotes" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Liked Quotes ({likedQuotes.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-quotes" className="space-y-6">
            {userQuotes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Quote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
                  <p className="text-gray-600 mb-4">Start sharing your wisdom with the community!</p>
                  <Link href="/create-quote">
                    <Button>Create Your First Quote</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {userQuotes.map((quote) => (
                  <QuoteCard
                    key={quote._id}
                    quote={quote}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked-quotes" className="space-y-6">
            {likedQuotes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No liked quotes yet</h3>
                  <p className="text-gray-600 mb-4">Explore quotes and like the ones that inspire you!</p>
                  <Link href="/quotes">
                    <Button>Explore Quotes</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {likedQuotes.map((quote) => (
                  <QuoteCard
                    key={quote._id}
                    quote={quote}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <EditQuoteModal
          quote={editingQuote}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingQuote(null)
          }}
          onSave={handleEditSave}
        />

        {/* Followers Modal */}
        <FollowersModal
          userId={session.user.id}
          type="followers"
          isOpen={followersModalOpen}
          onClose={() => setFollowersModalOpen(false)}
        />

        {/* Following Modal */}
        <FollowersModal
          userId={session.user.id}
          type="following"
          isOpen={followingModalOpen}
          onClose={() => setFollowingModalOpen(false)}
        />
      </div>
    </div>
  )
}
