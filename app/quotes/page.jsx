"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSelector, useDispatch } from "react-redux"
import { setQuotes, setQuotesLoading } from "@/lib/store"
import Navbar from "@/components/navbar"
import QuoteCard from "@/components/quote-card"
import EditQuoteModal from "@/components/edit-quote-modal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function QuotesPage() {
  const { data: session } = useSession()
  const dispatch = useDispatch()
  const { quotes, isLoading } = useSelector((state) => state.quotes)

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [editingQuote, setEditingQuote] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchQuotes()
  }, [searchTerm, categoryFilter, sortBy])

  const fetchQuotes = async () => {
    dispatch(setQuotesLoading(true))
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category: categoryFilter,
        sort: sortBy,
      })

      const response = await fetch(`/api/quotes?${params}`)
      const data = await response.json()

      if (response.ok) {
        dispatch(setQuotes(data.quotes))
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      dispatch(setQuotesLoading(false))
    }
  }

  const handleLike = async (quoteId) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        fetchQuotes() // Refresh quotes to show updated likes
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
        fetchQuotes() // Refresh quotes to show new comment
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
        fetchQuotes() // Refresh quotes
        alert("Quote deleted successfully!")
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Error deleting quote")
      }
    } catch (error) {
      console.error("Error deleting quote:", error)
      alert("Error deleting quote")
    }
  }

  const handleEdit = (quote) => {
    // console.log("Edit quote clicked:", quote) // Debug log
    setEditingQuote(quote)
    setIsEditModalOpen(true)
  }

  const handleEditSave = () => {
    fetchQuotes() // Refresh the quotes list
    setIsEditModalOpen(false)
    setEditingQuote(null)
  }

  const handleEditClose = () => {
    setIsEditModalOpen(false)
    setEditingQuote(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Quotes</h1>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quotes, authors, or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="motivation">Motivation</SelectItem>
                <SelectItem value="wisdom">Wisdom</SelectItem>
                <SelectItem value="love">Love</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="life">Life</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most-liked">Most Liked</SelectItem>
                <SelectItem value="most-commented">Most Commented</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quotes List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No quotes found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
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

        {/* Edit Quote Modal */}
        <EditQuoteModal
          quote={editingQuote}
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      </div>
    </div>
  )
}
