import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import { Pool } from "pg";
import Stripe from "stripe";

// This file should ONLY be imported by server-side code (API routes)
// It contains secrets and should never be bundled with client code

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for Better Auth");
}

if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET or AUTH_SECRET environment variable is required");
}

// Initialize Stripe client (only if Stripe keys are provided)
const stripeClient = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    })
  : undefined;

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optimize for serverless environments like Vercel
    max: 10, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Timeout after 10 seconds if connection can't be established
  }),
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "https://meetingbrief.com",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
    minPasswordLength: 8,
  },
  session: {
    // Use default cookie-based sessions for simplicity and security
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
    // Session expires after 7 days
    expiresIn: 60 * 60 * 24 * 7,
  },
  // Trust proxy headers (important for Vercel)
  trustedOrigins: process.env.NODE_ENV === "production" 
    ? [
        process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "https://meetingbrief.com",
        "https://meetingbrief.com",
        "https://www.meetingbrief.com"
      ]
    : ["http://localhost:3000", "http://localhost:3001"],
  plugins: [
    // Add Stripe plugin if configured
    ...(stripeClient && process.env.STRIPE_WEBHOOK_SECRET ? [
      stripe({
        stripeClient,
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        createCustomerOnSignUp: true,
        subscription: {
          enabled: true,
          requireEmailVerification: false,
          checkoutOptions: {
            allow_promotion_codes: true,
          },
          plans: [
            {
              name: "free",
              priceId: "", // No price ID for free plan
              limits: {
                briefsPerMonth: 5,
                storage: 1, // GB
              },
            },
            {
              name: "starter",
              priceId: process.env.STRIPE_STARTER_PRICE_ID!,
              limits: {
                briefsPerMonth: 50,
                storage: 5, // GB
              },
            },
            {
              name: "growth",
              priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
              limits: {
                briefsPerMonth: 150,
                storage: 50, // GB
              },
            },
            {
              name: "scale",
              priceId: process.env.STRIPE_SCALE_PRICE_ID!,
              limits: {
                briefsPerMonth: 500,
                storage: 500, // GB
              },
            },
          ],
          onSubscriptionComplete: async ({ subscription, plan }) => {
            console.log(`Subscription created: ${subscription.id} for plan: ${plan.name}`);
          },
          onSubscriptionCancel: async ({ subscription }) => {
            console.log(`Subscription canceled: ${subscription.id}`);
          },
        },
        onCustomerCreate: async ({ customer, user }) => {
          console.log(`Stripe customer created: ${customer.id} for user: ${user.id}`);
        },
      })
    ] : []),
  ],
}); 