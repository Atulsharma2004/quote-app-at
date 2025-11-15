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

    const { id: userId } = await params
    const client = await clientPromise
    const users = client.db("quoteapp").collection("users")

    console.log("Fetching following for user:", userId)

    // Find the user
    const user = await users.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      console.log("User not found:", userId)
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log("User found, following array:", user.following)

    // Get following details
    const followingIds = user.following || []

    if (followingIds.length === 0) {
      return NextResponse.json({ following: [] })
    }

    // Convert following IDs to ObjectIds for querying
    const followingObjectIds = followingIds
      .map((id) => {
        if (typeof id === "string" && ObjectId.isValid(id)) {
          return new ObjectId(id)
        } else if (id instanceof ObjectId) {
          return id
        } else {
          console.log("Invalid following ID:", id)
          return null
        }
      })
      .filter((id) => id !== null)

    console.log("Converted following ObjectIds:", followingObjectIds)

    // Fetch all following users in one query
    const following = await users
      .find(
        { _id: { $in: followingObjectIds } },
        { projection: { name: 1, email: 1, profilePicture: 1, image: 1, bio: 1 } },
      )
      .toArray()

    console.log("Found following users:", following.length)

    // Format the response
    const formattedFollowing = following.map((followedUser) => ({
      id: followedUser._id.toString(),
      name: followedUser.name,
      email: followedUser.email,
      profilePicture: followedUser.profilePicture || followedUser.image || "",
      bio: followedUser.bio || "",
    }))

    return NextResponse.json({ following: formattedFollowing })
  } catch (error) {
    console.error("Error fetching following:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
