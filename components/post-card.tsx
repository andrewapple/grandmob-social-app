"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { CommentSection } from "./comment-section"
import Link from "next/link"

interface Post {
  id: string
  content: string | null
  image_url: string | null
  video_url: string | null
  created_at: string
  author_id: string
  profiles: {
    id: string
    name: string
    avatar_url: string | null
  }
}

interface PostCardProps {
  post: Post
  currentUserId: string
  usernameToIdMap: Record<string, string>
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchLikes()
  }, [post.id, currentUserId])

  const fetchLikes = async () => {
    const supabase = createClient()

    // Get total likes count
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id)

    setLikesCount(count || 0)

    // Check if current user liked this post
    const { data } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", currentUserId)
      .single()

    setIsLiked(!!data)
  }

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    const supabase = createClient()

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)

        if (error) throw error

        setIsLiked(false)
        setLikesCount((prev) => prev - 1)
      } else {
        // Like
        const { error } = await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })

        if (error) throw error

        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const getAnimalAvatar = (id: string) => {
    const animals = ["🦁", "🐼", "🦊", "🐨", "🐸", "🦉", "🐷", "🐮", "🐵", "🐶"]
    const index = Number.parseInt(id.slice(0, 8), 16) % animals.length
    return animals[index]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Failed to delete post")
    } finally {
      setIsDeleting(false)
    }
  }

  const isOwnPost = post.author_id === currentUserId

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.profiles.id}`}>
              <Avatar className="h-10 w-10 border-2 border-amber-200 cursor-pointer hover:border-amber-400 transition-colors">
                <AvatarImage src={post.profiles.avatar_url || undefined} alt={post.profiles.name} />
                <AvatarFallback className="text-lg bg-amber-100">{getAnimalAvatar(post.profiles.id)}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.profiles.id}`}>
                <p className="font-semibold text-amber-900 hover:text-amber-700 cursor-pointer transition-colors">
                  {post.profiles.name}
                </p>
              </Link>
              <p className="text-sm text-amber-600">{formatDate(post.created_at)}</p>
            </div>
          </div>
          {isOwnPost && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {post.content && <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">{post.content}</p>}
        {post.image_url && (
          <img
            src={post.image_url || "/placeholder.svg"}
            alt="Post image"
            className="rounded-lg w-full object-cover max-h-96"
          />
        )}

        {post.video_url && <video src={post.video_url} controls className="rounded-lg w-full max-h-96" />}

        <div className="flex items-center gap-4 pt-2 border-t border-amber-200 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`${isLiked ? "text-red-600 hover:text-red-700" : "text-amber-700 hover:text-amber-900"} hover:bg-amber-50`}
          >
            <Heart className={`${isLiked ? "fill-current" : ""} h-4 w-4 mr-2`} />
            {likesCount} {likesCount === 1 ? "Like" : "Likes"}
          </Button>

          <CommentSection postId={post.id} currentUserId={currentUserId} />
        </div>
      </CardContent>
    </Card>
  )
}
