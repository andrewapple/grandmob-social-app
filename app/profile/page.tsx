import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { ProfileHeader } from "@/components/profile-header"
import { PostCard } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        id,
        name,
        avatar_url
      )
    `,
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-svh bg-gradient-to-br from-amber-50 to-orange-50">
      <NavBar />

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <ProfileHeader profile={profile} isOwnProfile={true} />

        <CreatePost userId={user.id} />

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-900">Your Posts</h2>
          {posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-amber-200">
              <p className="text-amber-700">You haven&apos;t posted anything yet. Share your first moment above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
