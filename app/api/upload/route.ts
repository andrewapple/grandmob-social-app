import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";        // ensures not running in edge
export const maxDuration = 60;          // optional: allow longer uploads
export const maxBodySize = "20mb";      // ✅ new way to increase upload size limit

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

