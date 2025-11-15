"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Edit, Trash2, User } from "lucide-react"
import Link from "next/link"
import FollowButton from "@/components/follow-button"
// import { translateText } from "@/lib/translateText"
import { generateTranslateUrl } from "@/lib/translateText"
import { useDispatch, useSelector } from "react-redux"
import { setLanguage } from "@/lib/store"


const languages = {
  en: "English",
  hi: "Hindi",
  fr: "French",
  tr: "Turkish",
  es: "Spanish",
  ta: "Tamil",
  mr: "Marathi",
}

export default function QuoteCard({ quote, onLike, onComment, onDelete, onEdit }) {
  const { data: session } = useSession()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)


  //------------------------------------------------------------------------------

  // const lang = useSelector((state) => state.language.selected)
  // const [translatedText, setTranslatedText] = useState(quote.text)
  // const [translatedAuthor, setTranslatedAuthor] = useState(quote.author)
  // const [translatedUserName, setTranslatedUserName] = useState(quote.userName)
  // const [translatedComments, setTranslatedComments] = useState(quote.comments || [])

  // useEffect(() => {
  //   if (lang === "en") return

  //   const translateAll = async () => {
  //     const [text, author, user] = await Promise.all([
  //       translateText(quote.text, lang),
  //       translateText(quote.author, lang),
  //       translateText(quote.userName, lang),
  //     ])
  //     const commentTranslations = await Promise.all(
  //       quote.comments.map(async (c) => ({
  //         ...c,
  //         userName: await translateText(c.userName, lang),
  //         text: await translateText(c.text, lang),
  //       }))
  //     )

  //     setTranslatedText(text)
  //     setTranslatedAuthor(author)
  //     setTranslatedUserName(user)
  //     setTranslatedComments(commentTranslations)
  //   }

  //   translateAll()
  // }, [lang, quote])

  const selectedLang = useSelector((state) => state.language.selected)
  const dispatch = useDispatch()
  const [showIframe, setShowIframe] = useState(false)

  const translateUrl = generateTranslateUrl(quote.text, selectedLang)

 const handleTranslateClick = () => {
  window.open(translateUrl, "_blank")
}


  const handleCancelTranslation = () => {
    setShowIframe(false)
  }

  

  //---------------------------------------------------------------------------

  const handleLike = async () => {
    if (!session) return
    await onLike(quote._id)
  }

  const handleComment = async () => {
    if (!session || !newComment.trim()) return

    setIsSubmittingComment(true)
    await onComment(quote._id, newComment)
    setNewComment("")
    setIsSubmittingComment(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Quote from QuoteShare",
          text: `"${quote.text}" - ${quote.author}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`"${quote.text}" - ${quote.author}`)
      alert("Quote copied to clipboard!")
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(quote)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(quote._id)
    }
  }

  const isLiked = session && quote.likes?.includes(session.user.id)
  const canEdit = session && (session.user.id === quote.userId || session.user.role === "admin")

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader className="pb-3 relative">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${quote.userId}`}>
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
              <AvatarImage
                src={quote.userImage || "https://thumb.ac-illust.com/51/51e1c1fc6f50743937e62fca9b942694_t.jpeg"}
                alt={quote.userName}
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1">
            <Link
              href={`/profile/${quote.userId}`}
              className="font-semibold hover:underline hover:text-blue-600 transition-colors"
            >
              {quote.userName}
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(quote.createdAt).toLocaleDateString()}
            </p>
          </div>

          {session && session.user.id !== quote.userId && (
            <FollowButton userId={quote.userId} />
          )}

          {canEdit && (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                title="Edit quote"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                title="Delete quote"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Language Selector + Translate Button in header center */}
        <div className="flex justify-center items-center mt-4 space-x-2">
          <select
            value={selectedLang}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            className="p-1 rounded-md border border-gray-300 text-sm"
          >
            {Object.entries(languages).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={handleTranslateClick}>
            Translate
          </Button>
        </div>
      </CardHeader>

      {showIframe ? (
        <div className="relative">
          {/* <iframe
            src={translateUrl}
            className="w-full h-[300px] rounded-b-md border-t"
          ></iframe> */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelTranslation}
            className="absolute top-2 right-2 bg-white"
          >
            {/* <X className="h-4 w-4 mr-1" /> */}
            Cancel Translation
          </Button>
        </div>
      ) : (
        <CardContent>
          <blockquote className="text-lg italic text-gray-800 mb-2">
            "{quote.text}"
          </blockquote>
          <p className="text-right text-gray-600">— {quote.author}</p>
          {quote.category && (
            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {quote.category}
            </span>
          )}
        </CardContent>
      )}

      <CardFooter className="pt-0">
        <div className="flex items-center space-x-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              isLiked ? "text-red-500" : ""
            }`}
            disabled={!session}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{quote.likes?.length || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{quote.comments?.length || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 w-full">
            <div className="space-y-3 mb-4">
              {quote.comments?.map((comment, index) => (
                <div key={index} className="flex space-x-2">
                  <Link href={`/profile/${comment.userId}`}>
                    <Avatar className="h-6 w-6 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                      <AvatarImage
                        src={comment.userImage || "https://thumb.ac-illust.com/51/51e1c1fc6f50743937e62fca9b942694_t.jpeg"}
                        alt={comment.userName}
                      />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <p className="text-sm">
                      <Link
                        href={`/profile/${comment.userId}`}
                        className="font-semibold hover:underline hover:text-blue-600 transition-colors"
                      >
                        {comment.userName}
                      </Link>{" "}
                      {comment.text}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {session && (
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[60px]"
                />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  size="sm"
                >
                  {isSubmittingComment ? "Posting..." : "Post"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
