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

    const quote = await quotes.findOne({ _id: new ObjectId(id) })

    if (!quote) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 })
    }

    // Convert ObjectId to string for JSON serialization
    const serializedQuote = {
      ...quote,
      _id: quote._id.toString(),
    }

    return NextResponse.json(serializedQuote)
  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
