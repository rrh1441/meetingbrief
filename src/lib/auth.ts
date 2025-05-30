// Client-safe re-export of auth
// This file can be safely imported by client-side code
// All secrets are in auth-server.ts which should only be imported by API routes

export type { Session, User } from "better-auth/types";

// For client-side usage, import from auth-client.ts instead
// For server-side usage in API routes, import from auth-server.ts 