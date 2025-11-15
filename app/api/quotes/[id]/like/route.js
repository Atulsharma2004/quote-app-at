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
    const client = await clientPromise
    const quotes = client.db("quoteapp").collection("quotes")

    const quote = await quotes.findOne({ _id: new ObjectId(id) })
    if (!quote) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 })
    }

    const userId = session.user.id
    const isLiked = quote.likes?.includes(userId)

    let updateQuery
    if (isLiked) {
      // Unlike
      updateQuery = {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      }
    } else {
      // Like
      updateQuery = {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      }
    }

    await quotes.updateOne({ _id: new ObjectId(id) }, updateQuery)

    return NextResponse.json({ message: "Success" })
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
