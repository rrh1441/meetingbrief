import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  // Skip middleware entirely for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

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
    // Process all routes but skip API routes in the middleware function itself
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 