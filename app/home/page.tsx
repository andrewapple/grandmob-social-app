import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { PostCard } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get all posts from all users
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        id,
        name,
        username,
        avatar_url
      )
    `,
    )
    .order("created_at", { ascending: false })

  const usernameToIdMap: Record<string, string> = {}
  if (posts) {
    for (const post of posts) {
      if (post.profiles?.username) {
        usernameToIdMap[post.profiles.username] = post.profiles.id
      }
    }
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-amber-50 to-orange-50">
      <NavBar />

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-amber-900">Family Feed</h1>
          <p className="text-amber-700">See what the fam is up to</p>
        </div>

        <CreatePost userId={user.id} userName={user.user_metadata?.name || "User"} />

        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} usernameToIdMap={usernameToIdMap} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-amber-200">
              <p className="text-amber-700">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
