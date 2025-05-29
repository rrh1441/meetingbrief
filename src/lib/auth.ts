import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for Better Auth");
}

if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET or AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optimize for serverless environments like Vercel
    max: 10, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Timeout after 10 seconds if connection can't be established
  }),
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
    // Session expires after 7 days
    expiresIn: 60 * 60 * 24 * 7,
  },
  // Trust proxy headers (important for Vercel)
  trustedOrigins: process.env.NODE_ENV === "production" 
    ? [process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || ""] 
    : ["http://localhost:3000", "http://localhost:3001"],
  plugins: [
    nextCookies(), // This should be the last plugin in the array
  ],
}); 