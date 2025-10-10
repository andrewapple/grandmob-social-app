// /app/api/upload/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.yegpxumejnwdglchzydm.supabase.co!,
      process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZ3B4dW1lam53ZGdsY2h6eWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE3MzA0MywiZXhwIjoyMDc0NzQ5MDQzfQ.kdZQGNEv5-1j-LIbdhfHQzPm0SFA30mhKXWyQJSiAbo! 
    )

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `videos/${fileName}`

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (error) {
    console.error("Upload failed:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
