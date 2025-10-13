"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Trash2, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Comment {
  id: string
  content: string
  created_at: string
  author_id: string
  parent_comment_id: string | null
  profiles: {
    id: string
    name: string
    avatar_url: string | null
  }
}

interface CommentSectionProps {
  postId: string
  currentUserId: string
  usernameToIdMap: Record<string, string>
}

export function CommentSection({ postId, currentUserId, usernameToIdMap }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({})
  const router = useRouter()

    // Live search for taggable users
  const searchUsers = async (query: string) => {
    if (!query) return []
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", `${query}%`)
      .limit(5)
    return data
  }

  const handleTagInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNewComment(value)

    const match = value.match(/@(\w*)$/)
    if (match) {
      const query = match[1]
      if (query.length > 0) {
        const results = await searchUsers(query)
        setTagResults(results || [])
      } else {
        setTagResults([])
      }
    } else {
      setTagResults([])
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  

  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments, postId])

  const fetchComments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles!comments_author_id_fkey (
          id,
          name,
          avatar_url
        )
      `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
      return
    }

    if (data) {
      setComments(data as Comment[])
      // Fetch likes for all comments
      await fetchAllCommentLikes(data.map((c) => c.id))
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchAllCommentLikes = async (commentIds: string[]) => {
    const supabase = createClient()
    const likesData: Record<string, { count: number; isLiked: boolean }> = {}

    for (const commentId of commentIds) {
      // Get count
      const { count } = await supabase
        .from("comment_likes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId)

      // Check if user liked
      const { data } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", currentUserId)
        .single()

      likesData[commentId] = {
        count: count || 0,
        isLiked: !!data,
      }
    }

    setCommentLikes(likesData)
  }

  const handleLikeComment = async (commentId: string) => {
    const supabase = createClient()
    const currentLike = commentLikes[commentId] || { count: 0, isLiked: false }

    try {
      if (currentLike.isLiked) {
        // Unlike
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId)

        if (error) throw error

        setCommentLikes((prev) => ({
          ...prev,
          [commentId]: { count: prev[commentId].count - 1, isLiked: false },
        }))
      } else {
        // Like
        const { error } = await supabase.from("comment_likes").insert({
          comment_id: commentId,
          user_id: currentUserId,
        })

        if (error) throw error

        setCommentLikes((prev) => ({
          ...prev,
          [commentId]: { count: (prev[commentId]?.count || 0) + 1, isLiked: true },
        }))
      }
    } catch (error) {
      console.error("Error toggling comment like:", error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!newComment.trim()) return

  setIsLoading(true)
  const supabase = createClient()

  try {
    // 1️⃣ Insert the comment
    const { data: insertedComments, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: currentUserId,
        content: newComment.trim(),
        parent_comment_id: null,
      })
      .select()

    if (error) throw error

    const insertedComment = insertedComments?.[0]

    // 2️⃣ Extract tagged usernames
    const taggedUsernames = newComment.match(/@(\w+)/g)?.map((u) => u.slice(1)) || []

    if (taggedUsernames.length > 0 && insertedComment) {
      // 3️⃣ Match to user IDs using the provided map
      const taggedUsers = taggedUsernames
        .map((username) => usernameToIdMap?.[username])
        .filter(Boolean)

      // 4️⃣ Insert into comment_tags
      if (taggedUsers.length > 0) {
        const tagRecords = taggedUsers.map((userId) => ({
          comment_id: insertedComment.id,
          tagged_user_id: userId,
        }))

        const { error: tagError } = await supabase.from("comment_tags").insert(tagRecords)
        if (tagError) console.error("Error inserting comment tags:", tagError)
      }
    }

    setNewComment("")
    await fetchComments()
    router.refresh()
  } catch (error) {
    console.error("Error adding comment:", error)
    alert("Failed to add comment. Please try again.")
  } finally {
    setIsLoading(false)
  }
}


  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          author_id: currentUserId,
          content: replyContent.trim(),
          parent_comment_id: parentId,
        })
        .select()

      if (error) {
        console.error("Error inserting reply:", error)
        throw error
      }

      setReplyContent("")
      setReplyingTo(null)
      await fetchComments()
      router.refresh()
    } catch (error) {
      console.error("Error adding reply:", error)
      alert("Failed to add reply. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId)

      if (error) throw error

      await fetchComments()
      router.refresh()
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment")
    }
  }

  const topLevelComments = comments.filter((c) => !c.parent_comment_id)
  const getReplies = (commentId: string) => comments.filter((c) => c.parent_comment_id === commentId)

  const renderContentWithMentions = (content: string) => {
    return content.split(/(@\w+)/g).map((part, idx) => {
      if (part.startsWith("@")) {
        const username = part.slice(1)
        const userId = usernameToIdMap[username]

        if (userId) {
          return (
            <Link key={idx} href={`/profile/${userId}`} className="text-blue-600 hover:underline cursor-pointer">
              {part}
            </Link>
          )
        } else {
          return (
            <span key={idx} className="text-gray-500">
              {part}
            </span>
          )
        }
      }
      return <span key={idx}>{part}</span>
    })
  }

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="text-amber-700 hover:text-amber-900 hover:bg-amber-50"
      >
        <MessageCircle className="h-4 w-4 mr-2" />

        {comments.length === 0
          ? "| Add Comment"
          : `${comments.length} ${comments.length === 1 ? "| View Comment" : "| View Comments"}`}
      </Button>

      {showComments && (
        <div className="space-y-4 pt-2 border-t border-amber-200">
          <form onSubmit={handleAddComment} className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => {
  setNewComment(e.target.value)
  handleTagInputChange(e)
}}

              rows={2}
              className="resize-none w-full"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
                <Send className="h-3 w-3 mr-2" />
                Comment
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {topLevelComments.map((comment) => {
              const likes = commentLikes[comment.id] || { count: 0, isLiked: false }
              return (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-2">
                    <Link href={`/profile/${comment.profiles.id}`}>
                      <Avatar className="h-8 w-8 border border-amber-200 cursor-pointer hover:border-amber-400 transition-colors">
                        <AvatarImage src={comment.profiles.avatar_url || undefined} alt={comment.profiles.name} />
                        <AvatarFallback className="text-sm bg-amber-100">
                          {getAnimalAvatar(comment.profiles.id)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${comment.profiles.id}`}>
                            <p className="font-semibold text-sm text-amber-900 hover:text-amber-700 cursor-pointer transition-colors">
                              {comment.profiles.name}
                            </p>
                          </Link>
                          <p className="text-xs text-amber-600">{formatDate(comment.created_at)}</p>
                        </div>
                        {comment.author_id === currentUserId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-amber-900 whitespace-pre-wrap">
                        {renderContentWithMentions(comment.content)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeComment(comment.id)}
                          className={`h-6 px-2 text-xs ${
                            likes.isLiked ? "text-red-600 hover:text-red-700" : "text-amber-700 hover:text-amber-900"
                          } hover:bg-amber-100`}
                        >
                          <Heart className={`h-3 w-3 mr-1 ${likes.isLiked ? "fill-current" : ""}`} />
                          {likes.count}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="h-6 px-2 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>

                  {replyingTo === comment.id && (
                    <div className="ml-10 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAddReply(comment.id)}
                          disabled={isLoading}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          <Send className="h-3 w-3 mr-2" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}

                  {getReplies(comment.id).map((reply) => {
                    const replyLikes = commentLikes[reply.id] || { count: 0, isLiked: false }
                    return (
                      <div key={reply.id} className="ml-10 flex gap-2">
                        <Link href={`/profile/${reply.profiles.id}`}>
                          <Avatar className="h-7 w-7 border border-amber-200 cursor-pointer hover:border-amber-400 transition-colors">
                            <AvatarImage src={reply.profiles.avatar_url || undefined} alt={reply.profiles.name} />
                            <AvatarFallback className="text-xs bg-amber-100">
                              {getAnimalAvatar(reply.profiles.id)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 bg-amber-50 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Link href={`/profile/${reply.profiles.id}`}>
                                <p className="font-semibold text-xs text-amber-900 hover:text-amber-700 cursor-pointer transition-colors">
                                  {reply.profiles.name}
                                </p>
                              </Link>
                              <p className="text-xs text-amber-600">{formatDate(reply.created_at)}</p>
                            </div>
                            {reply.author_id === currentUserId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteComment(reply.id)}
                                className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-amber-900 whitespace-pre-wrap">
                            {renderContentWithMentions(reply.content)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikeComment(reply.id)}
                            className={`h-5 px-2 mt-1 text-xs ${
                              replyLikes.isLiked
                                ? "text-red-600 hover:text-red-700"
                                : "text-amber-700 hover:text-amber-900"
                            } hover:bg-amber-100`}
                          >
                            <Heart className={`h-3 w-3 mr-1 ${replyLikes.isLiked ? "fill-current" : ""}`} />
                            {replyLikes.count}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
