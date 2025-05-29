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

  // Check if accessing premium features that require subscription
  if (request.nextUrl.pathname.startsWith("/api/meetingbrief")) {
    const sessionCookie = getSessionCookie(request);
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Note: Full subscription checking would require a database call
    // For now, we'll let the API route handle subscription validation
  }
  
  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    // Protect API routes (optional - for future subscription gating)
    "/api/meetingbrief/:path*",
  ],
}; 