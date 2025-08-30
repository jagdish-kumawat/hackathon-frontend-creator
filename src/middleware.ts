import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Add headers to support large file uploads
  const response = NextResponse.next();

  // Set headers for file upload routes
  if (request.nextUrl.pathname.startsWith("/api/files")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  return response;
}

export const config = {
  matcher: ["/api/files/:path*"],
};
