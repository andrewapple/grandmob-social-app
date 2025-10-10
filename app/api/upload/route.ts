import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes for large video uploads
export const maxBodySize = "100mb"

export async function POST(request: Request) {
  try {
    console.log("one");
    const formData = await request.formData()
    console.log("two");
    const file = formData.get("file") as File
    console.log("three");
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Uploading file:", file.name, file.size, file.type);

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 100MB limit" }, { status: 413 })
    }

    const blob = await put(file.name, file, {
      access: "public",
    })

    console.log("Upload successful:", blob.url);

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
