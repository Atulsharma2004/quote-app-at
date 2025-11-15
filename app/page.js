import Link from "next/link"
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote, Users, Heart, MessageCircle, Star } from "lucide-react"
import Navbar from "@/components/navbar"

// Separate components for better code splitting
function HeroSection({ session, stats }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <Quote className="h-16 w-16 text-blue-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Share Wisdom, Inspire Others</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover, share, and connect through the power of meaningful quotes. Join our community of{" "}
          {stats.usersCount > 0 ? stats.usersCount : "many"} wisdom seekers and explore{" "}
          {stats.quotesCount > 0 ? stats.quotesCount : "inspiring"} quotes.
        </p>

        {session ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-quote">
              <Button size="lg" className="px-8 py-3 text-lg">
                Share a Quote
              </Button>
            </Link>
            <Link href="/quotes">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
                Explore Quotes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/quotes">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
                Explore Quotes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function StatsSection({ stats }) {
  return (
    <section className="py-12 px-4 bg-white/50">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Quote className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.quotesCount || 0}</div>
            <div className="text-sm text-gray-600">Quotes Shared</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.usersCount || 0}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">∞</div>
            <div className="text-sm text-gray-600">Inspiration</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">100%</div>
            <div className="text-sm text-gray-600">Free to Use</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RecentQuotesSection({ quotes }) {
  if (!quotes || quotes.length === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Wisdom</h2>
          <p className="text-gray-600">Discover what our community is sharing</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quotes.slice(0, 3).map((quote) => (
            <Card key={quote._id} className="bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
              <CardHeader className="text-center">
                <blockquote className="text-lg italic text-gray-800 mb-3">
                  &quot;{quote.text.length > 100 ? quote.text.substring(0, 100) + "..." : quote.text}&quot;
                </blockquote>
                <p className="text-sm text-gray-600">— {quote.author}</p>
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {quote.likesCount || 0}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {quote.commentsCount || 0}
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/quotes">
            <Button variant="outline" size="lg">
              View All Quotes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Loading components
function StatsLoading() {
  return (
    <section className="py-12 px-4 bg-white/50">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Async data fetching components
async function AppStats() {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/stats`, {
      signal: controller.signal,
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error("Failed to fetch stats")
    }

    const stats = await response.json()
    return <StatsSection stats={stats} />
  } catch (error) {
    console.error("Error fetching stats:", error)
    // Return default stats on error
    return <StatsSection stats={{ quotesCount: 0, usersCount: 0 }} />
  }
}

async function RecentQuotes() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/quotes/recent`, {
      signal: controller.signal,
      next: { revalidate: 180 }, // Cache for 3 minutes
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error("Failed to fetch quotes")
    }

    const data = await response.json()
    return <RecentQuotesSection quotes={data.quotes} />
  } catch (error) {
    console.error("Error fetching recent quotes:", error)
    return null // Don't show section on error
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Hero Section - Always loads first */}
      <HeroSection session={session} stats={{ quotesCount: 0, usersCount: 0 }} />

      {/* Stats Section - Loads with Suspense */}
      <Suspense fallback={<StatsLoading />}>
        <AppStats />
      </Suspense>

      {/* Recent Quotes - Loads with Suspense */}
      <Suspense fallback={<div className="py-16"></div>}>
        <RecentQuotes />
      </Suspense>

      {/* Features Section - Static content */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose QuoteShare?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Quote className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Share Your Wisdom</CardTitle>
                <CardDescription>
                  Post your favorite quotes and inspire others with meaningful words. Build your personal collection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Connect with Others</CardTitle>
                <CardDescription>
                  Follow users, build your network, and discover new perspectives from like-minded individuals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Engage & Interact</CardTitle>
                <CardDescription>
                  Like, comment, and share quotes that resonate with you. Join meaningful conversations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your free account in seconds with email or Google</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Quotes</h3>
              <p className="text-gray-600">Post your favorite quotes and categorize them for easy discovery</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Inspire</h3>
              <p className="text-gray-600">Engage with the community through likes, comments, and follows</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Sharing?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our growing community and start your journey of sharing wisdom today.
          </p>
          {session ? (
            <Link href="/create-quote">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Create Your First Quote
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Create Your Account
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Quote className="h-6 w-6" />
                <span className="text-lg font-semibold">QuoteShare</span>
              </div>
              <p className="text-gray-400 mb-4">
                A platform dedicated to sharing wisdom and inspiring others through meaningful quotes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/quotes" className="block text-gray-400 hover:text-white">
                  All Quotes
                </Link>
                <Link href="/create-quote" className="block text-gray-400 hover:text-white">
                  Share Quote
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <Link href="/quotes?category=motivation" className="block text-gray-400 hover:text-white">
                  Motivation
                </Link>
                <Link href="/quotes?category=wisdom" className="block text-gray-400 hover:text-white">
                  Wisdom
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 QuoteShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
