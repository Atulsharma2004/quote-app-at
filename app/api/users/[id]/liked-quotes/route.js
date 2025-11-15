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
    const quotes = client.db("quoteapp").collection("quotes")
    const users = client.db("quoteapp").collection("users")

    // Get quotes liked by the user
    const likedQuotes = await quotes.find({ likes: id }).sort({ createdAt: -1 }).toArray()

    // Enrich quotes with user profile pictures and comment user images
    const enrichedQuotes = await Promise.all(
      likedQuotes.map(async (quote) => {
        try {
          // Get quote author's profile picture
          let user = null
          if (ObjectId.isValid(quote.userId)) {
            user = await users.findOne({ _id: new ObjectId(quote.userId) })
          }

          // If not found, try to find by email (fallback for Google OAuth users)
          if (!user && quote.userEmail) {
            user = await users.findOne({ email: quote.userEmail })
          }

          // Enrich comments with user profile pictures
          let enrichedComments = []
          if (quote.comments && quote.comments.length > 0) {
            enrichedComments = await Promise.all(
              quote.comments.map(async (comment) => {
                try {
                  // Find comment author's profile picture
                  let commentUser = null
                  if (ObjectId.isValid(comment.userId)) {
                    commentUser = await users.findOne({ _id: new ObjectId(comment.userId) })
                  }

                  // If not found, try to find by email
                  if (!commentUser && comment.userEmail) {
                    commentUser = await users.findOne({ email: comment.userEmail })
                  }

                  return {
                    ...comment,
                    userImage: commentUser?.profilePicture || commentUser?.image || comment.userImage || "",
                  }
                } catch (error) {
                  console.error("Error enriching comment with user data:", error)
                  return {
                    ...comment,
                    userImage: comment.userImage || "",
                  }
                }
              }),
            )
          }

          return {
            ...quote,
            _id: quote._id.toString(),
            userImage: user?.profilePicture || user?.image || quote.userImage || "",
            comments: enrichedComments,
          }
        } catch (error) {
          console.error("Error enriching quote with user data:", error)
          return {
            ...quote,
            _id: quote._id.toString(),
            userImage: quote.userImage || "",
            comments: quote.comments || [],
          }
        }
      }),
    )

    return NextResponse.json({ quotes: enrichedQuotes })
  } catch (error) {
    console.error("Error fetching liked quotes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
