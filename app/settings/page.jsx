"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProfilePictureUpload from "@/components/profile-picture-upload"

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profilePicture: "",
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    setFormData({
      name: session.user?.name || "",
      bio: session.user?.bio || "",
      profilePicture: session.user?.image || "",
    })
  }, [session, status])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (base64Image) => {
    setFormData({
      ...formData,
      profilePicture: base64Image,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Update the session
        await update({
          ...session,
          user: {
            ...session.user,
            name: formData.name,
            bio: formData.bio,
            image: formData.profilePicture,
          },
        })

        alert("Profile updated successfully!")
        router.push("/profile")
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Error updating profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information and picture</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex justify-center">
                <ProfilePictureUpload
                  currentImage={formData.profilePicture}
                  onImageChange={handleImageChange}
                  userName={formData.name}
                  size="xlarge"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={session.user?.email || ""} disabled className="bg-gray-100" />
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <Link href="/profile" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
