import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // You can pass client configuration here
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}); 