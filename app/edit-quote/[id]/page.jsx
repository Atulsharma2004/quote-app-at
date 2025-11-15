"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function EditQuotePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState({
    text: "",
    author: "",
    category: "motivation", // Updated default value to be a non-empty string
  })
  const [originalQuote, setOriginalQuote] = useState(null)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (params.id) {
      fetchQuote()
    }
  }, [session, params.id])

  const fetchQuote = async () => {
    try {
      setIsFetching(true)
      const response = await fetch(`/api/quotes/${params.id}`)

      if (response.ok) {
        const quote = await response.json()

        // Check if user can edit this quote
        if (quote.userId !== session.user.id && session.user.role !== "admin") {
          alert("You don't have permission to edit this quote")
          router.push("/quotes")
          return
        }

        setOriginalQuote(quote)
        setFormData({
          text: quote.text,
          author: quote.author,
          category: quote.category || "motivation", // Updated default value to be a non-empty string
        })
      } else {
        alert("Quote not found")
        router.push("/quotes")
      }
    } catch (error) {
      console.error("Error fetching quote:", error)
      alert("Error loading quote")
      router.push("/quotes")
    } finally {
      setIsFetching(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!session || !params.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/quotes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Quote updated successfully!")
        router.push("/profile")
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Error updating quote")
      }
    } catch (error) {
      console.error("Error updating quote:", error)
      alert("Error updating quote")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return null // Will redirect to signin
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center">
            <Quote className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading quote...</p>
          </div>
        </div>
      </div>
    )
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
            <Quote className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Edit Quote</CardTitle>
            <CardDescription>Update your quote and share your wisdom</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text">Quote Text *</Label>
                <Textarea
                  id="text"
                  name="text"
                  placeholder="Enter the quote text..."
                  value={formData.text}
                  onChange={handleChange}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Who said this quote?"
                  value={formData.author}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivation">Motivation</SelectItem>
                    <SelectItem value="wisdom">Wisdom</SelectItem>
                    <SelectItem value="love">Love</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="life">Life</SelectItem>
                    <SelectItem value="happiness">Happiness</SelectItem>
                    <SelectItem value="inspiration">Inspiration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Link href="/profile" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading || !formData.text || !formData.author} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating..." : "Update Quote"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Show original quote for reference */}
        {originalQuote && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Original Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-lg italic text-gray-800 mb-2">"{originalQuote.text}"</blockquote>
              <p className="text-right text-gray-600">— {originalQuote.author}</p>
              {originalQuote.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {originalQuote.category}
                </span>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
