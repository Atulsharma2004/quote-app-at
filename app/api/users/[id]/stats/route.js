import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { id } = await params
    const client = await clientPromise
    const db = client.db("quoteapp")
    const quotes = db.collection("quotes")
    const users = db.collection("users")

    // Get user info for join date - fix MongoDB query
    let user = null
    try {
      // Try to find by ObjectId first
      if (ObjectId.isValid(id)) {
        user = await users.findOne({ _id: new ObjectId(id) })
      }
      // If not found, try to find by email (for Google OAuth users)
      if (!user && session.user.email) {
        user = await users.findOne({ email: session.user.email })
      }
    } catch (mongoError) {
      console.log("MongoDB query error, using fallback:", mongoError.message)
      // Fallback: try to find by email
      if (session.user.email) {
        user = await users.findOne({ email: session.user.email })
      }
    }

    // Get user's quotes count
    const totalQuotes = await quotes.countDocuments({ userId: id })

    // Get total likes received on user's quotes
    const userQuotes = await quotes.find({ userId: id }).toArray()
    const totalLikes = userQuotes.reduce((sum, quote) => sum + (quote.likesCount || 0), 0)

    // Get total comments on user's quotes
    const totalComments = userQuotes.reduce((sum, quote) => sum + (quote.commentsCount || 0), 0)

    return NextResponse.json({
      totalQuotes,
      totalLikes,
      totalComments,
      joinedDate: user?.createdAt || new Date(),
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
