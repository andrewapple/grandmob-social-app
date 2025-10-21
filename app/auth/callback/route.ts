import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // If it's a password recovery flow, redirect to update password page
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/auth/update-password`)
  }

  // If there's a next parameter, redirect there
  if (next) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Default: redirect to home page after successful email confirmation
  return NextResponse.redirect(`${origin}/home`)
}
