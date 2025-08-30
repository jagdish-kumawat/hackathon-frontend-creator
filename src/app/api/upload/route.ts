import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Configure for large file uploads
export const runtime = "nodejs";

// Set maximum duration to 5 minutes for large uploads
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as ArrayBuffer for large files
    const contentLength = request.headers.get("content-length");

    if (contentLength) {
      const size = parseInt(contentLength);
      const maxSize = 200 * 1024 * 1024; // 200MB

      if (size > maxSize) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 200MB." },
          { status: 413 }
        );
      }
    }

    // For now, we'll just forward to the actual API
    // This is a placeholder to handle the Next.js configuration
    const formData = await request.formData();

    return NextResponse.json(
      {
        message: "Upload endpoint - this should forward to your actual API",
        size: contentLength,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
