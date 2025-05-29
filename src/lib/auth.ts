import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const auth = betterAuth({
  database: createClient(supabaseUrl, supabaseServiceKey),
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    nextCookies(), // This should be the last plugin in the array
  ],
}); 