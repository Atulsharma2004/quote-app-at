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

    console.log("Fetching followers for user:", userId)

    // Find the user
    const user = await users.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      console.log("User not found:", userId)
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log("User found, followers array:", user.followers)

    // Get followers details
    const followerIds = user.followers || []

    if (followerIds.length === 0) {
      return NextResponse.json({ followers: [] })
    }

    // Convert follower IDs to ObjectIds for querying
    const followerObjectIds = followerIds
      .map((id) => {
        if (typeof id === "string" && ObjectId.isValid(id)) {
          return new ObjectId(id)
        } else if (id instanceof ObjectId) {
          return id
        } else {
          console.log("Invalid follower ID:", id)
          return null
        }
      })
      .filter((id) => id !== null)

    console.log("Converted follower ObjectIds:", followerObjectIds)

    // Fetch all followers in one query
    const followers = await users
      .find(
        { _id: { $in: followerObjectIds } },
        { projection: { name: 1, email: 1, profilePicture: 1, image: 1, bio: 1 } },
      )
      .toArray()

    console.log("Found followers:", followers.length)

    // Format the response
    const formattedFollowers = followers.map((follower) => ({
      id: follower._id.toString(),
      name: follower.name,
      email: follower.email,
      profilePicture: follower.profilePicture || follower.image || "",
      bio: follower.bio || "",
    }))

    console.log("Final formatted followers:", formattedFollowers)
    console.log("Returning followers count:", formattedFollowers.length)

    return NextResponse.json({
      followers: formattedFollowers,
      debug: {
        originalFollowerIds: followerIds,
        convertedObjectIds: followerObjectIds.map((id) => id.toString()),
        foundFollowersCount: followers.length,
      },
    })
  } catch (error) {
    console.error("Error fetching followers:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
