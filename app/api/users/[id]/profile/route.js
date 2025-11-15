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

    const { id } = await params
    const client = await clientPromise
    const users = client.db("quoteapp").collection("users")

    let user = null

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      user = await users.findOne({ _id: new ObjectId(id) })
    }

    // If not found and it's the current user, try by email
    if (!user && id === session.user.id) {
      user = await users.findOne({ email: session.user.email })
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user profile data
    const profileData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      profilePicture: user.profilePicture || user.image || "",
      role: user.role || "user",
      followers: user.followers || [],
      following: user.following || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
