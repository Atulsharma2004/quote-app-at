import { Quote } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Quote className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading QuoteShare</h2>
        <p className="text-gray-600">Preparing your wisdom...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  )
}
