import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  // Check if accessing protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const sessionCookie = getSessionCookie(request);
    
    if (!sessionCookie) {
      // Redirect to sign-in page if no session
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // Note: Removed authentication requirement for /api/meetingbrief
  // The API route itself now handles anonymous users with limits
  
  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    // Removed API protection - let API routes handle their own auth/limits
  ],
}; 