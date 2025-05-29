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
  
  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    // Add any other protected routes here
  ],
}; 