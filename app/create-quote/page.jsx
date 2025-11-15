"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote } from "lucide-react"

export default function CreateQuotePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    text: "",
    author: "",
    category: "",
  })

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
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/quotes")
      } else {
        console.error("Error creating quote")
      }
    } catch (error) {
      console.error("Error creating quote:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <p className="text-gray-600">Please sign in to create a quote.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader className="text-center">
            <Quote className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Share a Quote</CardTitle>
            <CardDescription>Inspire others by sharing a meaningful quote</CardDescription>
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
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !formData.text || !formData.author} className="flex-1">
                  {isLoading ? "Publishing..." : "Publish Quote"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
