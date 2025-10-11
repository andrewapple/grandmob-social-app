"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, User, LogOut, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="bg-white border-b border-amber-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/home">
            <h1 className="text-2xl font-bold text-amber-900">Grandmob</h1>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/home">
              <Button
                variant={pathname === "/home" ? "default" : "ghost"}
                size="sm"
                className={
                  pathname === "/home" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-900 hover:bg-amber-50"
                }
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>

            <Link href="/calendar">
              <Button
                variant={pathname === "/calendar" ? "default" : "ghost"}
                size="sm"
                className={
                  pathname === "/calendar" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-900 hover:bg-amber-50"
                }
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>

            <Link href="/profile">
              <Button
                variant={pathname === "/profile" ? "default" : "ghost"}
                size="sm"
                className={
                  pathname === "/profile" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-900 hover:bg-amber-50"
                }
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-amber-900 hover:bg-amber-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
