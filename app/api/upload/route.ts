import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const filePath = `videos/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage.from("videos").upload(filePath, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  const { data: publicUrl } = supabase.storage.from("videos").getPublicUrl(filePath)

  return NextResponse.json({ url: publicUrl.publicUrl })
}
