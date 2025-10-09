"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, Send, Video } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CreatePostProps {
  userId: string
}

export function CreatePost({ userId }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !imageFile && !videoFile) {
      alert("Please add some content, an image, or a video")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      let imageUrl: string | null = null
      let videoUrl: string | null = null

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const data = await response.json()
        imageUrl = data.url
      }

      if (videoFile) {
        const formData = new FormData()
        formData.append("file", videoFile)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload video")
        }

        const data = await response.json()
        videoUrl = data.url
      }

      const { error } = await supabase.from("posts").insert({
        author_id: userId,
        content: content.trim() || null,
        image_url: imageUrl,
        video_url: videoUrl,
      })

      if (error) throw error

      setContent("")
      setImageFile(null)
      setImagePreview(null)
      setVideoFile(null)
      setVideoPreview(null)
      router.refresh()
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post")
    } finally {
      setIsLoading(false)
    }
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

          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2">
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
