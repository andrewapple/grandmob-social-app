"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, User, LogOut, Calendar, Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMobileMenuOpen(false)
    router.push("/")
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-amber-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/home">
            <h1 className="text-2xl font-bold text-amber-900">Grandmob</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-amber-900 hover:bg-amber-50"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-2 border-t border-amber-200 pt-4">
            <Link href="/home" onClick={closeMobileMenu}>
              <Button
                variant={pathname === "/home" ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${pathname === "/home" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-900 hover:bg-amber-50"}`}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>

            <Link href="/calendar" onClick={closeMobileMenu}>
              <Button
                variant={pathname === "/calendar" ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${pathname === "/calendar" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-900 hover:bg-amber-50"}`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>

            <Link href="/profile" onClick={closeMobileMenu}>
              <Button
                variant={pathname === "/profile" ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${pathname === "/profile" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-900 hover:bg-amber-50"}`}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-amber-900 hover:bg-amber-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
