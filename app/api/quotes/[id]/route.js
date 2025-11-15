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

export async function DELETE(request, { params }) {
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

    // Check if user owns the quote or is admin
    if (quote.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await quotes.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Quote deleted successfully" })
  } catch (error) {
    console.error("Error deleting quote:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { id } = await params
    const { text, author, category } = await request.json()

    if (!text || !author) {
      return NextResponse.json({ message: "Text and author are required" }, { status: 400 })
    }

    const client = await clientPromise
    const quotes = client.db("quoteapp").collection("quotes")

    const quote = await quotes.findOne({ _id: new ObjectId(id) })
    if (!quote) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 })
    }

    // Check if user owns the quote or is admin
    if (quote.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await quotes.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          text,
          author,
          category: category || "",
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Quote updated successfully" })
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
