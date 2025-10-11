"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface WishlistItem {
  id: string
  item: string
  description: string | null
  link: string | null
  created_at: string
}

interface WishlistBoxProps {
  userId: string
  isOwnProfile: boolean
}

export function WishlistBox({ userId, isOwnProfile }: WishlistBoxProps) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchWishlistItems()
  }, [userId])

  const fetchWishlistItems = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching wishlist:", error)
    } else {
      setItems(data || [])
    }
    setIsLoading(false)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this item from your wishlist?")) return

    const supabase = createClient()
    const { error } = await supabase.from("wishlist_items").delete().eq("id", itemId)

    if (error) {
      console.error("Error deleting wishlist item:", error)
      alert("Failed to delete item")
    } else {
      setItems(items.filter((item) => item.id !== itemId))
      router.refresh()
    }
  }

  if (isLoading) {
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Wishlist</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-600 text-sm">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-amber-600 text-sm">
            {isOwnProfile
              ? "Your wishlist is empty. Add items to let your family know what you'd like!"
              : "No items in wishlist yet."}
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                <span className="text-amber-900 break-words flex-1">{item.item}</span>
                {isOwnProfile && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
