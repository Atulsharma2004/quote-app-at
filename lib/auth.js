import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import clientPromise from "./mongodb"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const client = await clientPromise
        const users = client.db("quoteapp").collection("users")

        const user = await users.findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const client = await clientPromise
        const users = client.db("quoteapp").collection("users")

        const existingUser = await users.findOne({ email: user.email })

        if (!existingUser) {
          const result = await users.insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            profilePicture: user.image || "",
            role: "user",
            bio: "",
            followers: [],
            following: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          // Set the user id to the MongoDB _id
          user.id = result.insertedId.toString()
        } else {
          // Set the user id to the existing MongoDB _id
          user.id = existingUser._id.toString()
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        // For Google users, we need to get the MongoDB _id
        if (account?.provider === "google") {
          const client = await clientPromise
          const users = client.db("quoteapp").collection("users")
          const dbUser = await users.findOne({ email: user.email })
          if (dbUser) {
            token.sub = dbUser._id.toString()
          }
        } else {
          // For credentials users, use the returned id
          token.sub = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
}
