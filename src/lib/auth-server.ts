import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import { Pool } from "pg";
import Stripe from "stripe";
import { Resend } from "resend";

// This file should ONLY be imported by server-side code (API routes)
// It contains secrets and should never be bundled with client code

// Validate required environment variables (but allow build-time without DATABASE_URL)
const isBuilding = process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.DATABASE_URL;

if (!process.env.DATABASE_URL && !isBuilding) {
  throw new Error("DATABASE_URL environment variable is required for Better Auth");
}

if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET && !isBuilding) {
  throw new Error("BETTER_AUTH_SECRET or AUTH_SECRET environment variable is required");
}

// Initialize Stripe client (only if Stripe keys are provided)
const stripeClient = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    })
  : undefined;

// Initialize Resend client (only if API key is provided)
const resendClient = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : undefined;

export const auth = betterAuth({
  database: process.env.DATABASE_URL ? new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optimize for serverless environments like Vercel
    max: 10, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Timeout after 10 seconds if connection can't be established
  }) : new Pool({ connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy' }), // Dummy for build
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'dummy-secret-for-build',
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "https://meetingbrief.com",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Make email verification optional
    minPasswordLength: 8,
    autoSignInAfterVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendEmail: async (data: { user: { email: string; name?: string }; url: string; token: string }) => {
      if (!resendClient) {
        console.log('[Email] Resend client not configured, skipping email verification');
        return;
      }
      
      try {
        await resendClient.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@meetingbrief.com',
          to: [data.user.email],
          subject: 'Verify your MeetingBrief account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to MeetingBrief!</h2>
              <p>Hi ${data.user.name || data.user.email},</p>
              <p>Thanks for signing up! Please click the button below to verify your email address:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.url}" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #666;">${data.url}</p>
              <p>This link will expire in 24 hours.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666;">
                If you didn&apos;t create an account with MeetingBrief, you can safely ignore this email.
              </p>
            </div>
          `
        });
        console.log(`[Email] Verification email sent to ${data.user.email}`);
      } catch (error) {
        console.error('[Email] Failed to send verification email:', error);
        throw error;
      }
    },
  },
  forgetPassword: {
    enabled: true,
    sendEmail: async (data: { user: { email: string; name?: string }; url: string; token: string }) => {
      if (!resendClient) {
        console.log('[Email] Resend client not configured, skipping password reset email');
        return;
      }
      
      try {
        await resendClient.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@meetingbrief.com',
          to: [data.user.email],
          subject: 'Reset your MeetingBrief password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Reset Your Password</h2>
              <p>Hi ${data.user.name || data.user.email},</p>
              <p>We received a request to reset your password for your MeetingBrief account.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.url}" 
                   style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #666;">${data.url}</p>
              <p>This link will expire in 1 hour.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666;">
                If you didn&apos;t request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </div>
          `
        });
        console.log(`[Email] Password reset email sent to ${data.user.email}`);
      } catch (error) {
        console.error('[Email] Failed to send password reset email:', error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
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
              priceId: "price_1Rls0QLAwHJFmbPEVdKusne7",
              limits: {
                briefsPerMonth: 50,
                storage: 5, // GB
              },
            },
            {
              name: "credits_addon",
              priceId: "price_1Rls2RLAwHJFmbPEHIWlzIWO",
              limits: {
                briefsPerMonth: -1, // One-time purchase, no monthly limit
                storage: 0, // No additional storage
                creditsToAdd: 50, // Add 50 credits
              },
            },
          ],
          getCheckoutSessionParams: async () => {
            return {
              params: {
                allow_promotion_codes: true,
                billing_address_collection: 'auto',
                tax_id_collection: {
                  enabled: true
                },
                customer_update: {
                  name: 'auto',
                  address: 'auto'
                },
                custom_text: {
                  submit: {
                    message: "We'll start your subscription right away"
                  }
                }
              }
            };
          },
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