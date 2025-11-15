import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "QuoteShare - Share Inspiring Quotes",
  description:
    "A platform to share and discover inspiring quotes. Connect with others through the power of meaningful words.",
  keywords: "quotes, inspiration, wisdom, motivation, sharing, community",
  authors: [{ name: "QuoteShare Team" }],
  openGraph: {
    title: "QuoteShare - Share Inspiring Quotes",
    description: "Discover, share, and connect through meaningful quotes",
    type: "website",
  },
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
