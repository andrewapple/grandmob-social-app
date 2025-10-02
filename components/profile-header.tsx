"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Check, X, Camera } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
}

interface ProfileHeaderProps {
  profile: Profile | null
  isOwnProfile: boolean
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState(profile?.bio || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const router = useRouter()

  const handleSaveBio = async () => {
    if (!profile) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio: bio.trim() || null })
        .eq("id", profile.id)

      if (error) throw error

      setIsEditingBio(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating bio:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setBio(profile?.bio || "")
    setIsEditingBio(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setIsUploadingAvatar(true)

    try {
      // Upload to Vercel Blob
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()

      // Update profile with new avatar URL
      const supabase = createClient()
      const { error } = await supabase.from("profiles").update({ avatar_url: data.url }).eq("id", profile.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert("Failed to upload profile photo")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Generate animal avatar based on user ID
  const getAnimalAvatar = (id: string) => {
    const animals = ["🦁", "🐼", "🦊", "🐨", "🐸", "🦉", "🐷", "🐮", "🐵", "🐶"]
    const index = Number.parseInt(id.slice(0, 8), 16) % animals.length
    return animals[index]
  }

  if (!profile) return null

  return (
    <Card className="border-amber-200">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-amber-200">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
              <AvatarFallback className="text-5xl bg-amber-100">{getAnimalAvatar(profile.id)}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <div className="absolute bottom-0 right-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                  disabled={isUploadingAvatar}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 w-10 rounded-full bg-amber-600 hover:bg-amber-700 cursor-pointer"
                    disabled={isUploadingAvatar}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById("avatar-upload")?.click()
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2 w-full">
            <h1 className="text-3xl font-bold text-amber-900">{profile.name}</h1>

            {isOwnProfile && (
              <div className="space-y-2">
                {isEditingBio ? (
                  <div className="space-y-2">
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell your family about yourself..."
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={handleSaveBio}
                        disabled={isLoading}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-amber-700 text-pretty leading-relaxed">
                      {profile.bio || "No bio yet. Click edit to add one!"}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingBio(true)}
                      className="border-amber-300 text-amber-900 hover:bg-amber-50"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit Bio
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!isOwnProfile && profile.bio && (
              <p className="text-amber-700 text-pretty leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
