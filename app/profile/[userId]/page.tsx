import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { ProfileHeader } from "@/components/profile-header"
import { PostCard } from "@/components/post-card"
import { WishlistBox } from "@/components/wishlist-box"

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { userId } = params

  // Get the profile of the user being viewed
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (!profile) {
    redirect("/home")
  }

  // Check if viewing own profile
  const isOwnProfile = user.id === userId

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        id,
        name,
        avatar_url,
        username
      )
    `,
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false })

  const usernameToIdMap: Record<string, string> = {}

posts?.forEach((post) => {
  if (post.profiles?.username) {
    usernameToIdMap[post.profiles.username] = post.profiles.id
  }
})

  return (
    <div className="min-h-svh bg-gradient-to-br from-amber-50 to-orange-50">
      <NavBar />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-900">
                {isOwnProfile ? "Your Posts" : `${profile.name}'s Posts`}
              </h2>
              {posts && posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} usernameToIdMap={usernameToIdMap} />)
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-amber-200">
                  <p className="text-amber-700">
                    {isOwnProfile ? "You haven't posted anything yet." : `${profile.name} hasn't posted anything yet.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <WishlistBox userId={userId} isOwnProfile={isOwnProfile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
