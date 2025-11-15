import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const quotes = client.db("quoteapp").collection("quotes")

    const recentQuotes = await quotes
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .project({
        text: 1,
        author: 1,
        likesCount: 1,
        commentsCount: 1,
        createdAt: 1,
      })
      .toArray()

    const serializedQuotes = recentQuotes.map((quote) => ({
      ...quote,
      _id: quote._id.toString(),
    }))

    return NextResponse.json(
      { quotes: serializedQuotes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=180, stale-while-revalidate=360",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching recent quotes:", error)
    return NextResponse.json({ quotes: [] }, { status: 200 })
  }
}
