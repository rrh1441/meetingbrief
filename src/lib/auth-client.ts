import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  // Automatically use the current domain in production, localhost for development
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // Additional fetch options for better error handling
  fetchOptions: {
    onError: (e) => {
      // Log authentication errors for debugging
      if (process.env.NODE_ENV === "development") {
        console.error("Auth client error:", e);
      }
    },
  },
  
  plugins: [
    stripeClient({
      subscription: true, // Enable subscription management
    }),
  ],
}); 