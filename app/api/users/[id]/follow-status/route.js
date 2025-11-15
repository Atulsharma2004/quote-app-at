import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    console.log("Follow-status API called")

    if (!params || !params.id) {
      console.error("No user ID provided in params")
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("No session found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id: targetUserId } = await params
    console.log("Target user ID:", targetUserId)
    console.log("Current user ID:", session.user.id)

    const client = await clientPromise
    const users = client.db("quoteapp").collection("users")

    // Find current user
    const currentUser = await users.findOne({ _id: new ObjectId(session.user.id) })
    if (!currentUser) {
      console.log("Current user not found:", session.user.id)
      return NextResponse.json({ message: "Current user not found" }, { status: 404 })
    }

    // Find target user
    const targetUser = await users.findOne({ _id: new ObjectId(targetUserId) })
    if (!targetUser) {
      console.log("Target user not found:", targetUserId)
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log("Both users found successfully")
    console.log("Current user following:", currentUser.following)
    console.log("Target user followers:", targetUser.followers)

    const currentUserObjectId = currentUser._id.toString()
    const targetUserObjectId = targetUser._id.toString()

    // Initialize arrays if they don't exist
    const currentUserFollowing = currentUser.following || []
    const targetUserFollowers = targetUser.followers || []
    const targetUserFollowing = targetUser.following || []

    // Check if current user is following target user
    // Need to handle both string and ObjectId formats
    const isFollowing = currentUserFollowing.some((followingId) => {
      const followingIdStr = followingId instanceof ObjectId ? followingId.toString() : followingId
      return followingIdStr === targetUserObjectId
    })

    const isOwnProfile = currentUserObjectId === targetUserObjectId

    console.log("Follow status result:", { isFollowing, isOwnProfile })

    return NextResponse.json({
      isFollowing,
      isOwnProfile,
      followersCount: targetUserFollowers.length,
      followingCount: targetUserFollowing.length,
    })
  } catch (error) {
    console.error("Error getting follow status:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
