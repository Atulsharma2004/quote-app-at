import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { id } = await params
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ message: "Comment text is required" }, { status: 400 })
    }

    const client = await clientPromise
    const quotes = client.db("quoteapp").collection("quotes")
    const users = client.db("quoteapp").collection("users")

    // Get user's profile picture for the comment
    let userImage = ""
    try {
      const user = await users.findOne({ email: session.user.email })
      userImage = user?.profilePicture || user?.image || ""
    } catch (error) {
      console.error("Error fetching user image for comment:", error)
    }

    const comment = {
      _id: new ObjectId(),
      text,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email, // Store email for fallback lookup
      userImage: userImage,
      createdAt: new Date(),
    }

    await quotes.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { comments: comment },
        $inc: { commentsCount: 1 },
      },
    )

    return NextResponse.json({ message: "Comment added successfully" })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
