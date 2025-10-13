"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, Send, Video } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { WishlistDialog } from "./wishlist-dialog"
import { extractUsernames } from "@/lib/textHelpers";


interface CreatePostProps {
  userId: string
  userName: string
}

export function CreatePost({ userId, userName }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 📹 Upload video to Supabase Storage
  async function uploadVideo(file: File) {
    const filePath = `videos/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage.from("videos").upload(filePath, file)
    if (error) {
      console.error("Upload error:", error)
      return null
    }

    const { data: publicData } = supabase.storage.from("videos").getPublicUrl(filePath)
    return publicData.publicUrl
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        alert("Video file size must be less than 100MB")
        return
      }
      setVideoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setVideoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleRemoveVideo = () => {
    setVideoFile(null)
    setVideoPreview(null)
  }

  // 🧩 Step 3–5: Tagging logic integrated into handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !imageFile && !videoFile) {
      alert("Please add some content, an image, or a video")
      return
    }

    setIsLoading(true)

    try {
      let imageUrl: string | null = null
      let videoUrl: string | null = null

      // Upload image via your /api/upload route
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        const response = await fetch("/api/upload", { method: "POST", body: formData })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to upload image")
        }

        const data = await response.json()
        imageUrl = data.url
      }

      // Upload video to Supabase storage
      if (videoFile) {
        videoUrl = await uploadVideo(videoFile)
        if (!videoUrl) throw new Error("Failed to upload video")
      }

      // 👉 Extract tagged usernames
      const taggedUsernames = extractUsernames(content)

      // ✅ Insert post first
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          author_id: userId,
          content: content.trim() || null,
          image_url: imageUrl,
          video_url: videoUrl,
        })
        .select()
        .single()

      if (postError) throw postError

      // 🔍 Validate tagged usernames and insert into post_tags
      if (taggedUsernames.length > 0) {
        const { data: validUsers, error: userError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("username", taggedUsernames)

        if (userError) throw userError

        if (validUsers && validUsers.length > 0) {
          const tagInserts = validUsers.map((user) => ({
            post_id: post.id,
            tagged_user_id: user.id,
          }))

          const { error: tagError } = await supabase.from("post_tags").insert(tagInserts)
          if (tagError) throw tagError
        }
      }

      // 🧹 Reset form
      setContent("")
      setImageFile(null)
      setImagePreview(null)
      setVideoFile(null)
      setVideoPreview(null)
      router.refresh()
    } catch (error) {
      console.error("Error creating post:", error)
      alert(error instanceof Error ? error.message : "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  // 💫 Wishlist helper (unchanged)
  const handleAddWishlistItem = async (item: string) => {
    const supabase = createClient()
    const { error: wishlistError } = await supabase.from("wishlist_items").insert({
      user_id: userId,
      item,
      description: null,
      link: null,
    })
    if (wishlistError) throw wishlistError

    const postContent = `I added something to my Wishlist:\n\n${item}`
    const { error: postError } = await supabase.from("posts").insert({
      author_id: userId,
      content: postContent,
      image_url: null,
      video_url: null,
    })
    if (postError) throw postError
    router.refresh()
  }

  return (
    <Card className="border-amber-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share something with your family..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="resize-none"
          />

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="rounded-lg w-full object-cover max-h-64"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2"
              >
                Remove
              </Button>
            </div>
          )}

          {videoPreview && (
            <div className="relative">
              <video src={videoPreview} controls className="rounded-lg w-full max-h-64" />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveVideo}
                className="absolute top-2 right-2"
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex gap-2 justify-between items-center flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={isLoading}
              />
              <label htmlFor="image-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-900 hover:bg-amber-50 cursor-pointer bg-transparent"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById("image-upload")?.click()
                  }}
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </label>

              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="video-upload"
                disabled={isLoading}
              />
              <label htmlFor="video-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-900 hover:bg-amber-50 cursor-pointer bg-transparent"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById("video-upload")?.click()
                  }}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </label>

              <WishlistDialog onSubmit={handleAddWishlistItem} />
            </div>

            <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
