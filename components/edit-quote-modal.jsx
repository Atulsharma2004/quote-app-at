"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Save } from "lucide-react"

export default function EditQuoteModal({ quote, isOpen, onClose, onSave }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    text: "",
    author: "",
    category: "motivation", // Updated default value to be a non-empty string
  })

  useEffect(() => {
    if (quote) {
      setFormData({
        text: quote.text || "",
        author: quote.author || "",
        category: quote.category || "motivation", // Updated default value to be a non-empty string
      })
    }
  }, [quote])

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
    if (!quote) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/quotes/${quote._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave && onSave()
        onClose()
        alert("Quote updated successfully!")
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Quote</DialogTitle>
          <DialogDescription>Make changes to your quote here. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-text">Quote Text *</Label>
            <Textarea
              id="edit-text"
              name="text"
              placeholder="Enter the quote text..."
              value={formData.text}
              onChange={handleChange}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-author">Author *</Label>
            <Input
              id="edit-author"
              name="author"
              placeholder="Who said this quote?"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.text || !formData.author}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Updating..." : "Update Quote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
