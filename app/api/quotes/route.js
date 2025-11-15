import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const sort = searchParams.get("sort") || "newest"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const client = await clientPromise
    const quotes = client.db("quoteapp").collection("quotes")
    const users = client.db("quoteapp").collection("users")

    // Build query
    const query = {}

    if (search) {
      query.$or = [
        { text: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ]
    }

    if (category !== "all") {
      query.category = category
    }

    // Build sort
    let sortQuery = {}
    switch (sort) {
      case "oldest":
        sortQuery = { createdAt: 1 }
        break
      case "most-liked":
        sortQuery = { likesCount: -1 }
        break
      case "most-commented":
        sortQuery = { commentsCount: -1 }
        break
      default:
        sortQuery = { createdAt: -1 }
    }

    const skip = (page - 1) * limit

    const quotesData = await quotes.find(query).sort(sortQuery).skip(skip).limit(limit).toArray()

    // Enrich quotes with user profile pictures and comment user images
    const enrichedQuotes = await Promise.all(
      quotesData.map(async (quote) => {
        try {
          // Get quote author's profile picture
          let user = null

          // Try to find by userId (which should now be the MongoDB _id)
          if (quote.userId && ObjectId.isValid(quote.userId)) {
            user = await users.findOne({ _id: new ObjectId(quote.userId) })
          }

          // Fallback: try to find by email
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

                  // Try by userId first
                  if (comment.userId && ObjectId.isValid(comment.userId)) {
                    commentUser = await users.findOne({ _id: new ObjectId(comment.userId) })
                  }

                  // Fallback: try by email
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
            userId: quote.userId, // This should now be the correct MongoDB _id
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

    const total = await quotes.countDocuments(query)

    return NextResponse.json({
      quotes: enrichedQuotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { text, author, category } = await request.json()

    if (!text || !author) {
      return NextResponse.json({ message: "Text and author are required" }, { status: 400 })
    }

    const client = await clientPromise
    const quotes = client.db("quoteapp").collection("quotes")
    const users = client.db("quoteapp").collection("users")

    // Find the user by their MongoDB _id (which is now session.user.id)
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const newQuote = {
      text,
      author,
      category: category || "",
      userId: session.user.id, // This is now the MongoDB _id
      userName: session.user.name,
      userEmail: session.user.email, // Store email for fallback lookup
      userImage: user.profilePicture || user.image || "",
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await quotes.insertOne(newQuote)

    return NextResponse.json({ message: "Quote created successfully", quoteId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating quote:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
