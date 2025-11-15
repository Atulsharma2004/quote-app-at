import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("quoteapp")

    // Use Promise.allSettled to prevent one failure from breaking everything
    const [quotesResult, usersResult] = await Promise.allSettled([
      db.collection("quotes").countDocuments(),
      db.collection("users").countDocuments(),
    ])

    const quotesCount = quotesResult.status === "fulfilled" ? quotesResult.value : 0
    const usersCount = usersResult.status === "fulfilled" ? usersResult.value : 0

    return NextResponse.json(
      { quotesCount, usersCount },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { quotesCount: 0, usersCount: 0 },
      { status: 200 }, // Return 200 with default values instead of error
    )
  }
}
