import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, bio, profilePicture } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    const client = await clientPromise
    const users = client.db("quoteapp").collection("users")

    // Update user profile
    const updateData = {
      name,
      bio: bio || "",
      updatedAt: new Date(),
    }

    // Only update profile picture if provided
    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture
      updateData.image = profilePicture // Also update image field for compatibility
    }

    await users.updateOne({ email: session.user.email }, { $set: updateData })

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
