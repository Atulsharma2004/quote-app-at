import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { name, email, password, profilePicture } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const client = await clientPromise
    const users = client.db("quoteapp").collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with profile picture
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
      bio: "",
      image: profilePicture || "", // Store base64 image
      profilePicture: profilePicture || "", // Also store in profilePicture field for clarity
      followers: [],
      following: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ message: "User created successfully", userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
