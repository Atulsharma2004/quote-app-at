import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request, { params }) {
  try {
    if (!params || !params.id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id: targetUserId } = await params
    const currentUserId = session.user.id

    console.log("Follow API - targetUserId:", targetUserId, "currentUserId:", currentUserId)

    if (!targetUserId || !currentUserId) {
      return NextResponse.json({ message: "Invalid user IDs" }, { status: 400 })
    }

    // Can't follow yourself
    if (currentUserId === targetUserId) {
      return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 })
    }

    const client = await clientPromise
    const users = client.db("quoteapp").collection("users")

    // Find current user
    const currentUser = await users.findOne({ _id: new ObjectId(currentUserId) })
    if (!currentUser) {
      return NextResponse.json({ message: "Current user not found" }, { status: 404 })
    }

    // Find target user
    const targetUser = await users.findOne({ _id: new ObjectId(targetUserId) })
    if (!targetUser) {
      console.log("Target user not found for follow action")
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const currentUserObjectId = currentUser._id.toString()
    const targetUserObjectId = targetUser._id.toString()

    // Initialize arrays if they don't exist
    const currentUserFollowing = currentUser.following || []

    // Check if already following
    const isFollowing = currentUserFollowing.includes(targetUserObjectId)

    if (isFollowing) {
      // Unfollow
      await Promise.all([
        users.updateOne(
          { _id: currentUser._id },
          {
            $pull: { following: targetUserObjectId },
            $set: { updatedAt: new Date() },
          },
        ),
        users.updateOne(
          { _id: targetUser._id },
          {
            $pull: { followers: currentUserObjectId },
            $set: { updatedAt: new Date() },
          },
        ),
      ])

      return NextResponse.json({
        message: "Unfollowed successfully",
        isFollowing: false,
        action: "unfollowed",
      })
    } else {
      // Follow
      await Promise.all([
        users.updateOne(
          { _id: currentUser._id },
          {
            $addToSet: { following: targetUserObjectId },
            $set: { updatedAt: new Date() },
          },
        ),
        users.updateOne(
          { _id: targetUser._id },
          {
            $addToSet: { followers: currentUserObjectId },
            $set: { updatedAt: new Date() },
          },
        ),
      ])

      return NextResponse.json({
        message: "Followed successfully",
        isFollowing: true,
        action: "followed",
      })
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
