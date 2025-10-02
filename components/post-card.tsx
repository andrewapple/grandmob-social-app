"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Post {
  id: string
  content: string | null
  image_url: string | null
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
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

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
            <Avatar className="h-10 w-10 border-2 border-amber-200">
              <AvatarImage src={post.profiles.avatar_url || undefined} alt={post.profiles.name} />
              <AvatarFallback className="text-lg bg-amber-100">{getAnimalAvatar(post.profiles.id)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-amber-900">{post.profiles.name}</p>
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
      </CardContent>
    </Card>
  )
}
