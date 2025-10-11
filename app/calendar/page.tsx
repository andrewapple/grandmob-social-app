import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { CalendarView } from "@/components/calendar-view"

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <CalendarView userId={user.id} />
      </main>
    </div>
  )
}
